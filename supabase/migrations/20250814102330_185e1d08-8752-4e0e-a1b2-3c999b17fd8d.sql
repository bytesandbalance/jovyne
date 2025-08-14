-- Notify planner when helper sends invoice; notify helper when planner marks paid
-- Update transition function to emit messages and backfill missing notifications
CREATE OR REPLACE FUNCTION public.enforce_helper_invoice_transitions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  old_status TEXT := (CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.status::text, 'draft') ELSE NULL END);
  new_status TEXT := NEW.status::text;
  planner_user_id uuid;
  helper_user_id uuid;
BEGIN
  -- Lock any edits after completed
  IF (OLD.status = 'completed'::public.helper_invoice_status) THEN
    RAISE EXCEPTION 'Invoice is completed and cannot be modified';
  END IF;

  -- Resolve auth user ids
  SELECT p.user_id INTO planner_user_id FROM public.planners p WHERE p.id = COALESCE(NEW.planner_id, OLD.planner_id);
  SELECT h.user_id INTO helper_user_id FROM public.helpers h WHERE h.id = COALESCE(NEW.helper_id, OLD.helper_id);

  -- Allowed transitions + notifications
  IF old_status = 'draft' AND (new_status = 'sent_to_planner' OR new_status = 'awaiting_payment') THEN
    NEW.sent_at := COALESCE(NEW.sent_at, now());
    NEW.status := 'awaiting_payment';

    -- Notify planner that an invoice was sent
    INSERT INTO public.messages (sender_id, recipient_id, subject, message)
    VALUES (
      helper_user_id,
      planner_user_id,
      'Invoice Received',
      'You have received an invoice from ' || COALESCE(NEW.helper_name,'a helper') ||
      ' for ' || COALESCE(NEW.job_title,'a job') ||
      '. Amount: ' || COALESCE(NEW.amount, 0)::text || '. Please review and mark as paid.'
    );

  ELSIF old_status = 'awaiting_payment' AND new_status = 'paid_planner' THEN
    NEW.paid_at := COALESCE(NEW.paid_at, now());

    -- Notify helper that planner marked as paid
    INSERT INTO public.messages (sender_id, recipient_id, subject, message)
    VALUES (
      planner_user_id,
      helper_user_id,
      'Invoice Marked as Paid',
      'Your invoice for ' || COALESCE(NEW.job_title,'the job') || ' was marked as paid. Please confirm receipt to complete.'
    );

  ELSIF old_status = 'paid_planner' AND new_status = 'completed' THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());
  ELSE
    -- Allow idempotent updates with same status (metadata edits)
    IF old_status = new_status THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Invalid status transition from % to %', old_status, new_status;
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure trigger still attached
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE t.tgname = 'trg_enforce_helper_invoice_transitions'
      AND n.nspname = 'public'
  ) THEN
    CREATE TRIGGER trg_enforce_helper_invoice_transitions
    BEFORE UPDATE ON public.helper_invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_helper_invoice_transitions();
  END IF;
END $$;

-- Backfill: create notifications for any existing invoices already awaiting_payment without a prior 'Invoice Received' message
WITH inv AS (
  SELECT i.*, p.user_id AS planner_user_id, h.user_id AS helper_user_id
  FROM public.helper_invoices i
  JOIN public.planners p ON p.id = i.planner_id
  JOIN public.helpers h ON h.id = i.helper_id
  WHERE i.status = 'awaiting_payment'
), missing AS (
  SELECT inv.*
  FROM inv
  WHERE NOT EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.recipient_id = inv.planner_user_id
      AND m.sender_id = inv.helper_user_id
      AND m.subject = 'Invoice Received'
      AND m.created_at >= COALESCE(inv.sent_at, inv.created_at) - interval '1 day'
  )
)
INSERT INTO public.messages (sender_id, recipient_id, subject, message)
SELECT helper_user_id, planner_user_id, 'Invoice Received',
       'You have received an invoice from ' || COALESCE(inv.helper_name,'a helper') ||
       ' for ' || COALESCE(inv.job_title,'a job') || '. Amount: ' || COALESCE(inv.amount, 0)::text || '.'
FROM missing inv;
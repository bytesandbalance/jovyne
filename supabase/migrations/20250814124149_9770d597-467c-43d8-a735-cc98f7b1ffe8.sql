-- Add notification on helper confirmation (paid_planner -> completed)
CREATE OR REPLACE FUNCTION public.enforce_helper_invoice_transitions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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

    -- Notify planner that helper confirmed receipt
    INSERT INTO public.messages (sender_id, recipient_id, subject, message)
    VALUES (
      helper_user_id,
      planner_user_id,
      'Invoice Completed',
      'The helper has confirmed receipt for ' || COALESCE(NEW.job_title,'the job') || '. This invoice is now completed.'
    );
  ELSE
    -- Allow idempotent updates with same status (metadata edits)
    IF old_status = new_status THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Invalid status transition from % to %', old_status, new_status;
  END IF;

  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists on helper_invoices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_enforce_helper_invoice_transitions'
  ) THEN
    CREATE TRIGGER trg_enforce_helper_invoice_transitions
    BEFORE UPDATE ON public.helper_invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_helper_invoice_transitions();
  END IF;
END
$$;

-- Backfill notifications for recently completed invoices (last 2 days) without a completion message
INSERT INTO public.messages (sender_id, recipient_id, subject, message)
SELECT h.user_id AS sender_id,
       p.user_id AS recipient_id,
       'Invoice Completed' AS subject,
       'The helper has confirmed receipt for ' || COALESCE(hi.job_title,'the job') || '. This invoice is now completed.' AS message
FROM public.helper_invoices hi
JOIN public.helpers h ON h.id = hi.helper_id
JOIN public.planners p ON p.id = hi.planner_id
WHERE hi.status = 'completed'::public.helper_invoice_status
  AND hi.completed_at IS NOT NULL
  AND hi.completed_at >= now() - interval '2 days'
  AND NOT EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.subject = 'Invoice Completed'
      AND m.sender_id = h.user_id
      AND m.recipient_id = p.user_id
      AND m.created_at >= hi.completed_at - interval '5 minutes'
      AND m.created_at <= hi.completed_at + interval '5 minutes'
  );
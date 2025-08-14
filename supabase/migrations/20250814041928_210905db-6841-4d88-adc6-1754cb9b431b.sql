-- Fix invalid invoice status transition and ensure trigger exists
-- 1) Update the enforce_helper_invoice_transitions function to accept both
--    'sent_to_planner' and direct 'awaiting_payment' from 'draft'
CREATE OR REPLACE FUNCTION public.enforce_helper_invoice_transitions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  old_status TEXT := (CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.status::text, 'draft') ELSE NULL END);
  new_status TEXT := NEW.status::text;
BEGIN
  -- Lock any edits after completed
  IF (OLD.status = 'completed'::public.helper_invoice_status) THEN
    RAISE EXCEPTION 'Invoice is completed and cannot be modified';
  END IF;

  -- Allowed transitions
  IF old_status = 'draft' AND (new_status = 'sent_to_planner' OR new_status = 'awaiting_payment') THEN
    NEW.sent_at := COALESCE(NEW.sent_at, now());
    NEW.status := 'awaiting_payment';
  ELSIF old_status = 'awaiting_payment' AND new_status = 'paid_planner' THEN
    NEW.paid_at := COALESCE(NEW.paid_at, now());
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

-- 2) Ensure the trigger is attached to helper_invoices (idempotent creation)
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
-- A) Clean up existing duplicate invoices (keep latest per application)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY helper_application_id
           ORDER BY created_at DESC, updated_at DESC, id DESC
         ) AS rn
  FROM public.helper_invoices
  WHERE helper_application_id IS NOT NULL
)
DELETE FROM public.helper_invoices hi
USING ranked r
WHERE hi.id = r.id AND r.rn > 1;

-- B) Recreate idempotent approval function (prevents duplicate invoices/messages)
CREATE OR REPLACE FUNCTION public.create_helper_invoice_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  hr RECORD;
  planner_user_id UUID;
  helper_user_id UUID;
  planner_profile RECORD;
  helper_profile RECORD;
  rate NUMERIC;
  hours NUMERIC;
  amt NUMERIC;
  already_has_invoice BOOLEAN := FALSE;
  dup_msg BOOLEAN := FALSE;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Load related request
    SELECT * INTO hr FROM public.helper_requests WHERE id = NEW.helper_request_id;

    -- Determine planner and helper auth user ids
    IF hr IS NOT NULL THEN
      SELECT p.user_id INTO planner_user_id FROM public.planners p WHERE p.id = hr.planner_id;
    END IF;
    SELECT h.user_id INTO helper_user_id FROM public.helpers h WHERE h.id = NEW.helper_id;

    -- Fallbacks to avoid NULLs and satisfy messages RLS (sender must be auth.uid())
    planner_user_id := COALESCE(planner_user_id, auth.uid());
    helper_user_id := COALESCE(helper_user_id, (SELECT h.user_id FROM public.helpers h WHERE h.id = NEW.helper_id));

    -- Handle approval/acceptance: create invoice and notify
    IF NEW.status::text IN ('approved','accepted') THEN
      IF hr IS NULL THEN
        RETURN NEW;
      END IF;

      -- Idempotency: only create one invoice per application
      SELECT EXISTS (
        SELECT 1 FROM public.helper_invoices hi WHERE hi.helper_application_id = NEW.id
      ) INTO already_has_invoice;

      IF NOT already_has_invoice THEN
        SELECT pr.full_name, pr.email, pr.phone INTO planner_profile FROM public.profiles pr WHERE pr.user_id = planner_user_id;
        SELECT pr.full_name INTO helper_profile FROM public.profiles pr WHERE pr.user_id = helper_user_id;

        rate := COALESCE(NEW.hourly_rate, hr.hourly_rate, 0);
        hours := COALESCE(hr.total_hours, 0);
        amt := rate * hours;

        INSERT INTO public.helper_invoices (
          planner_id,
          helper_id,
          helper_application_id,
          helper_request_id,
          event_id,
          job_title,
          planner_name,
          planner_contact_email,
          planner_contact_phone,
          helper_name,
          event_date,
          hourly_rate,
          total_hours,
          amount,
          status
        )
        VALUES (
          hr.planner_id,
          NEW.helper_id,
          NEW.id,
          hr.id,
          hr.event_id,
          hr.title,
          planner_profile.full_name,
          planner_profile.email,
          planner_profile.phone,
          helper_profile.full_name,
          hr.event_date,
          rate,
          hours,
          amt,
          'draft'
        );
      END IF;

      -- Notify helper of approval and invoice creation (dedupe within 2 minutes)
      IF planner_user_id IS NOT NULL AND helper_user_id IS NOT NULL THEN
        SELECT EXISTS(
          SELECT 1 FROM public.messages m
          WHERE m.sender_id = planner_user_id
            AND m.recipient_id = helper_user_id
            AND m.subject = 'Application Approved'
            AND m.created_at > now() - interval '2 minutes'
        ) INTO dup_msg;

        IF NOT dup_msg THEN
          INSERT INTO public.messages (sender_id, recipient_id, subject, message)
          VALUES (
            planner_user_id,
            helper_user_id,
            'Application Approved',
            'Your application for ' || COALESCE(hr.title,'the job') || ' has been approved. An invoice form has been created in your dashboard. Please review, complete, and send it to the planner.'
          );
        END IF;
      END IF;

    ELSIF NEW.status::text = 'rejected' THEN
      -- Notify helper of rejection (dedupe within 2 minutes)
      IF planner_user_id IS NOT NULL AND helper_user_id IS NOT NULL THEN
        SELECT EXISTS(
          SELECT 1 FROM public.messages m
          WHERE m.sender_id = planner_user_id
            AND m.recipient_id = helper_user_id
            AND m.subject = 'Application Rejected'
            AND m.created_at > now() - interval '2 minutes'
        ) INTO dup_msg;

        IF NOT dup_msg THEN
          INSERT INTO public.messages (sender_id, recipient_id, subject, message)
          VALUES (
            planner_user_id,
            helper_user_id,
            'Application Rejected',
            'Your application for ' || COALESCE(hr.title,'the job') || ' was not approved. Thank you for applying.'
          );
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- C) Ensure a single, AFTER UPDATE trigger on helper_applications
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT trigger_name
    FROM information_schema.triggers
    WHERE event_object_schema = 'public'
      AND event_object_table = 'helper_applications'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.helper_applications;', r.trigger_name);
  END LOOP;
END $$;

CREATE TRIGGER trg_helper_app_on_status_change
AFTER UPDATE OF status ON public.helper_applications
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.create_helper_invoice_on_approval();

-- D) Enforce uniqueness going forward
CREATE UNIQUE INDEX IF NOT EXISTS ux_helper_invoices_application
ON public.helper_invoices (helper_application_id)
WHERE helper_application_id IS NOT NULL;

-- E) Dedupe messages in invoice transitions as a safeguard
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
  dup_msg BOOLEAN := FALSE;
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

    -- Notify planner that an invoice was sent (dedupe within 2 minutes)
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = helper_user_id
        AND m.recipient_id = planner_user_id
        AND m.subject = 'Invoice Received'
        AND m.created_at > now() - interval '2 minutes'
    ) INTO dup_msg;

    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        helper_user_id,
        planner_user_id,
        'Invoice Received',
        'You have received an invoice from ' || COALESCE(NEW.helper_name,'a helper') ||
        ' for ' || COALESCE(NEW.job_title,'a job') ||
        '. Amount: ' || COALESCE(NEW.amount, 0)::text || '. Please review and mark as paid.'
      );
    END IF;

  ELSIF old_status = 'awaiting_payment' AND new_status = 'paid_planner' THEN
    NEW.paid_at := COALESCE(NEW.paid_at, now());

    -- Notify helper that planner marked as paid (dedupe within 2 minutes)
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = planner_user_id
        AND m.recipient_id = helper_user_id
        AND m.subject = 'Invoice Marked as Paid'
        AND m.created_at > now() - interval '2 minutes'
    ) INTO dup_msg;

    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        planner_user_id,
        helper_user_id,
        'Invoice Marked as Paid',
        'Your invoice for ' || COALESCE(NEW.job_title,'the job') || ' was marked as paid. Please confirm receipt to complete.'
      );
    END IF;

  ELSIF old_status = 'paid_planner' AND new_status = 'completed' THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());

    -- Notify planner that helper confirmed receipt (dedupe within 2 minutes)
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = helper_user_id
        AND m.recipient_id = planner_user_id
        AND m.subject = 'Invoice Completed'
        AND m.created_at > now() - interval '2 minutes'
    ) INTO dup_msg;

    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        helper_user_id,
        planner_user_id,
        'Invoice Completed',
        'The helper has confirmed receipt for ' || COALESCE(NEW.job_title,'the job') || '. This invoice is now completed.'
      );
    END IF;
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

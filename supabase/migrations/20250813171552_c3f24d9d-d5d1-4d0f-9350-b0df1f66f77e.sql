-- Helper application notifications, invoicing trigger, and invoice transitions

-- 1) Update function to handle approval (create invoice + message) and rejection (message only)
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
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Load related request
    SELECT * INTO hr FROM public.helper_requests WHERE id = NEW.helper_request_id;

    -- Determine planner and helper auth user ids
    IF hr IS NOT NULL THEN
      SELECT p.user_id INTO planner_user_id FROM public.planners p WHERE p.id = hr.planner_id;
    END IF;
    SELECT h.user_id INTO helper_user_id FROM public.helpers h WHERE h.id = NEW.helper_id;

    -- Handle approval/acceptance: create invoice and notify
    IF NEW.status::text IN ('approved','accepted') THEN
      IF hr IS NULL THEN
        RETURN NEW;
      END IF;

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

      -- Notify helper of approval and invoice creation
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        planner_user_id,
        helper_user_id,
        'Application Approved',
        'Your application for ' || COALESCE(hr.title,'the job') || ' has been approved. An invoice form has been created in your dashboard. Please review, complete, and send it to the planner.'
      );

    ELSIF NEW.status::text = 'rejected' THEN
      -- Notify helper of rejection
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        planner_user_id,
        helper_user_id,
        'Application Rejected',
        'Your application for ' || COALESCE(hr.title,'the job') || ' was not approved. Thank you for applying.'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 2) Attach trigger to helper_applications for status changes (create invoice + notifications)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_helper_applications_on_status_change'
  ) THEN
    CREATE TRIGGER trg_helper_applications_on_status_change
    AFTER UPDATE ON public.helper_applications
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.create_helper_invoice_on_approval();
  END IF;
END $$;

-- 3) Enforce valid helper invoice status transitions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_enforce_helper_invoice_transitions'
  ) THEN
    CREATE TRIGGER trg_enforce_helper_invoice_transitions
    BEFORE UPDATE ON public.helper_invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_helper_invoice_transitions();
  END IF;
END $$;

-- 4) Updated-at triggers for helper tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_helper_invoices_updated_at'
  ) THEN
    CREATE TRIGGER update_helper_invoices_updated_at
    BEFORE UPDATE ON public.helper_invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_helper_applications_updated_at'
  ) THEN
    CREATE TRIGGER update_helper_applications_updated_at
    BEFORE UPDATE ON public.helper_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
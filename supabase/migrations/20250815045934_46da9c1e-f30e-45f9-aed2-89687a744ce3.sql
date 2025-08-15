-- Patch create_helper_invoice_on_approval to ensure non-null sender_id and satisfy RLS
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

    -- Fallbacks to avoid NULLs and satisfy messages RLS (sender must be auth.uid())
    planner_user_id := COALESCE(planner_user_id, auth.uid());
    helper_user_id := COALESCE(helper_user_id, (SELECT h.user_id FROM public.helpers h WHERE h.id = NEW.helper_id));

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

      -- Notify helper of approval and invoice creation (only if IDs are present)
      IF planner_user_id IS NOT NULL AND helper_user_id IS NOT NULL THEN
        INSERT INTO public.messages (sender_id, recipient_id, subject, message)
        VALUES (
          planner_user_id,
          helper_user_id,
          'Application Approved',
          'Your application for ' || COALESCE(hr.title,'the job') || ' has been approved. An invoice form has been created in your dashboard. Please review, complete, and send it to the planner.'
        );
      END IF;

    ELSIF NEW.status::text = 'rejected' THEN
      -- Notify helper of rejection (only if IDs are present)
      IF planner_user_id IS NOT NULL AND helper_user_id IS NOT NULL THEN
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

  RETURN NEW;
END;
$function$;
-- Create function to automatically create helper invoices when requests are approved
CREATE OR REPLACE FUNCTION public.create_helper_invoice_on_request_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  requester_user_id uuid;
  helper_user_id uuid;
  requester_profile RECORD;
  helper_profile RECORD;
  rate NUMERIC;
  hours NUMERIC;
  amt NUMERIC;
  already_has_invoice BOOLEAN := FALSE;
  dup_msg BOOLEAN := FALSE;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status::text = 'approved' THEN
    -- Get requester auth user id (planner or client)
    SELECT COALESCE(p.user_id, c.user_id) INTO requester_user_id
    FROM public.helper_requests hr
    LEFT JOIN public.planners p ON p.id = hr.planner_id
    LEFT JOIN public.clients c ON c.id = hr.client_id
    WHERE hr.id = NEW.id;
    
    -- Get helper auth user id
    SELECT h.user_id INTO helper_user_id FROM public.helpers h WHERE h.id = NEW.helper_id;

    -- Fallbacks to avoid NULLs
    requester_user_id := COALESCE(requester_user_id, auth.uid());
    helper_user_id := COALESCE(helper_user_id, auth.uid());

    -- Check if invoice already exists (idempotency)
    SELECT EXISTS (
      SELECT 1 FROM public.helper_invoices hi WHERE hi.helper_request_id = NEW.id
    ) INTO already_has_invoice;

    IF NOT already_has_invoice THEN
      -- Get profile data
      SELECT pr.full_name, pr.email, pr.phone INTO requester_profile FROM public.profiles pr WHERE pr.user_id = requester_user_id;
      SELECT pr.full_name INTO helper_profile FROM public.profiles pr WHERE pr.user_id = helper_user_id;

      rate := COALESCE(NEW.hourly_rate, 0);
      hours := COALESCE(NEW.total_hours, 0);
      amt := rate * hours;

      -- Create invoice
      INSERT INTO public.helper_invoices (
        planner_id,
        client_id,
        helper_id,
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
        NEW.planner_id,
        NEW.client_id,
        NEW.helper_id,
        NEW.id,
        NEW.event_id,
        NEW.title,
        requester_profile.full_name,
        requester_profile.email,
        requester_profile.phone,
        helper_profile.full_name,
        NEW.event_date,
        rate,
        hours,
        amt,
        'draft'
      );
    END IF;

    -- Notify helper of approval and invoice creation
    IF requester_user_id IS NOT NULL AND helper_user_id IS NOT NULL THEN
      SELECT EXISTS(
        SELECT 1 FROM public.messages m
        WHERE m.sender_id = requester_user_id
          AND m.recipient_id = helper_user_id
          AND m.subject = 'Request Approved'
          AND m.created_at > now() - interval '2 minutes'
      ) INTO dup_msg;

      IF NOT dup_msg THEN
        INSERT INTO public.messages (sender_id, recipient_id, subject, message)
        VALUES (
          requester_user_id,
          helper_user_id,
          'Request Approved',
          'Your request for "' || COALESCE(NEW.title,'the job') || '" has been approved! An invoice draft has been created in your Invoicing tab. Please review and send it when ready.'
        );
      END IF;
    END IF;

    -- Notify requester of rejection
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status::text = 'declined' THEN
      -- Get user IDs
      SELECT COALESCE(p.user_id, c.user_id) INTO requester_user_id
      FROM public.helper_requests hr
      LEFT JOIN public.planners p ON p.id = hr.planner_id
      LEFT JOIN public.clients c ON c.id = hr.client_id
      WHERE hr.id = NEW.id;
      
      SELECT h.user_id INTO helper_user_id FROM public.helpers h WHERE h.id = NEW.helper_id;

      -- Notify requester of decline
      IF requester_user_id IS NOT NULL AND helper_user_id IS NOT NULL THEN
        SELECT EXISTS(
          SELECT 1 FROM public.messages m
          WHERE m.sender_id = helper_user_id
            AND m.recipient_id = requester_user_id
            AND m.subject = 'Request Declined'
            AND m.created_at > now() - interval '2 minutes'
        ) INTO dup_msg;

        IF NOT dup_msg THEN
          INSERT INTO public.messages (sender_id, recipient_id, subject, message)
          VALUES (
            helper_user_id,
            requester_user_id,
            'Request Declined',
            'Your request for "' || COALESCE(NEW.title,'the job') || '" was declined by the helper.'
          );
        END IF;
      END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for helper request status changes
DROP TRIGGER IF EXISTS helper_request_approval_trigger ON helper_requests;
CREATE TRIGGER helper_request_approval_trigger
  AFTER UPDATE ON helper_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_helper_invoice_on_request_approval();
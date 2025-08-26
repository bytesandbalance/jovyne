-- Update existing trigger function to handle client notifications for helper applications
CREATE OR REPLACE FUNCTION public.notify_requester_of_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  requester_user_id uuid;
  helper_user_id uuid;
  request_title text;
  helper_name text;
  dup_msg boolean := false;
BEGIN
  -- Get requester user ID from the helper request (either planner or client)
  SELECT COALESCE(p.user_id, c.user_id) INTO requester_user_id
  FROM public.helper_requests hr
  LEFT JOIN public.planners p ON p.id = hr.planner_id
  LEFT JOIN public.clients c ON c.id = hr.client_id
  WHERE hr.id = NEW.helper_request_id;

  -- Get helper user ID and name
  SELECT h.user_id INTO helper_user_id
  FROM public.helpers h
  WHERE h.id = NEW.helper_id;

  -- Get helper name from profiles
  SELECT pr.full_name INTO helper_name
  FROM public.profiles pr
  WHERE pr.user_id = helper_user_id;

  -- Get request title
  SELECT hr.title INTO request_title
  FROM public.helper_requests hr
  WHERE hr.id = NEW.helper_request_id;

  -- Check for duplicate messages in the last 2 minutes
  SELECT EXISTS(
    SELECT 1 FROM public.messages m
    WHERE m.sender_id = helper_user_id
      AND m.recipient_id = requester_user_id
      AND m.subject = 'New Application Received'
      AND m.created_at > now() - interval '2 minutes'
  ) INTO dup_msg;

  -- Send notification to requester if no duplicate exists
  IF NOT dup_msg AND requester_user_id IS NOT NULL AND helper_user_id IS NOT NULL THEN
    INSERT INTO public.messages (sender_id, recipient_id, subject, message)
    VALUES (
      helper_user_id,
      requester_user_id,
      'New Application Received',
      COALESCE(helper_name, 'A helper') || ' has applied for your job "' || COALESCE(request_title, 'Untitled Job') || '". Check your dashboard to review the application.'
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Update the trigger name and recreate it
DROP TRIGGER IF EXISTS notify_planner_of_application ON public.helper_applications;
CREATE TRIGGER notify_requester_of_application
  AFTER INSERT ON public.helper_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_requester_of_application();

-- Update helper application approval function to handle clients
CREATE OR REPLACE FUNCTION public.create_helper_invoice_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  hr RECORD;
  requester_user_id UUID;
  helper_user_id UUID;
  requester_profile RECORD;
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

    -- Determine requester auth user id (planner or client)
    IF hr IS NOT NULL THEN
      SELECT COALESCE(p.user_id, c.user_id) INTO requester_user_id
      FROM public.helper_requests hr2
      LEFT JOIN public.planners p ON p.id = hr2.planner_id
      LEFT JOIN public.clients c ON c.id = hr2.client_id
      WHERE hr2.id = hr.id;
    END IF;
    
    SELECT h.user_id INTO helper_user_id FROM public.helpers h WHERE h.id = NEW.helper_id;

    -- Fallbacks to avoid NULLs and satisfy messages RLS (sender must be auth.uid())
    requester_user_id := COALESCE(requester_user_id, auth.uid());
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
        SELECT pr.full_name, pr.email, pr.phone INTO requester_profile FROM public.profiles pr WHERE pr.user_id = requester_user_id;
        SELECT pr.full_name INTO helper_profile FROM public.profiles pr WHERE pr.user_id = helper_user_id;

        rate := COALESCE(NEW.hourly_rate, hr.hourly_rate, 0);
        hours := COALESCE(hr.total_hours, 0);
        amt := rate * hours;

        INSERT INTO public.helper_invoices (
          planner_id,
          client_id,
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
          hr.client_id,
          NEW.helper_id,
          NEW.id,
          hr.id,
          hr.event_id,
          hr.title,
          requester_profile.full_name,
          requester_profile.email,
          requester_profile.phone,
          helper_profile.full_name,
          hr.event_date,
          rate,
          hours,
          amt,
          'draft'
        );
      END IF;

      -- Notify helper of approval and invoice creation (dedupe within 2 minutes)
      IF requester_user_id IS NOT NULL AND helper_user_id IS NOT NULL THEN
        SELECT EXISTS(
          SELECT 1 FROM public.messages m
          WHERE m.sender_id = requester_user_id
            AND m.recipient_id = helper_user_id
            AND m.subject = 'Application Approved'
            AND m.created_at > now() - interval '2 minutes'
        ) INTO dup_msg;

        IF NOT dup_msg THEN
          INSERT INTO public.messages (sender_id, recipient_id, subject, message)
          VALUES (
            requester_user_id,
            helper_user_id,
            'Application Approved',
            'Your application for ' || COALESCE(hr.title,'the job') || ' has been approved. An invoice form has been created in your dashboard. Please review, complete, and send it to the requester.'
          );
        END IF;
      END IF;

    ELSIF NEW.status::text = 'rejected' THEN
      -- Notify helper of rejection (dedupe within 2 minutes)
      IF requester_user_id IS NOT NULL AND helper_user_id IS NOT NULL THEN
        SELECT EXISTS(
          SELECT 1 FROM public.messages m
          WHERE m.sender_id = requester_user_id
            AND m.recipient_id = helper_user_id
            AND m.subject = 'Application Rejected'
            AND m.created_at > now() - interval '2 minutes'
        ) INTO dup_msg;

        IF NOT dup_msg THEN
          INSERT INTO public.messages (sender_id, recipient_id, subject, message)
          VALUES (
            requester_user_id,
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

-- Update helper invoice transitions function to handle clients
CREATE OR REPLACE FUNCTION public.enforce_helper_invoice_transitions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  old_status TEXT := (CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.status::text, 'draft') ELSE NULL END);
  new_status TEXT := NEW.status::text;
  requester_user_id uuid;
  helper_user_id uuid;
  dup_msg BOOLEAN := FALSE;
BEGIN
  -- Lock any edits after completed
  IF (OLD.status = 'completed'::public.helper_invoice_status) THEN
    RAISE EXCEPTION 'Invoice is completed and cannot be modified';
  END IF;

  -- Resolve auth user ids (planner or client as requester)
  SELECT COALESCE(p.user_id, c.user_id) INTO requester_user_id 
  FROM public.planners p
  FULL OUTER JOIN public.clients c ON (p.id = COALESCE(NEW.planner_id, OLD.planner_id) OR c.id = COALESCE(NEW.client_id, OLD.client_id))
  WHERE p.id = COALESCE(NEW.planner_id, OLD.planner_id) OR c.id = COALESCE(NEW.client_id, OLD.client_id);
  
  SELECT h.user_id INTO helper_user_id FROM public.helpers h WHERE h.id = COALESCE(NEW.helper_id, OLD.helper_id);

  -- Allowed transitions + notifications
  IF old_status = 'draft' AND (new_status = 'sent_to_planner' OR new_status = 'awaiting_payment') THEN
    NEW.sent_at := COALESCE(NEW.sent_at, now());
    NEW.status := 'awaiting_payment';

    -- Notify requester that an invoice was sent (dedupe within 2 minutes)
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = helper_user_id
        AND m.recipient_id = requester_user_id
        AND m.subject = 'Invoice Received'
        AND m.created_at > now() - interval '2 minutes'
    ) INTO dup_msg;

    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        helper_user_id,
        requester_user_id,
        'Invoice Received',
        'You have received an invoice from ' || COALESCE(NEW.helper_name,'a helper') ||
        ' for ' || COALESCE(NEW.job_title,'a job') ||
        '. Amount: ' || COALESCE(NEW.amount, 0)::text || '. Please review and mark as paid.'
      );
    END IF;

  ELSIF old_status = 'awaiting_payment' AND new_status = 'paid_planner' THEN
    NEW.paid_at := COALESCE(NEW.paid_at, now());

    -- Notify helper that requester marked as paid (dedupe within 2 minutes)
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = requester_user_id
        AND m.recipient_id = helper_user_id
        AND m.subject = 'Invoice Marked as Paid'
        AND m.created_at > now() - interval '2 minutes'
    ) INTO dup_msg;

    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        requester_user_id,
        helper_user_id,
        'Invoice Marked as Paid',
        'Your invoice for ' || COALESCE(NEW.job_title,'the job') || ' was marked as paid. Please confirm receipt to complete.'
      );
    END IF;

  ELSIF old_status = 'paid_planner' AND new_status = 'completed' THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());

    -- Notify requester that helper confirmed receipt (dedupe within 2 minutes)
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = helper_user_id
        AND m.recipient_id = requester_user_id
        AND m.subject = 'Invoice Completed'
        AND m.created_at > now() - interval '2 minutes'
    ) INTO dup_msg;

    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        helper_user_id,
        requester_user_id,
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

-- Create notification trigger for planner applications
CREATE OR REPLACE FUNCTION public.notify_client_of_planner_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  client_user_id uuid;
  planner_user_id uuid;
  request_title text;
  planner_name text;
  dup_msg boolean := false;
BEGIN
  -- Get client user ID from the planner request
  SELECT c.user_id INTO client_user_id
  FROM public.clients c
  JOIN public.planner_requests pr ON pr.client_id = c.id
  WHERE pr.id = NEW.planner_request_id;

  -- Get planner user ID and name
  SELECT p.user_id INTO planner_user_id
  FROM public.planners p
  WHERE p.id = NEW.planner_id;

  -- Get planner name from profiles
  SELECT pr.full_name INTO planner_name
  FROM public.profiles pr
  WHERE pr.user_id = planner_user_id;

  -- Get request title
  SELECT pr.title INTO request_title
  FROM public.planner_requests pr
  WHERE pr.id = NEW.planner_request_id;

  -- Check for duplicate messages in the last 2 minutes
  SELECT EXISTS(
    SELECT 1 FROM public.messages m
    WHERE m.sender_id = planner_user_id
      AND m.recipient_id = client_user_id
      AND m.subject = 'New Application Received'
      AND m.created_at > now() - interval '2 minutes'
  ) INTO dup_msg;

  -- Send notification to client if no duplicate exists
  IF NOT dup_msg AND client_user_id IS NOT NULL AND planner_user_id IS NOT NULL THEN
    INSERT INTO public.messages (sender_id, recipient_id, subject, message)
    VALUES (
      planner_user_id,
      client_user_id,
      'New Application Received',
      COALESCE(planner_name, 'A planner') || ' has applied for your job "' || COALESCE(request_title, 'Untitled Job') || '". Check your dashboard to review the application.'
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for planner application notifications
CREATE TRIGGER notify_client_of_planner_application
  AFTER INSERT ON public.planner_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_client_of_planner_application();

-- Create invoice creation trigger for planner applications
CREATE OR REPLACE FUNCTION public.create_planner_invoice_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  pr RECORD;
  client_user_id UUID;
  planner_user_id UUID;
  client_profile RECORD;
  planner_profile RECORD;
  fee NUMERIC;
  already_has_invoice BOOLEAN := FALSE;
  dup_msg BOOLEAN := FALSE;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Load related request
    SELECT * INTO pr FROM public.planner_requests WHERE id = NEW.planner_request_id;

    -- Determine client and planner auth user ids
    IF pr IS NOT NULL THEN
      SELECT c.user_id INTO client_user_id FROM public.clients c WHERE c.id = pr.client_id;
    END IF;
    SELECT p.user_id INTO planner_user_id FROM public.planners p WHERE p.id = NEW.planner_id;

    -- Fallbacks to avoid NULLs and satisfy messages RLS (sender must be auth.uid())
    client_user_id := COALESCE(client_user_id, auth.uid());
    planner_user_id := COALESCE(planner_user_id, (SELECT p.user_id FROM public.planners p WHERE p.id = NEW.planner_id));

    -- Handle approval/acceptance: create invoice and notify
    IF NEW.status::text IN ('approved','accepted') THEN
      IF pr IS NULL THEN
        RETURN NEW;
      END IF;

      -- Idempotency: only create one invoice per application
      SELECT EXISTS (
        SELECT 1 FROM public.planner_invoices pi WHERE pi.planner_application_id = NEW.id
      ) INTO already_has_invoice;

      IF NOT already_has_invoice THEN
        SELECT pr.full_name, pr.email, pr.phone INTO client_profile FROM public.profiles pr WHERE pr.user_id = client_user_id;
        SELECT pr.full_name INTO planner_profile FROM public.profiles pr WHERE pr.user_id = planner_user_id;

        fee := COALESCE(NEW.proposed_fee, pr.budget, 0);

        INSERT INTO public.planner_invoices (
          client_id,
          planner_id,
          planner_application_id,
          planner_request_id,
          event_id,
          job_title,
          client_name,
          client_contact_email,
          client_contact_phone,
          planner_name,
          event_date,
          proposed_fee,
          total_hours,
          amount,
          status
        )
        VALUES (
          pr.client_id,
          NEW.planner_id,
          NEW.id,
          pr.id,
          pr.event_id,
          pr.title,
          client_profile.full_name,
          client_profile.email,
          client_profile.phone,
          planner_profile.full_name,
          pr.event_date,
          fee,
          pr.total_hours,
          fee,
          'draft'
        );
      END IF;

      -- Notify planner of approval and invoice creation (dedupe within 2 minutes)
      IF client_user_id IS NOT NULL AND planner_user_id IS NOT NULL THEN
        SELECT EXISTS(
          SELECT 1 FROM public.messages m
          WHERE m.sender_id = client_user_id
            AND m.recipient_id = planner_user_id
            AND m.subject = 'Application Approved'
            AND m.created_at > now() - interval '2 minutes'
        ) INTO dup_msg;

        IF NOT dup_msg THEN
          INSERT INTO public.messages (sender_id, recipient_id, subject, message)
          VALUES (
            client_user_id,
            planner_user_id,
            'Application Approved',
            'Your application for ' || COALESCE(pr.title,'the job') || ' has been approved. An invoice form has been created in your dashboard. Please review, complete, and send it to the client.'
          );
        END IF;
      END IF;

    ELSIF NEW.status::text = 'rejected' THEN
      -- Notify planner of rejection (dedupe within 2 minutes)
      IF client_user_id IS NOT NULL AND planner_user_id IS NOT NULL THEN
        SELECT EXISTS(
          SELECT 1 FROM public.messages m
          WHERE m.sender_id = client_user_id
            AND m.recipient_id = planner_user_id
            AND m.subject = 'Application Rejected'
            AND m.created_at > now() - interval '2 minutes'
        ) INTO dup_msg;

        IF NOT dup_msg THEN
          INSERT INTO public.messages (sender_id, recipient_id, subject, message)
          VALUES (
            client_user_id,
            planner_user_id,
            'Application Rejected',
            'Your application for ' || COALESCE(pr.title,'the job') || ' was not approved. Thank you for applying.'
          );
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for planner invoice creation
CREATE TRIGGER create_planner_invoice_on_approval
  AFTER UPDATE ON public.planner_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_planner_invoice_on_approval();

-- Create planner invoice transitions trigger function
CREATE OR REPLACE FUNCTION public.enforce_planner_invoice_transitions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  old_status TEXT := (CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.status::text, 'draft') ELSE NULL END);
  new_status TEXT := NEW.status::text;
  client_user_id uuid;
  planner_user_id uuid;
  dup_msg BOOLEAN := FALSE;
BEGIN
  -- Lock any edits after completed
  IF (OLD.status = 'completed'::public.helper_invoice_status) THEN
    RAISE EXCEPTION 'Invoice is completed and cannot be modified';
  END IF;

  -- Resolve auth user ids
  SELECT c.user_id INTO client_user_id FROM public.clients c WHERE c.id = COALESCE(NEW.client_id, OLD.client_id);
  SELECT p.user_id INTO planner_user_id FROM public.planners p WHERE p.id = COALESCE(NEW.planner_id, OLD.planner_id);

  -- Allowed transitions + notifications
  IF old_status = 'draft' AND (new_status = 'sent_to_planner' OR new_status = 'awaiting_payment') THEN
    NEW.sent_at := COALESCE(NEW.sent_at, now());
    NEW.status := 'awaiting_payment';

    -- Notify client that an invoice was sent (dedupe within 2 minutes)
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = planner_user_id
        AND m.recipient_id = client_user_id
        AND m.subject = 'Invoice Received'
        AND m.created_at > now() - interval '2 minutes'
    ) INTO dup_msg;

    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        planner_user_id,
        client_user_id,
        'Invoice Received',
        'You have received an invoice from ' || COALESCE(NEW.planner_name,'a planner') ||
        ' for ' || COALESCE(NEW.job_title,'a job') ||
        '. Amount: ' || COALESCE(NEW.amount, 0)::text || '. Please review and mark as paid.'
      );
    END IF;

  ELSIF old_status = 'awaiting_payment' AND new_status = 'paid_planner' THEN
    NEW.paid_at := COALESCE(NEW.paid_at, now());

    -- Notify planner that client marked as paid (dedupe within 2 minutes)
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = client_user_id
        AND m.recipient_id = planner_user_id
        AND m.subject = 'Invoice Marked as Paid'
        AND m.created_at > now() - interval '2 minutes'
    ) INTO dup_msg;

    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        client_user_id,
        planner_user_id,
        'Invoice Marked as Paid',
        'Your invoice for ' || COALESCE(NEW.job_title,'the job') || ' was marked as paid. Please confirm receipt to complete.'
      );
    END IF;

  ELSIF old_status = 'paid_planner' AND new_status = 'completed' THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());

    -- Notify client that planner confirmed receipt (dedupe within 2 minutes)
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = planner_user_id
        AND m.recipient_id = client_user_id
        AND m.subject = 'Invoice Completed'
        AND m.created_at > now() - interval '2 minutes'
    ) INTO dup_msg;

    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        planner_user_id,
        client_user_id,
        'Invoice Completed',
        'The planner has confirmed receipt for ' || COALESCE(NEW.job_title,'the job') || '. This invoice is now completed.'
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

-- Create trigger for planner invoice transitions
CREATE TRIGGER enforce_planner_invoice_transitions
  BEFORE UPDATE ON public.planner_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_planner_invoice_transitions();
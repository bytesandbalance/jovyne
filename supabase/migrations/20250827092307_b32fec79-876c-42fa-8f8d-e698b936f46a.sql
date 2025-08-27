-- Update the notification trigger to create proper notifications for planner applications
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
      COALESCE(planner_name, 'A planner') || ' has applied for your event "' || COALESCE(request_title, 'Untitled Event') || '". Check your dashboard to review the application.'
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for planner applications (if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_notify_client_of_planner_application') THEN
    CREATE TRIGGER trigger_notify_client_of_planner_application
      AFTER INSERT ON public.planner_applications
      FOR EACH ROW EXECUTE FUNCTION public.notify_client_of_planner_application();
  END IF;
END $$;

-- Update the approval flow for planner applications to create events and link clients
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
  new_event_id UUID;
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

    -- Handle approval/acceptance: create downstream records
    IF NEW.status::text IN ('approved','accepted') THEN
      IF pr IS NULL THEN
        RETURN NEW;
      END IF;

      -- Link client to planner (update client record)
      UPDATE public.clients 
      SET planner_id = NEW.planner_id
      WHERE id = pr.client_id;

      -- Create event record
      INSERT INTO public.events (
        title,
        description,
        event_date,
        event_time,
        venue_name,
        venue_address,
        guest_count,
        budget,
        client_id,
        planner_id,
        status
      ) VALUES (
        pr.title,
        pr.description,
        pr.event_date,
        pr.start_time,
        NULL, -- venue_name to be filled later
        NULL, -- venue_address to be filled later
        NULL, -- guest_count to be filled later
        pr.budget,
        client_user_id,
        NEW.planner_id,
        'planning'
      ) RETURNING id INTO new_event_id;

      -- Update planner request with event reference
      UPDATE public.planner_requests 
      SET event_id = new_event_id
      WHERE id = NEW.planner_request_id;

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
          new_event_id,
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
            'Your application for ' || COALESCE(pr.title,'the event') || ' has been approved! An event has been created and an invoice form is ready in your dashboard. Please review, complete, and send it to the client.'
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
            'Your application for ' || COALESCE(pr.title,'the event') || ' was not approved. Thank you for applying.'
          );
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
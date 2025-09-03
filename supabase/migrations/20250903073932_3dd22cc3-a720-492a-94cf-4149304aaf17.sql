-- Fix the client linking when request is approved
UPDATE public.clients 
SET planner_id = '76ead27a-91b0-4a41-9de0-90e6d5d9ca49'
WHERE id = '30b1a8c5-a92a-4a17-99f8-90c817d58aa7';

-- Also fix the database function to properly link clients when requests are approved
CREATE OR REPLACE FUNCTION public.handle_planner_request_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  client_user_id uuid;
  planner_user_id uuid; 
  client_profile RECORD;
  planner_profile RECORD;
  fee NUMERIC;
  dup_msg BOOLEAN := FALSE;
  new_event_id UUID;
BEGIN
  -- Only process when status changes to approved
  IF TG_OP = 'UPDATE' AND OLD.status != 'approved' AND NEW.status = 'approved' THEN
    
    -- Get client and planner user IDs
    SELECT c.user_id INTO client_user_id FROM public.clients c WHERE c.id = NEW.client_id;
    SELECT p.user_id INTO planner_user_id FROM public.planners p WHERE p.id = NEW.planner_id;
    
    -- Link client to planner by updating client record
    UPDATE public.clients 
    SET planner_id = NEW.planner_id
    WHERE id = NEW.client_id;
    
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
      NEW.title,
      NEW.description,
      NEW.event_date,
      NEW.start_time,
      NULL, -- venue details to be filled later
      NULL,
      NULL,
      NEW.budget,
      client_user_id,
      NEW.planner_id,
      'planning'
    ) RETURNING id INTO new_event_id;

    -- Update request with event reference
    UPDATE public.planner_requests 
    SET event_id = new_event_id
    WHERE id = NEW.id;

    -- Get profiles for invoice
    SELECT pr.full_name, pr.email, pr.phone INTO client_profile 
    FROM public.profiles pr WHERE pr.user_id = client_user_id;
    
    SELECT pr.full_name INTO planner_profile 
    FROM public.profiles pr WHERE pr.user_id = planner_user_id;

    -- Create draft invoice
    fee := COALESCE(NEW.budget, 0);
    
    INSERT INTO public.planner_invoices (
      client_id,
      planner_id,
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
      NEW.client_id,
      NEW.planner_id,
      NEW.id,
      new_event_id,
      NEW.title,
      client_profile.full_name,
      client_profile.email,
      client_profile.phone,
      planner_profile.full_name,
      NEW.event_date,
      fee,
      NEW.total_hours,
      fee,
      'draft'
    );

    -- Send notification to client about approval and invoice
    IF client_user_id IS NOT NULL AND planner_user_id IS NOT NULL THEN
      SELECT EXISTS(
        SELECT 1 FROM public.messages m
        WHERE m.sender_id = planner_user_id
          AND m.recipient_id = client_user_id
          AND m.subject = 'Request Approved'
          AND m.created_at > now() - interval '2 minutes'
      ) INTO dup_msg;

      IF NOT dup_msg THEN
        INSERT INTO public.messages (sender_id, recipient_id, subject, message)
        VALUES (
          planner_user_id,
          client_user_id,
          'Request Approved',
          'Great news! Your request "' || NEW.title || '" has been approved. A draft invoice has been created and will be sent to you soon. Check your Invoicing tab for updates.'
        );
      END IF;
    END IF;
    
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'rejected' AND NEW.status = 'rejected' THEN
    -- Handle rejection
    SELECT c.user_id INTO client_user_id FROM public.clients c WHERE c.id = NEW.client_id;
    SELECT p.user_id INTO planner_user_id FROM public.planners p WHERE p.id = NEW.planner_id;
    
    IF client_user_id IS NOT NULL AND planner_user_id IS NOT NULL THEN
      SELECT EXISTS(
        SELECT 1 FROM public.messages m
        WHERE m.sender_id = planner_user_id
          AND m.recipient_id = client_user_id
          AND m.subject = 'Request Declined'
          AND m.created_at > now() - interval '2 minutes'
      ) INTO dup_msg;

      IF NOT dup_msg THEN
        INSERT INTO public.messages (sender_id, recipient_id, subject, message)
        VALUES (
          planner_user_id,
          client_user_id,
          'Request Declined',
          'Your request "' || NEW.title || '" was declined. You can submit a new request with different requirements.'
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
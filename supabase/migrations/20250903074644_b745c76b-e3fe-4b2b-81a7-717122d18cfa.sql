-- Fix duplicate invoice creation by removing invoice creation from one of the functions
-- Keep invoice creation only in create_planner_invoice_on_approval (for planner_applications)
-- Remove invoice creation from handle_planner_request_approval (for planner_requests)

CREATE OR REPLACE FUNCTION public.handle_planner_request_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  client_user_id uuid;
  planner_user_id uuid; 
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

    -- Send notification to client about approval (no invoice creation here)
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
          'Great news! Your request "' || NEW.title || '" has been approved. Check your dashboard for updates.'
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
$function$
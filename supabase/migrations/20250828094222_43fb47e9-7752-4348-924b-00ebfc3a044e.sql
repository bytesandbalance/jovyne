-- Create function to notify planners of new requests
CREATE OR REPLACE FUNCTION public.notify_planners_of_new_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  planner_record RECORD;
  client_name text;
  dup_msg boolean := false;
BEGIN
  -- Get client name
  SELECT profiles.full_name INTO client_name
  FROM public.profiles
  JOIN public.clients ON clients.user_id = profiles.user_id
  WHERE clients.id = NEW.client_id;

  -- Loop through all verified planners and send notifications
  FOR planner_record IN 
    SELECT p.user_id 
    FROM public.planners p 
    WHERE p.is_verified = true
  LOOP
    -- Check for duplicate messages in the last 5 minutes
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = (SELECT c.user_id FROM public.clients c WHERE c.id = NEW.client_id)
        AND m.recipient_id = planner_record.user_id
        AND m.subject = 'New Planner Request Available'
        AND m.created_at > now() - interval '5 minutes'
    ) INTO dup_msg;

    -- Send notification if no recent duplicate exists
    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        (SELECT c.user_id FROM public.clients c WHERE c.id = NEW.client_id),
        planner_record.user_id,
        'New Planner Request Available',
        'New planner request "' || NEW.title || '" in ' || NEW.location_city || 
        ' by ' || COALESCE(client_name, 'a client') ||
        CASE WHEN NEW.budget IS NOT NULL THEN '. Budget: $' || NEW.budget::text ELSE '' END ||
        '. Check the planner requests page to apply.'
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$function$;

-- Create trigger to notify planners when new requests are created
CREATE TRIGGER trigger_notify_planners_new_request
  AFTER INSERT ON public.planner_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_planners_of_new_request();
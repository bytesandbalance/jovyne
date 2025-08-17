-- Create trigger to send notifications when helper applications are created
CREATE OR REPLACE FUNCTION public.notify_planner_of_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  planner_user_id uuid;
  helper_user_id uuid;
  request_title text;
  helper_name text;
  dup_msg boolean := false;
BEGIN
  -- Get planner user ID from the helper request
  SELECT p.user_id INTO planner_user_id
  FROM public.planners p
  JOIN public.helper_requests hr ON hr.planner_id = p.id
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
      AND m.recipient_id = planner_user_id
      AND m.subject = 'New Application Received'
      AND m.created_at > now() - interval '2 minutes'
  ) INTO dup_msg;

  -- Send notification to planner if no duplicate exists
  IF NOT dup_msg AND planner_user_id IS NOT NULL AND helper_user_id IS NOT NULL THEN
    INSERT INTO public.messages (sender_id, recipient_id, subject, message)
    VALUES (
      helper_user_id,
      planner_user_id,
      'New Application Received',
      COALESCE(helper_name, 'A helper') || ' has applied for your job "' || COALESCE(request_title, 'Untitled Job') || '". Check your dashboard to review the application.'
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for helper applications
DROP TRIGGER IF EXISTS trigger_notify_planner_of_application ON public.helper_applications;
CREATE TRIGGER trigger_notify_planner_of_application
  AFTER INSERT ON public.helper_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_planner_of_application();
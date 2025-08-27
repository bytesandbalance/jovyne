-- Fix clients table to allow independent client signup
-- Make planner_id nullable since clients can exist independently
ALTER TABLE public.clients ALTER COLUMN planner_id DROP NOT NULL;

-- Update the handle_new_user function to create client profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, user_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'user_role')::public.user_role, 'client')
  );

  -- Create client profile if user role is client
  IF COALESCE((NEW.raw_user_meta_data->>'user_role')::public.user_role, 'client') = 'client' THEN
    INSERT INTO public.clients (user_id, full_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Create function to handle direct messaging notifications
CREATE OR REPLACE FUNCTION public.notify_on_direct_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  sender_profile RECORD;
  dup_msg BOOLEAN := FALSE;
BEGIN
  -- Get sender profile information
  SELECT full_name, user_role INTO sender_profile
  FROM public.profiles
  WHERE user_id = NEW.sender_id;

  -- Check for duplicate messages in the last 30 seconds
  SELECT EXISTS(
    SELECT 1 FROM public.messages m
    WHERE m.sender_id = NEW.sender_id
      AND m.recipient_id = NEW.recipient_id
      AND m.subject = NEW.subject
      AND m.created_at > now() - interval '30 seconds'
  ) INTO dup_msg;

  -- Skip if duplicate or system-generated message
  IF dup_msg OR NEW.subject IN ('New Application Received', 'Application Approved', 'Application Rejected', 'Invoice Received', 'Invoice Marked as Paid', 'Invoice Completed') THEN
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for direct message notifications
CREATE TRIGGER on_message_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_direct_message();
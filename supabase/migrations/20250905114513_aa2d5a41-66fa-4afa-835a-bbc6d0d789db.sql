-- Add free trial tracking to planners table
ALTER TABLE public.planners 
ADD COLUMN IF NOT EXISTS free_trial_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS paypal_subscription_id text;

-- Update the handle_email_confirmation function to start free trial
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
BEGIN
  -- Only proceed if email_confirmed_at was just set (user confirmed email)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    
    -- Get user role from profiles
    SELECT pr.user_role::text INTO user_role
    FROM public.profiles pr
    WHERE pr.user_id = NEW.id;
    
    -- If user is a planner, verify profile AND start free trial
    IF user_role = 'planner' THEN
      UPDATE public.planners 
      SET 
        is_verified = true,
        subscription_status = 'trial',
        free_trial_started_at = now(),
        subscription_expires_at = now() + interval '1 month'
      WHERE user_id = NEW.id;
      
      RAISE NOTICE 'Started free trial for planner user_id: % after email confirmation', NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
-- Update the handle_email_confirmation function to give different trial periods based on signup year
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
  trial_duration interval;
BEGIN
  -- Only proceed if email_confirmed_at was just set (user confirmed email)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    
    -- Get user role from profiles
    SELECT pr.user_role::text INTO user_role
    FROM public.profiles pr
    WHERE pr.user_id = NEW.id;
    
    -- If user is a planner, verify profile AND start free trial with appropriate duration
    IF user_role = 'planner' THEN
      -- Determine trial duration based on signup year
      IF EXTRACT(YEAR FROM now()) = 2025 THEN
        trial_duration := interval '3 months';
      ELSE
        trial_duration := interval '1 month';
      END IF;
      
      UPDATE public.planners 
      SET 
        is_verified = true,
        subscription_status = 'trial',
        free_trial_started_at = now(),
        subscription_expires_at = now() + trial_duration
      WHERE user_id = NEW.id;
      
      RAISE NOTICE 'Started % free trial for planner user_id: % after email confirmation', trial_duration, NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Also update existing planners who don't have trials yet but are verified
-- Give them the appropriate trial based on their creation date
UPDATE public.planners 
SET 
  subscription_status = 'trial',
  free_trial_started_at = now(),
  subscription_expires_at = CASE 
    WHEN EXTRACT(YEAR FROM created_at) = 2025 THEN now() + interval '3 months'
    ELSE now() + interval '1 month'
  END
WHERE is_verified = true 
  AND subscription_status IN ('none', 'expired') 
  AND free_trial_started_at IS NULL;
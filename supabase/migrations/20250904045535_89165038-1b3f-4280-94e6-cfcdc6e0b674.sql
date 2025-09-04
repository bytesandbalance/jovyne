-- Set all planners to unverified by default
UPDATE planners SET is_verified = false;

-- Update RLS policy to show all planners in discovery (not just verified ones)
DROP POLICY IF EXISTS "Anyone can view verified planners" ON planners;

CREATE POLICY "Anyone can view all planners for discovery" 
ON planners 
FOR SELECT 
USING (true);

-- Clean up profiles - keep only the real planner profile
DELETE FROM profiles 
WHERE user_role = 'planner' 
AND email != 'pfshgary@gmail.com';

-- Update the planner profile linking to set verification status
CREATE OR REPLACE FUNCTION public.link_existing_planner_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  existing_planner_id uuid;
  user_email text;
  user_role text;
BEGIN
  -- Get user email and role from the new user
  user_email := NEW.email;
  user_role := COALESCE(NEW.raw_user_meta_data->>'user_role', 'client');
  
  -- Only process if user_role is 'planner'
  IF user_role != 'planner' THEN
    RETURN NEW;
  END IF;
  
  -- Check if there's an existing planner profile with no user_id but matching email
  SELECT p.id INTO existing_planner_id
  FROM public.planners p
  WHERE p.user_id IS NULL 
    AND p.email = user_email
  LIMIT 1;
  
  -- If we found a match, link it and verify it
  IF existing_planner_id IS NOT NULL THEN
    UPDATE public.planners 
    SET user_id = NEW.id, is_verified = true
    WHERE id = existing_planner_id;
  END IF;
  
  RETURN NEW;
END;
$function$;
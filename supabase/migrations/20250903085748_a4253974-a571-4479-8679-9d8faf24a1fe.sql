-- Update the linking function to only apply to planners
CREATE OR REPLACE FUNCTION public.link_existing_planner_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  
  -- Check if there's an existing planner profile with no user_id but matching email in profiles
  SELECT p.id INTO existing_planner_id
  FROM public.planners p
  LEFT JOIN public.profiles pr ON pr.user_id = p.user_id
  WHERE p.user_id IS NULL 
    AND pr.email = user_email
  LIMIT 1;
  
  -- If we found a match, link it
  IF existing_planner_id IS NOT NULL THEN
    UPDATE public.planners 
    SET user_id = NEW.id
    WHERE id = existing_planner_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update the trigger to run before handle_new_user (priority 1)
DROP TRIGGER IF EXISTS on_auth_user_created_link_planner ON auth.users;
CREATE TRIGGER on_auth_user_created_link_planner
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.link_existing_planner_profile();

-- Ensure handle_new_user only creates profiles for users without existing planner links
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_role text;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'user_role', 'client');
  
  -- Insert profile with ON CONFLICT handling
  INSERT INTO public.profiles (user_id, email, full_name, user_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    user_role::public.user_role
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    user_role = EXCLUDED.user_role,
    updated_at = now();

  -- Create client profile only if user role is client
  IF user_role = 'client' THEN
    INSERT INTO public.clients (user_id, full_name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email
    )
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$function$;
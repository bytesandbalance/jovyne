-- Fix security issue: Don't auto-verify planners until email is confirmed

-- First, update the handle_new_user function to NOT auto-verify
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
  existing_planner_id uuid;
  user_email text;
BEGIN
  user_email := NEW.email;
  user_role := COALESCE(NEW.raw_user_meta_data->>'user_role', 'client');
  
  -- Log the function call for debugging
  RAISE NOTICE 'handle_new_user called for user_id: %, email: %, role: %', NEW.id, user_email, user_role;
  
  -- Insert profile with ON CONFLICT handling to prevent duplicates
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

  -- Log profile creation
  RAISE NOTICE 'Profile created/updated for user_id: %', NEW.id;

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
    
    RAISE NOTICE 'Client profile created/updated for user_id: %', NEW.id;
  END IF;

  -- Link existing planner profile if user_role is 'planner' BUT DO NOT VERIFY YET
  IF user_role = 'planner' THEN
    -- Check if there's an existing planner profile with no user_id but matching email
    SELECT p.id INTO existing_planner_id
    FROM public.planners p
    WHERE p.user_id IS NULL 
      AND p.email = user_email
    LIMIT 1;
    
    -- If we found a match, link it but keep is_verified = false until email confirmation
    IF existing_planner_id IS NOT NULL THEN
      UPDATE public.planners 
      SET user_id = NEW.id, is_verified = false
      WHERE id = existing_planner_id;
      
      RAISE NOTICE 'Linked existing planner profile % to user_id: % (not verified yet)', existing_planner_id, NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Update the auto_verify_linked_planners function to NOT auto-verify
CREATE OR REPLACE FUNCTION public.auto_verify_linked_planners()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- DO NOT automatically verify when user_id is set
  -- Verification should only happen after email confirmation
  RETURN NEW;
END;
$function$;

-- Create a new function to verify planners when email is confirmed
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
    
    -- If user is a planner, now verify their planner profile
    IF user_role = 'planner' THEN
      UPDATE public.planners 
      SET is_verified = true
      WHERE user_id = NEW.id;
      
      RAISE NOTICE 'Verified planner profile for user_id: % after email confirmation', NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger for email confirmation
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirmation();
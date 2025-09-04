-- First, let's clean up the duplicate profiles by keeping only the most recent one
DELETE FROM public.profiles 
WHERE user_id IN (
  'c2714e8a-283e-47cd-90a7-7d5ef08a39b7',
  '6bf0a1bb-27d6-453b-9a06-e54dd933b732'
);

-- Update the handle_new_user function to prevent duplicates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role text;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'user_role', 'client');
  
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

-- Add a trigger to clean up profiles when users are deleted
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete the user's profile when they are deleted from auth.users
  DELETE FROM public.profiles WHERE user_id = OLD.id;
  -- The clients table will cascade delete due to foreign key
  RETURN OLD;
END;
$function$;

-- Create the trigger on auth.users for cleanup
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();
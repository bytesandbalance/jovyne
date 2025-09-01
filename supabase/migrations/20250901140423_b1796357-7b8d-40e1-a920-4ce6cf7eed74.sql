-- Add ON CONFLICT clause to handle_new_user function to prevent duplicate key violations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Insert into profiles with ON CONFLICT to handle duplicates
  INSERT INTO public.profiles (user_id, email, full_name, user_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'user_role')::public.user_role, 'client')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    user_role = EXCLUDED.user_role,
    updated_at = now();

  -- Create client profile if user role is client
  IF COALESCE((NEW.raw_user_meta_data->>'user_role')::public.user_role, 'client') = 'client' THEN
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
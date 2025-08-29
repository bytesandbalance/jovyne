-- Fix search path for ensure_client_profile function
CREATE OR REPLACE FUNCTION public.ensure_client_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only create client profile if user_role is client
  IF NEW.user_role = 'client' THEN
    INSERT INTO public.clients (user_id, full_name, email)
    SELECT NEW.user_id, NEW.full_name, NEW.email
    WHERE NOT EXISTS (
      SELECT 1 FROM public.clients c WHERE c.user_id = NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$;
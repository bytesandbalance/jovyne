-- Create client record if it doesn't exist for logged in users with client role
CREATE OR REPLACE FUNCTION public.ensure_client_profile()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to ensure client profile exists
DROP TRIGGER IF EXISTS ensure_client_profile_trigger ON public.profiles;
CREATE TRIGGER ensure_client_profile_trigger
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_client_profile();
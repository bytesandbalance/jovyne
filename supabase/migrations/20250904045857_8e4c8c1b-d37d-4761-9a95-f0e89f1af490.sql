-- Create function to automatically verify planners when they get linked to a user
CREATE OR REPLACE FUNCTION public.auto_verify_linked_planners()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- If user_id is being set from NULL to a value, automatically verify the planner
  IF OLD.user_id IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.is_verified = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to auto-verify planners when they get linked
DROP TRIGGER IF EXISTS trigger_auto_verify_linked_planners ON planners;
CREATE TRIGGER trigger_auto_verify_linked_planners
  BEFORE UPDATE ON planners
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_verify_linked_planners();
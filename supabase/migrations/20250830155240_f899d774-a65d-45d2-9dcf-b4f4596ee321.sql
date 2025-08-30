-- Fix the security warning by setting search_path for the function
CREATE OR REPLACE FUNCTION public.handle_planner_request_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When a planner request is approved, link the client to the planner
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.planner_id IS NOT NULL THEN
    UPDATE clients 
    SET planner_id = NEW.planner_id 
    WHERE id = NEW.client_id AND planner_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
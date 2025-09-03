-- Create the missing trigger for planner request status changes
-- This will call the updated function that now creates invoices

CREATE TRIGGER on_planner_request_status_change
  AFTER UPDATE ON public.planner_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_planner_request_approval();
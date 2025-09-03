-- Create the missing trigger for planner request approvals
-- This will call the handle_planner_request_approval function when planner_requests are updated

CREATE TRIGGER on_planner_request_status_change
  AFTER UPDATE ON public.planner_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_planner_request_approval();
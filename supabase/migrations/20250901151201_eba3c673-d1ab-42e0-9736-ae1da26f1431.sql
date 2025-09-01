-- Remove the old trigger that sends notifications to all planners
-- We now use direct messaging to specific planners
DROP TRIGGER IF EXISTS notify_planners_of_new_request_trigger ON public.planner_requests;
DROP FUNCTION IF EXISTS public.notify_planners_of_new_request();
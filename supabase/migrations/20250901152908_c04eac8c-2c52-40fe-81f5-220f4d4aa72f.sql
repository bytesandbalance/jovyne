-- Remove the old trigger that sends notifications to all planners (with CASCADE)
-- We now use direct messaging to specific planners
DROP TRIGGER IF EXISTS trigger_notify_planners_new_request ON public.planner_requests CASCADE;
DROP FUNCTION IF EXISTS public.notify_planners_of_new_request() CASCADE;
-- Remove Tasks functionality from Planner Dashboard
-- Drop the event_tasks table and related objects

-- First, drop any triggers related to event_tasks (if any exist)
DROP TRIGGER IF EXISTS update_event_tasks_updated_at ON public.event_tasks;

-- Drop the event_tasks table
DROP TABLE IF EXISTS public.event_tasks;
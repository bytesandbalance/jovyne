-- Drop the communication_requests table as it's redundant
-- The system now uses helper_requests and planner_requests as single source of truth
DROP TABLE IF EXISTS public.communication_requests;
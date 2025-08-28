-- Allow helper_requests to have nullable planner_id for client-created requests
ALTER TABLE public.helper_requests ALTER COLUMN planner_id DROP NOT NULL;
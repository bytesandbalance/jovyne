-- Clean up redundant tables and consolidate workflows

-- Drop redundant tables that are no longer needed
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.planner_applications CASCADE; 
DROP TABLE IF EXISTS public.helper_applications CASCADE;
DROP TABLE IF EXISTS public.helper_approved_jobs CASCADE;

-- Update planner_requests to include all necessary fields for the workflow
ALTER TABLE public.planner_requests 
ADD COLUMN IF NOT EXISTS planner_id uuid REFERENCES public.planners(id);

-- Update helper_requests to ensure it can handle both planner and client requests
-- (client_id should already exist, planner_id should already exist)

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_planner_requests_client_id ON public.planner_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_planner_requests_planner_id ON public.planner_requests(planner_id);
CREATE INDEX IF NOT EXISTS idx_helper_requests_client_id ON public.helper_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_helper_requests_planner_id ON public.helper_requests(planner_id);
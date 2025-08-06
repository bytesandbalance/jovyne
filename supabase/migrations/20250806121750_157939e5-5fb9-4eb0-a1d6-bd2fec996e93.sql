-- Fix RLS policies for helper_requests to restrict access to helpers only
-- Update the view policy to only allow helpers to see requests
DROP POLICY IF EXISTS "Anyone can view open helper requests" ON public.helper_requests;

-- New policy: Only authenticated helpers can view helper requests
CREATE POLICY "Only helpers can view helper requests" 
ON public.helper_requests 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.helpers h
    JOIN public.profiles p ON h.user_id = p.user_id
    WHERE p.user_id = auth.uid()
  )
  OR 
  auth.uid() = (
    SELECT planners.user_id 
    FROM public.planners 
    WHERE planners.id = helper_requests.planner_id
  )
);

-- Create approved jobs view for helpers to see their upcoming work
CREATE OR REPLACE VIEW public.helper_approved_jobs AS
SELECT 
  hr.*,
  ha.applied_at,
  ha.reviewed_at,
  ha.message as application_message,
  p.business_name as planner_business_name,
  prof.full_name as planner_name
FROM public.helper_requests hr
JOIN public.helper_applications ha ON hr.id = ha.helper_request_id
JOIN public.planners p ON hr.planner_id = p.id
JOIN public.profiles prof ON p.user_id = prof.user_id
WHERE ha.status = 'approved';

-- Grant access to the view
GRANT SELECT ON public.helper_approved_jobs TO authenticated;

-- Add RLS policy for the view
ALTER VIEW public.helper_approved_jobs SET (security_invoker = on);

-- Add location filtering index for better performance
CREATE INDEX IF NOT EXISTS idx_helper_requests_location_city ON public.helper_requests(location_city);
CREATE INDEX IF NOT EXISTS idx_helper_requests_status_location ON public.helper_requests(status, location_city);
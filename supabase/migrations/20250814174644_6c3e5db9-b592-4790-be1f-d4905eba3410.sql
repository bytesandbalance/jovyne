-- Fix helper_applications UPDATE policies to allow either planners or helpers to update (permissive OR)
-- Drop existing restrictive UPDATE policies that may conflict
DROP POLICY IF EXISTS "Helpers can update their pending applications" ON public.helper_applications;
DROP POLICY IF EXISTS "Planners can update application status" ON public.helper_applications;

-- Recreate as permissive policies (default is PERMISSIVE)
CREATE POLICY "Helpers can update their pending applications"
ON public.helper_applications
FOR UPDATE
USING (
  helper_id = (SELECT h.id FROM public.helpers h WHERE h.user_id = auth.uid())
  AND status = 'pending'::public.application_status
)
WITH CHECK (
  helper_id = (SELECT h.id FROM public.helpers h WHERE h.user_id = auth.uid())
  AND status = 'pending'::public.application_status
);

CREATE POLICY "Planners can update application status"
ON public.helper_applications
FOR UPDATE
USING (
  auth.uid() = (
    SELECT p.user_id
    FROM public.planners p
    JOIN public.helper_requests hr ON hr.planner_id = p.id
    WHERE hr.id = public.helper_applications.helper_request_id
  )
)
WITH CHECK (
  auth.uid() = (
    SELECT p.user_id
    FROM public.planners p
    JOIN public.helper_requests hr ON hr.planner_id = p.id
    WHERE hr.id = public.helper_applications.helper_request_id
  )
);

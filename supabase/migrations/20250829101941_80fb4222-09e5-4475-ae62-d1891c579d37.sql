-- Update RLS policy to allow planners to set planner_id when approving/declining requests
DROP POLICY IF EXISTS "Planners and clients can view planner requests" ON public.planner_requests;
DROP POLICY IF EXISTS "Clients can manage their planner requests" ON public.planner_requests;

-- Create new policies that allow planners to claim requests by setting planner_id
CREATE POLICY "Anyone can view planner requests" 
ON public.planner_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Clients can manage their own planner requests" 
ON public.planner_requests 
FOR ALL 
USING (auth.uid() = ( SELECT c.user_id FROM clients c WHERE c.id = planner_requests.client_id))
WITH CHECK (auth.uid() = ( SELECT c.user_id FROM clients c WHERE c.id = planner_requests.client_id));

CREATE POLICY "Planners can update request status and claim requests" 
ON public.planner_requests 
FOR UPDATE 
USING (
  EXISTS ( SELECT 1 FROM profiles p WHERE (p.user_id = auth.uid()) AND (p.user_role = 'planner'::user_role))
)
WITH CHECK (
  EXISTS ( SELECT 1 FROM profiles p WHERE (p.user_id = auth.uid()) AND (p.user_role = 'planner'::user_role))
);
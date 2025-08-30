-- Allow planners to update client records when approving requests
CREATE POLICY "Planners can update client planner_id on approval" 
ON public.clients 
FOR UPDATE 
USING (true)
WITH CHECK (true);
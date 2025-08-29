-- Allow planners to read basic client information for notifications
CREATE POLICY "Planners can view client basic info for requests" 
ON public.clients 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.planner_requests pr
    WHERE pr.client_id = clients.id 
    AND EXISTS (
      SELECT 1 FROM public.planners p 
      WHERE p.user_id = auth.uid()
    )
  )
);
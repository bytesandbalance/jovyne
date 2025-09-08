-- Add DELETE policy for planners to delete external clients
CREATE POLICY "Planners can delete external clients" 
ON public.clients 
FOR DELETE 
USING (
  user_id IS NULL AND 
  planner_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM planners p 
    WHERE p.id = clients.planner_id 
    AND p.user_id = auth.uid()
  )
);
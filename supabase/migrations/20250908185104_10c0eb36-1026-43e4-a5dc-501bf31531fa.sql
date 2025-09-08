-- Add DELETE policy for planners to delete external invoices
CREATE POLICY "Planners can delete external invoices" 
ON public.planner_invoices 
FOR DELETE 
USING (
  planner_request_id IS NULL AND 
  EXISTS (
    SELECT 1 FROM planners p 
    WHERE p.id = planner_invoices.planner_id 
    AND p.user_id = auth.uid()
  )
);
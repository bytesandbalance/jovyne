-- Create a policy to allow planners to claim unlinked profiles
CREATE POLICY "Planners can claim unlinked profiles" 
ON public.planners 
FOR UPDATE 
USING (user_id IS NULL AND EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = auth.uid() AND p.user_role = 'planner'
))
WITH CHECK (user_id = auth.uid() AND EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = auth.uid() AND p.user_role = 'planner'
));
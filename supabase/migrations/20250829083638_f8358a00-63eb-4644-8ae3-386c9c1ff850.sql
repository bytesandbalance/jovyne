-- Fix infinite recursion in clients RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Clients can manage their own profile" ON public.clients;
DROP POLICY IF EXISTS "Planners can create client records" ON public.clients;
DROP POLICY IF EXISTS "Planners can manage their assigned clients" ON public.clients;
DROP POLICY IF EXISTS "Planners can view client basic info for requests" ON public.clients;

-- Create simple, non-recursive policies
CREATE POLICY "Clients can manage their own profile" 
ON public.clients 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Planners can view their assigned clients" 
ON public.clients 
FOR SELECT 
USING (planner_id IS NOT NULL AND EXISTS (
  SELECT 1 FROM public.planners p 
  WHERE p.id = clients.planner_id AND p.user_id = auth.uid()
));

CREATE POLICY "Anyone can view basic client info for public requests" 
ON public.clients 
FOR SELECT 
USING (true);
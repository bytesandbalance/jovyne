-- Fix RLS policies for clients table to prevent unauthorized access to customer contact information

-- Drop the existing overly restrictive policy
DROP POLICY IF EXISTS "Planners can manage their own clients" ON public.clients;

-- Create proper RLS policies for the clients table
-- 1. Clients can view and update their own profile data
CREATE POLICY "Clients can manage their own profile" 
ON public.clients 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Planners can view and manage clients assigned to them
CREATE POLICY "Planners can manage their assigned clients" 
ON public.clients 
FOR ALL 
USING (planner_id = (
  SELECT p.id 
  FROM public.planners p 
  WHERE p.user_id = auth.uid()
))
WITH CHECK (planner_id = (
  SELECT p.id 
  FROM public.planners p 
  WHERE p.user_id = auth.uid()
));

-- 3. Allow planners to create new client records (for when they add clients manually)
CREATE POLICY "Planners can create client records" 
ON public.clients 
FOR INSERT 
WITH CHECK (
  planner_id = (
    SELECT p.id 
    FROM public.planners p 
    WHERE p.user_id = auth.uid()
  ) 
  OR auth.uid() = user_id
);
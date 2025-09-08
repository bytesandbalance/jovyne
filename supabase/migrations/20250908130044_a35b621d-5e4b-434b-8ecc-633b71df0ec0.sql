-- Fix RLS policies for clients table to allow planners to add manual clients
-- Add policy for planners to create client records for external clients
CREATE POLICY "Planners can create client records for external clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (
  -- Allow planners to create client records where user_id is null (external clients)
  user_id IS NULL AND
  EXISTS (
    SELECT 1 FROM public.planners p 
    WHERE p.user_id = auth.uid()
  )
);

-- Fix RLS policies for planner_invoices table to ensure INSERT works properly
-- Drop and recreate the INSERT policy to make sure it works correctly
DROP POLICY IF EXISTS "Planners can create their own invoices" ON public.planner_invoices;

CREATE POLICY "Planners can create their own invoices" 
ON public.planner_invoices 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.planners p 
    WHERE p.id = planner_invoices.planner_id 
    AND p.user_id = auth.uid()
  )
);
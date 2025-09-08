-- Check existing RLS policies for planner_invoices table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'planner_invoices';

-- Enable RLS on planner_invoices table if not already enabled
ALTER TABLE public.planner_invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Planners can view their own invoices" ON public.planner_invoices;
DROP POLICY IF EXISTS "Planners can create their own invoices" ON public.planner_invoices;
DROP POLICY IF EXISTS "Planners can update their own invoices" ON public.planner_invoices;
DROP POLICY IF EXISTS "Clients can view invoices sent to them" ON public.planner_invoices;
DROP POLICY IF EXISTS "Clients can update payment status" ON public.planner_invoices;

-- Create comprehensive RLS policies for planner_invoices
-- Allow planners to view their own invoices
CREATE POLICY "Planners can view their own invoices" 
ON public.planner_invoices 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.planners p 
    WHERE p.id = planner_invoices.planner_id 
    AND p.user_id = auth.uid()
  )
);

-- Allow planners to create their own invoices
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

-- Allow planners to update their own invoices (when status allows it)
CREATE POLICY "Planners can update their own invoices" 
ON public.planner_invoices 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.planners p 
    WHERE p.id = planner_invoices.planner_id 
    AND p.user_id = auth.uid()
  )
);

-- Allow clients to view invoices sent to them
CREATE POLICY "Clients can view invoices sent to them" 
ON public.planner_invoices 
FOR SELECT 
USING (
  client_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = planner_invoices.client_id 
    AND c.user_id = auth.uid()
  )
);

-- Allow clients to update payment status on their invoices
CREATE POLICY "Clients can update payment status" 
ON public.planner_invoices 
FOR UPDATE 
USING (
  client_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = planner_invoices.client_id 
    AND c.user_id = auth.uid()
  )
);
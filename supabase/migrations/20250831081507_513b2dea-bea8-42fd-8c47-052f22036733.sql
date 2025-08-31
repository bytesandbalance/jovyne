-- Critical Security Fix: Remove public access to sensitive client data
DROP POLICY IF EXISTS "Anyone can view basic client info for public requests" ON public.clients;

-- Create more restrictive policies for clients table
CREATE POLICY "Clients can view their own data" 
ON public.clients 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Planners can view assigned client basic info" 
ON public.clients 
FOR SELECT 
USING (
  planner_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.planners p 
    WHERE p.id = clients.planner_id 
    AND p.user_id = auth.uid()
  )
);

-- Critical Security Fix: Remove public access to business proposals
DROP POLICY IF EXISTS "Anyone can view planner applications" ON public.planner_applications;

-- Create restrictive policies for planner applications
CREATE POLICY "Planners can view their own applications" 
ON public.planner_applications 
FOR SELECT 
USING (
  planner_id = (
    SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Clients can view applications for their requests" 
ON public.planner_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.planner_requests pr
    JOIN public.clients c ON c.id = pr.client_id
    WHERE pr.id = planner_applications.planner_request_id
    AND c.user_id = auth.uid()
  )
);

-- Security Fix: Restrict planner requests to authenticated users only
DROP POLICY IF EXISTS "Anyone can view planner requests" ON public.planner_requests;

CREATE POLICY "Authenticated users can view planner requests" 
ON public.planner_requests 
FOR SELECT 
USING (auth.role() = 'authenticated');
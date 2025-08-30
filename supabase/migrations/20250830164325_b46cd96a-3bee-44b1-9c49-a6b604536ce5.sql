-- Create planner applications for existing approved requests to generate missing invoices
INSERT INTO public.planner_applications (
  planner_request_id,
  planner_id,
  status,
  proposed_fee,
  estimated_hours,
  created_at,
  updated_at
)
SELECT 
  pr.id,
  pr.planner_id,
  'approved',
  pr.budget, -- Use request budget as proposed fee
  pr.total_hours,
  pr.updated_at,
  pr.updated_at
FROM public.planner_requests pr
WHERE pr.status = 'approved' 
  AND pr.planner_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.planner_applications pa 
    WHERE pa.planner_request_id = pr.id
  );

-- This will trigger our existing function to create invoices for these applications
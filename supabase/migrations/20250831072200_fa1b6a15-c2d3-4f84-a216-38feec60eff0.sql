-- Delete duplicate planner invoices (keep only the oldest one for each application)
DELETE FROM public.planner_invoices 
WHERE id NOT IN (
  SELECT DISTINCT ON (planner_application_id) id
  FROM public.planner_invoices
  ORDER BY planner_application_id, created_at ASC
);

-- Delete duplicate helper invoices if any exist (keep only the oldest one for each application)  
DELETE FROM public.helper_invoices
WHERE id NOT IN (
  SELECT DISTINCT ON (helper_application_id) id  
  FROM public.helper_invoices
  WHERE helper_application_id IS NOT NULL
  ORDER BY helper_application_id, created_at ASC
)
AND helper_application_id IS NOT NULL;
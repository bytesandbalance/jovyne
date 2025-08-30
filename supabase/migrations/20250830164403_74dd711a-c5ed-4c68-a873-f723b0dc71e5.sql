-- Trigger the invoice creation by updating the planner application
-- This will fire our trigger function to create the missing invoice
UPDATE public.planner_applications 
SET updated_at = now()
WHERE id = '2b848230-3f05-4ded-9526-a5fbf4a1501d' AND status = 'approved';
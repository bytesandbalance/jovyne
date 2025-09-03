-- Clear dummy user_id from Event Planning Business so it can be linked
UPDATE public.planners 
SET user_id = NULL 
WHERE business_name = 'Event Planning Business' 
AND user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8';
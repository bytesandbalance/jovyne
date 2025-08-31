-- Update planner_requests to reference the correct client record
UPDATE public.planner_requests 
SET client_id = '12ece6c9-e1b5-4d62-b13e-681331c614b5'
WHERE client_id = 'f5c0e455-3545-439e-91fc-6b194af3d50a';

-- Update any helper_requests that might reference the wrong client
UPDATE public.helper_requests 
SET client_id = '12ece6c9-e1b5-4d62-b13e-681331c614b5'
WHERE client_id = 'f5c0e455-3545-439e-91fc-6b194af3d50a';

-- Now safely delete the duplicate client record
DELETE FROM public.clients 
WHERE id = 'f5c0e455-3545-439e-91fc-6b194af3d50a';

-- Clean up duplicate profile records
DELETE FROM public.profiles 
WHERE email = 'peggycomeback@gmail.com' 
AND user_id != 'b1efadab-bc83-4357-80f0-1277a0804a42';
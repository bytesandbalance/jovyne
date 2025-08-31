-- Clean up duplicate client records, keeping the one with the planner assignment
DELETE FROM public.clients 
WHERE user_id = 'b1efadab-bc83-4357-80f0-1277a0804a42' 
AND planner_id IS NULL;

-- Clean up duplicate profile records, keeping the most recent one
DELETE FROM public.profiles 
WHERE email = 'peggycomeback@gmail.com' 
AND user_id != 'b1efadab-bc83-4357-80f0-1277a0804a42';

-- Remove any orphaned client records (where user_id doesn't exist in profiles)
DELETE FROM public.clients 
WHERE user_id NOT IN (SELECT user_id FROM public.profiles);
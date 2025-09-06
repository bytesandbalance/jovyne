-- Update the planner profile to use the current user ID
UPDATE public.planners 
SET user_id = 'c8e03983-22fa-4825-8128-49688bcca0c3'
WHERE email = 'pflashgary@gmail.com';

-- Update the profile record to use the current user ID  
UPDATE public.profiles 
SET user_id = 'c8e03983-22fa-4825-8128-49688bcca0c3'
WHERE email = 'pflashgary@gmail.com';

-- Clean up any duplicate profiles
DELETE FROM public.profiles 
WHERE user_id = '856a2496-e4fa-4815-9d34-13aef8a65099';
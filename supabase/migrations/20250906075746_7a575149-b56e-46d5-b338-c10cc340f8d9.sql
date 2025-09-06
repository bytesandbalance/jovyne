-- Delete the old profile record and update planner to current user
DELETE FROM public.profiles WHERE user_id = '856a2496-e4fa-4815-9d34-13aef8a65099';

-- Update planner profile to current user ID
UPDATE public.planners 
SET user_id = 'c8e03983-22fa-4825-8128-49688bcca0c3'
WHERE email = 'pflashgary@gmail.com';

-- Update existing profile to be planner role
UPDATE public.profiles 
SET user_role = 'planner', email = 'pflashgary@gmail.com', full_name = 'Pegah'
WHERE user_id = 'c8e03983-22fa-4825-8128-49688bcca0c3';
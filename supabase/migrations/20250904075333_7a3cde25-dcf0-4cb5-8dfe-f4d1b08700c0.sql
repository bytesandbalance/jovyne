-- First, identify planner user_ids to preserve
CREATE TEMP TABLE planner_users AS 
SELECT DISTINCT user_id 
FROM public.planners 
WHERE user_id IS NOT NULL;

-- Clear all tables except planners (in proper order to avoid foreign key issues)
DELETE FROM public.reviews;
DELETE FROM public.messages;
DELETE FROM public.planner_invoices;
DELETE FROM public.planner_applications;
DELETE FROM public.events;
DELETE FROM public.planner_requests;
DELETE FROM public.clients;

-- Delete profiles for non-planner users
DELETE FROM public.profiles 
WHERE user_id NOT IN (SELECT user_id FROM planner_users);

-- Note: We cannot delete from auth.users directly via SQL migration
-- The user will need to manually delete non-planner users from the Supabase Auth dashboard
-- or we can provide them with a list of user IDs to keep

SELECT 'Keep these user IDs in auth.users:' as instruction, user_id 
FROM planner_users;
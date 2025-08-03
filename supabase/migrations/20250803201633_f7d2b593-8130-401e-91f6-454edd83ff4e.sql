-- Update user role from client to planner
UPDATE public.profiles 
SET user_role = 'planner'
WHERE user_role = 'client';

-- Create a planner profile for the user if they don't have one
INSERT INTO public.planners (user_id, business_name, description, years_experience, base_price)
SELECT 
  user_id,
  'Event Planning Business',
  'Professional event planning services',
  2,
  1500.00
FROM public.profiles 
WHERE user_role = 'planner' 
AND user_id NOT IN (SELECT user_id FROM public.planners);
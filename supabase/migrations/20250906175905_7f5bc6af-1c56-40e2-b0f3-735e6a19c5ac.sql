-- Start free trial for the current planner
UPDATE public.planners 
SET 
  subscription_status = 'trial',
  free_trial_started_at = now(),
  subscription_expires_at = now() + interval '1 month'
WHERE user_id = 'c8e03983-22fa-4825-8128-49688bcca0c3';
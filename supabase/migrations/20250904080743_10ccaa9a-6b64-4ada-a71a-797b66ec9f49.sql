-- Clean up duplicate profiles, keep only the most recent
DELETE FROM public.profiles 
WHERE user_id = '6bf0a1bb-27d6-453b-9a06-e54dd933b732';
-- Check triggers more specifically
\d+ auth.users

-- Get all triggers on auth.users
SELECT tgname, tgfoid::regproc as function_name
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;
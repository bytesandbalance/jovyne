-- Check ALL triggers on auth.users table
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_timing,
    t.action_statement,
    t.trigger_schema
FROM information_schema.triggers t
WHERE t.event_object_table = 'users' 
AND t.event_object_schema = 'auth'
ORDER BY t.trigger_name;

-- Also check if the function itself might be called multiple times
SELECT proname, prosrc FROM pg_proc WHERE proname LIKE '%handle_new_user%';
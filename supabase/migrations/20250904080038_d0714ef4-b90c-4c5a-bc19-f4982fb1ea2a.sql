-- Check what triggers exist on auth.users
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.action_timing,
    t.action_statement
FROM information_schema.triggers t
WHERE t.event_object_table = 'users' 
AND t.event_object_schema = 'auth';

-- Also check for any duplicate triggers
SELECT 
    trigger_name,
    COUNT(*) as count
FROM information_schema.triggers 
WHERE trigger_name LIKE '%handle_new_user%' OR trigger_name LIKE '%new_user%'
GROUP BY trigger_name;
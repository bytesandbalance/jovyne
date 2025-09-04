-- Get all triggers on auth.users table
SELECT 
    tgname as trigger_name,
    tgfoid::regproc as function_name,
    CASE 
        WHEN tgtype & 2 = 2 THEN 'BEFORE'
        WHEN tgtype & 2 = 0 THEN 'AFTER'
    END as timing,
    CASE 
        WHEN tgtype & 4 = 4 THEN 'INSERT'
        WHEN tgtype & 8 = 8 THEN 'DELETE'
        WHEN tgtype & 16 = 16 THEN 'UPDATE'
    END as event
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass
AND NOT tgisinternal;
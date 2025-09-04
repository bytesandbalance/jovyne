-- Find orphaned profiles (profiles without corresponding auth users)
-- First, let's see what we have in profiles
SELECT 
    p.id,
    p.user_id,
    p.email,
    p.full_name,
    p.created_at,
    CASE 
        WHEN au.id IS NULL THEN 'ORPHANED - user deleted from auth'
        ELSE 'Valid user exists'
    END as status
FROM public.profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
ORDER BY p.created_at DESC;
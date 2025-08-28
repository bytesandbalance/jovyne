-- First, delete client records that have no matching auth user profiles
-- These are orphaned records that cannot be linked to any real user
DELETE FROM public.clients 
WHERE user_id IS NULL 
  AND email NOT IN (
    SELECT email 
    FROM public.profiles 
    WHERE user_role = 'client'
  );

-- Now update the remaining client records with their correct user_id
UPDATE public.clients 
SET user_id = profiles.user_id
FROM public.profiles 
WHERE profiles.email = clients.email 
  AND profiles.user_role = 'client'
  AND clients.user_id IS NULL;

-- Finally, make user_id NOT NULL since all valid clients should have a user_id
ALTER TABLE public.clients ALTER COLUMN user_id SET NOT NULL;
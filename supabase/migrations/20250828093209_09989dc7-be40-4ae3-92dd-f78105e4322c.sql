-- Fix client records by linking them to their corresponding user profiles
-- Update existing client records to have the correct user_id

UPDATE public.clients 
SET user_id = profiles.user_id
FROM public.profiles 
WHERE profiles.email = clients.email 
  AND profiles.user_role = 'client'
  AND clients.user_id IS NULL;

-- Ensure all clients have a non-null user_id going forward
ALTER TABLE public.clients ALTER COLUMN user_id SET NOT NULL;
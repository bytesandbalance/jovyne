-- Drop the incorrect foreign key and add the correct one
ALTER TABLE public.helpers 
DROP CONSTRAINT IF EXISTS helpers_user_id_fkey;

-- Add the correct foreign key to auth.users
ALTER TABLE public.helpers 
ADD CONSTRAINT helpers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
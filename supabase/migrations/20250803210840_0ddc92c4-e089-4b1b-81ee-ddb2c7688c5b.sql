-- Add foreign key relationship between helpers and profiles
ALTER TABLE public.helpers 
ADD CONSTRAINT helpers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
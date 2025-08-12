-- Restrict public access to sensitive profile data and expose a safe RPC for public fields

-- 1) Remove overly permissive SELECT policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Users can view all profiles'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view all profiles" ON public.profiles';
  END IF;
END $$;

-- 2) Create least-privilege SELECT policy (self only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Users can view their own profile'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Users can view their own profile"
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = user_id);
    $$;
  END IF;
END $$;

-- 3) Safe RPC to fetch public profile fields only (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_public_profiles(user_ids uuid[] DEFAULT NULL)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text
) AS $$
  SELECT p.user_id, p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE user_ids IS NULL OR p.user_id = ANY (user_ids);
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path TO '';

GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO anon, authenticated;
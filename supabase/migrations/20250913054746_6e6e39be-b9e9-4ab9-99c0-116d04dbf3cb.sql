-- Drop existing policies that require is_verified = true
DROP POLICY IF EXISTS "Anonymous users can view verified planners" ON public.planners;
DROP POLICY IF EXISTS "Authenticated users can view all verified planners" ON public.planners;

-- Restrict access to planners table to owners only (to protect sensitive columns)
-- Only planners can see their own full records including subscription data
CREATE POLICY "Planners can view own full profile"
ON public.planners
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure planners_public table is accessible for public browsing
-- This table excludes sensitive columns and should be used for discovery
ALTER TABLE public.planners_public DISABLE ROW LEVEL SECURITY;

-- Create policies for planners_public to handle authenticated vs anonymous access
ALTER TABLE public.planners_public ENABLE ROW LEVEL SECURITY;

-- Anonymous users can view all planners in planners_public (for homepage top 3)
CREATE POLICY "Anonymous can view public planners"
ON public.planners_public
FOR SELECT
TO anon
USING (true);

-- Authenticated users can view all planners in planners_public (for full browsing)
CREATE POLICY "Authenticated can view public planners"
ON public.planners_public
FOR SELECT
TO authenticated
USING (true);
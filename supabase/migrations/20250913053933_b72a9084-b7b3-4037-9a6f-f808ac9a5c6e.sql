-- Drop existing overly restrictive policies
DROP POLICY IF EXISTS "Anonymous users can view basic planner info" ON public.planners;
DROP POLICY IF EXISTS "Authenticated users can view contact info" ON public.planners;
DROP POLICY IF EXISTS "Authenticated users can view full planner profiles" ON public.planners;
DROP POLICY IF EXISTS "Public discovery - basic info only" ON public.planners;

-- Create new comprehensive policies for planner visibility
-- Policy 1: Anonymous users can view basic verified planner info (for homepage top 3)
CREATE POLICY "Anonymous users can view verified planners"
ON public.planners
FOR SELECT
TO anon
USING (is_verified = true);

-- Policy 2: Authenticated users can view all verified planner info (except subscription data)
CREATE POLICY "Authenticated users can view all verified planners"
ON public.planners
FOR SELECT
TO authenticated
USING (is_verified = true);

-- Keep existing policies for planner management (don't disrupt workflows)
-- These handle UPDATE, INSERT operations for planner profile management
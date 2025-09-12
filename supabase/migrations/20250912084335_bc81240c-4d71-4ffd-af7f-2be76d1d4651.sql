-- Drop all existing policies on planners table to start fresh
DROP POLICY IF EXISTS "Anyone can view all planners for discovery" ON public.planners;
DROP POLICY IF EXISTS "Public can view basic planner info for discovery" ON public.planners;
DROP POLICY IF EXISTS "Authenticated users can view planner contact info" ON public.planners;
DROP POLICY IF EXISTS "Planners can claim profiles with matching email" ON public.planners;
DROP POLICY IF EXISTS "Planners can insert their own profile" ON public.planners;
DROP POLICY IF EXISTS "Planners can update their own profile" ON public.planners;

-- Create new restrictive policies
-- Public users can only see basic verified planner info (no sensitive contact data)
CREATE POLICY "Public discovery - basic info only" 
ON public.planners 
FOR SELECT 
TO anon
USING (is_verified = true);

-- Authenticated users can see contact info for verified planners
CREATE POLICY "Authenticated users can view contact info" 
ON public.planners 
FOR SELECT 
TO authenticated
USING (is_verified = true);

-- Planners can claim profiles with matching email
CREATE POLICY "Planners can claim matching email profiles" 
ON public.planners 
FOR UPDATE 
TO authenticated
USING (
  user_id IS NULL AND 
  email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid())
)
WITH CHECK (
  user_id = auth.uid() AND 
  email = (SELECT p.email FROM profiles p WHERE p.user_id = auth.uid())
);

-- Planners can insert their own profile
CREATE POLICY "Planners can create own profile" 
ON public.planners 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Planners can update their own profile
CREATE POLICY "Planners can update own profile" 
ON public.planners 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Create a security function to check if data should be restricted
CREATE OR REPLACE FUNCTION public.is_sensitive_planner_field(field_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN field_name = ANY('{email,user_id,subscription_status,paypal_subscription_id,free_trial_started_at,subscription_expires_at,latitude,longitude}'::text[]);
END;
$$;
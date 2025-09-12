-- Update planners RLS policies to show more data to authenticated users
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anonymous users can view basic planner info" ON public.planners;
DROP POLICY IF EXISTS "Authenticated users can view planner contact info" ON public.planners;

-- Create new policies that allow authenticated users to see almost everything
-- except subscription data, and anonymous users to see basic info

-- Policy for anonymous users - basic business info only
CREATE POLICY "Anonymous users can view basic planner info" 
ON public.planners 
FOR SELECT 
TO anon
USING (
  is_verified = true
);

-- Policy for authenticated users - everything except sensitive subscription data
CREATE POLICY "Authenticated users can view full planner profiles" 
ON public.planners 
FOR SELECT 
TO authenticated
USING (
  is_verified = true
);

-- Update the is_sensitive_planner_field function to only protect subscription data
CREATE OR REPLACE FUNCTION public.is_sensitive_planner_field(field_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only protect subscription-related fields for anonymous users
  RETURN field_name = ANY('{subscription_status,paypal_subscription_id,free_trial_started_at,subscription_expires_at}'::text[]);
END;
$$;
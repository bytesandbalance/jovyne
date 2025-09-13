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

-- Create new policies for public access that exclude sensitive columns
-- We'll use a function to filter out sensitive fields for non-owners
CREATE OR REPLACE FUNCTION public.get_public_planner_data()
RETURNS TABLE (
  id uuid,
  business_name text,
  description text,
  location_city text,
  location_state text,
  specialties text[],
  services text[],
  years_experience integer,
  base_price numeric,
  average_rating numeric,
  total_reviews integer,
  portfolio_images text[],
  instagram_handle text,
  website_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  latitude numeric,
  longitude numeric,
  email text,
  user_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.business_name,
    p.description,
    p.location_city,
    p.location_state,
    p.specialties,
    p.services,
    p.years_experience,
    p.base_price,
    p.average_rating,
    p.total_reviews,
    p.portfolio_images,
    p.instagram_handle,
    p.website_url,
    p.created_at,
    p.updated_at,
    p.latitude,
    p.longitude,
    p.email,
    p.user_id
  FROM public.planners p
  -- Remove is_verified requirement as requested
  WHERE true;
$$;

-- Allow public access to the function for discovery
GRANT EXECUTE ON FUNCTION public.get_public_planner_data() TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_planner_data() TO authenticated;
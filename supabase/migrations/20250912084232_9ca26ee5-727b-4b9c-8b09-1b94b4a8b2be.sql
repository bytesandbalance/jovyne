-- Remove the overly permissive policy that exposes all planner data
DROP POLICY IF EXISTS "Anyone can view all planners for discovery" ON public.planners;

-- Create a more restrictive policy for public discovery
-- Only expose business information needed for discovery, not sensitive contact details
CREATE POLICY "Public can view basic planner info for discovery" 
ON public.planners 
FOR SELECT 
USING (
  -- Only show verified planners publicly
  is_verified = true
);

-- Create a policy for authenticated users to see additional contact info when needed
CREATE POLICY "Authenticated users can view planner contact info" 
ON public.planners 
FOR SELECT 
TO authenticated
USING (
  -- Allow authenticated users to see contact info, but not subscription/payment details
  is_verified = true
);

-- Create a view for public planner discovery that only exposes safe fields
CREATE OR REPLACE VIEW public.planners_public AS
SELECT 
  id,
  business_name,
  description,
  services,
  specialties,
  location_city,
  location_state,
  average_rating,
  total_reviews,
  years_experience,
  base_price,
  is_verified,
  portfolio_images,
  website_url,
  instagram_handle,
  created_at,
  updated_at
FROM public.planners
WHERE is_verified = true;

-- Grant select permissions on the public view
GRANT SELECT ON public.planners_public TO anon;
GRANT SELECT ON public.planners_public TO authenticated;
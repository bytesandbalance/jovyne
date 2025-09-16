-- First drop and recreate the planners_public view without specialties column
DROP VIEW IF EXISTS public.planners_public;

-- Create the planners_public view without specialties, using category instead
CREATE VIEW public.planners_public AS
SELECT 
  id,
  business_name,
  description,
  location_city,
  location_state,
  category,
  services,
  years_experience,
  base_price,
  average_rating,
  total_reviews,
  portfolio_images,
  instagram_handle,
  website_url,
  is_verified,
  created_at,
  updated_at
FROM public.planners;

-- Now we can safely remove the specialties column from planners table
ALTER TABLE public.planners DROP COLUMN IF EXISTS specialties;
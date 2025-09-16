-- Fix RPC to not reference removed column and maintain return shape
CREATE OR REPLACE FUNCTION public.get_public_planner_data()
RETURNS TABLE(
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
  email text,
  is_verified boolean,
  category text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.business_name,
    p.description,
    p.location_city,
    p.location_state,
    COALESCE(p.category, p.services, '{}'::text[]) AS specialties,
    p.services,
    p.years_experience,
    p.base_price,
    p.average_rating,
    p.total_reviews,
    p.portfolio_images,
    p.instagram_handle,
    p.website_url,
    p.email,
    p.is_verified,
    p.category
  FROM public.planners p
  WHERE true;
$$;
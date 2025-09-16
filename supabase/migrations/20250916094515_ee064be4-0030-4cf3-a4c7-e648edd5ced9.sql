-- Remove the specialties column from planners table as it overlaps with category
ALTER TABLE public.planners DROP COLUMN IF EXISTS specialties;
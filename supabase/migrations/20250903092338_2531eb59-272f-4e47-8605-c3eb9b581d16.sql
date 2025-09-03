-- Add email field to planners table for security
ALTER TABLE public.planners ADD COLUMN email text;

-- Update existing planner profiles with email addresses for verification
-- This will need to be populated manually for existing businesses
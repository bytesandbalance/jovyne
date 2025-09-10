-- Set all planners to unverified status
-- This matches the real workflow where planners must sign up and verify their email to become verified

UPDATE public.planners 
SET is_verified = false
WHERE is_verified = true;
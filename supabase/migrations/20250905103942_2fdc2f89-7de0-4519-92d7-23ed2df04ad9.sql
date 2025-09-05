-- Add subscription columns to planners table
ALTER TABLE public.planners 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE NULL;

-- Update existing planners to have 'none' status
UPDATE public.planners 
SET subscription_status = 'none' 
WHERE subscription_status IS NULL;
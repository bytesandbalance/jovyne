-- Set email for Event Planning Business to match your account
UPDATE public.planners 
SET email = 'pflashgary@gmail.com' 
WHERE business_name = 'Event Planning Business';

-- Drop the old policy and create a secure one that requires email matching
DROP POLICY IF EXISTS "Planners can claim unlinked profiles" ON public.planners;

CREATE POLICY "Planners can claim profiles with matching email" 
ON public.planners 
FOR UPDATE 
USING (
  user_id IS NULL 
  AND email = (SELECT p.email FROM public.profiles p WHERE p.user_id = auth.uid())
)
WITH CHECK (
  user_id = auth.uid() 
  AND email = (SELECT p.email FROM public.profiles p WHERE p.user_id = auth.uid())
);
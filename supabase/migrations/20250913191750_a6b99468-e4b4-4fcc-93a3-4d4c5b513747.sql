-- Update newly added New Zealand planners to set is_verified = false

UPDATE public.planners 
SET is_verified = false
WHERE business_name IN (
  'A Touch Of Class Weddings and Events Ltd',
  'GK Events Hire',
  'Wicked Stag Parties',
  'Wicked Hens Parties New Zealand',
  'Cupid Creative',
  'Insphire',
  'The Vintage Party',
  'Party Essentials Ltd'
);
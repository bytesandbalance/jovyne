-- Add category column to planners table
ALTER TABLE public.planners ADD COLUMN category text[] DEFAULT '{}';

-- Update existing planners with appropriate categories based on their business type and services

-- Event Planning & Coordination companies
UPDATE public.planners SET category = ARRAY['Others'] 
WHERE business_name IN (
  '2gether Event',
  'Adebar Event Agency', 
  'ARISE Events',
  'B-ceed Events',
  'Black Ice Events',
  'BLEND Hospitality',
  'Boche Events'
);

-- Wedding-focused planners
UPDATE public.planners SET category = ARRAY['Others', 'Stylists'] 
WHERE business_name IN (
  'A Touch Of Class Weddings and Events Ltd',
  'Agentur Traumhochzeit', 
  'Amelie Weddings',
  'Avec Marie Events',
  'Be Unique Event',
  'Bettina Weddings',
  'Carinas Hochzeitsplanung'
);

-- Decoration & Styling specialists
UPDATE public.planners SET category = ARRAY['Decoration', 'Stylists']
WHERE business_name IN (
  'Agentur Esprit'
);

-- Entertainment & Party specialists  
UPDATE public.planners SET category = ARRAY['Entertainment', 'Others']
WHERE business_name IN (
  'Wicked Stag Parties',
  'Wicked Hens Parties New Zealand',
  'Party Essentials Ltd'
);

-- Venues & Equipment
UPDATE public.planners SET category = ARRAY['Venues', 'Others']
WHERE business_name IN (
  'GK Events Hire'
);

-- Creative & Design services
UPDATE public.planners SET category = ARRAY['Stylists', 'Decoration', 'Others']
WHERE business_name IN (
  'Cupid Creative',
  'Insphire',
  'The Vintage Party'
);

-- Catering & Hospitality (if any exist, will check in data)
-- Photography/Videography (if any exist, will check in data)

-- Ensure all planners have at least one category assigned
UPDATE public.planners SET category = ARRAY['Others'] 
WHERE category = '{}' OR category IS NULL;
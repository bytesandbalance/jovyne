-- Upload portfolio images for planners and update their portfolio_images arrays
-- First, let's update planners based on their specialties with appropriate portfolio images

-- Corporate/Business Events planners
UPDATE public.planners 
SET portfolio_images = ARRAY[
  'https://ijcxgimuotmllyewptce.supabase.co/storage/v1/object/public/portfolios/corporate-event-1.jpg',
  'https://ijcxgimuotmllyewptce.supabase.co/storage/v1/object/public/portfolios/conference-event-1.jpg'
]
WHERE specialties && ARRAY['Corporate Functions', 'Corporate Events', 'International Business Events', 'Conferences']
AND business_name != 'Event Planning Business';

-- Wedding planners
UPDATE public.planners 
SET portfolio_images = ARRAY[
  'https://ijcxgimuotmllyewptce.supabase.co/storage/v1/object/public/portfolios/wedding-ceremony-1.jpg',
  'https://ijcxgimuotmllyewptce.supabase.co/storage/v1/object/public/portfolios/luxury-wedding-1.jpg'
]
WHERE specialties && ARRAY['Weddings', 'Unique Weddings', 'Luxury Weddings', 'Multicultural Weddings']
AND business_name != 'Event Planning Business';

-- Birthday/Party planners
UPDATE public.planners 
SET portfolio_images = ARRAY[
  'https://ijcxgimuotmllyewptce.supabase.co/storage/v1/object/public/portfolios/birthday-party-1.jpg'
]
WHERE specialties && ARRAY['Birthday Parties', 'Private Celebrations', 'Festivals']
AND NOT (specialties && ARRAY['Weddings', 'Corporate Functions'])
AND business_name != 'Event Planning Business';

-- Multicultural/International planners
UPDATE public.planners 
SET portfolio_images = ARRAY[
  'https://ijcxgimuotmllyewptce.supabase.co/storage/v1/object/public/portfolios/multicultural-event-1.jpg',
  'https://ijcxgimuotmllyewptce.supabase.co/storage/v1/object/public/portfolios/wedding-ceremony-1.jpg'
]
WHERE specialties && ARRAY['International Events', 'Cultural Events', 'Traditional Ceremonies', 'Multicultural Weddings']
AND business_name != 'Event Planning Business';

-- Mixed event planners (those with diverse specialties)
UPDATE public.planners 
SET portfolio_images = ARRAY[
  'https://ijcxgimuotmllyewptce.supabase.co/storage/v1/object/public/portfolios/corporate-event-1.jpg',
  'https://ijcxgimuotmllyewptce.supabase.co/storage/v1/object/public/portfolios/birthday-party-1.jpg'
]
WHERE (specialties && ARRAY['Corporate Functions', 'Corporate Events'] AND specialties && ARRAY['Birthday Parties', 'Private Celebrations'])
AND business_name != 'Event Planning Business';
-- Insert New Zealand party planners from eventplanner.co.nz and eventi.co.nz

-- Insert A Touch Of Class Weddings and Events Ltd
INSERT INTO public.planners (
  business_name,
  description,
  location_city,
  location_state,
  email,
  specialties,
  services,
  years_experience,
  base_price,
  average_rating,
  total_reviews,
  portfolio_images,
  is_verified
) VALUES (
  'A Touch Of Class Weddings and Events Ltd',
  'Whether you''re planning a classic wedding, elegant awards evening or themed event, ensure your function has ''A Touch of Class''.',
  'Auckland',
  'Auckland',
  'info@atouchofclass.co.nz',
  ARRAY['weddings', 'awards evenings', 'themed events', 'elegant events'],
  ARRAY['event planning', 'wedding coordination', 'corporate events', 'styling'],
  10,
  2500.00,
  4.8,
  23,
  ARRAY['https://eventi.co.nz/wp-content/uploads/2024/12/TomandTomosWedding2024315of896-1024x683.jpg'],
  true
);

-- Insert GK Events Hire
INSERT INTO public.planners (
  business_name,
  description,
  location_city,
  location_state,
  email,
  specialties,
  services,
  years_experience,
  base_price,
  average_rating,
  total_reviews,
  portfolio_images,
  is_verified
) VALUES (
  'GK Events Hire',
  'GK Events Hire offers unique, hand-crafted, quality items to make your day stand out. Nelson based, Gareth and Kim Rosser have established an events business based on creativity and attention to detail. Create a unique day with GK!',
  'Nelson',
  'Tasman',
  'info@gkevents.co.nz',
  ARRAY['creative events', 'hand-crafted items', 'unique celebrations', 'weddings'],
  ARRAY['event styling', 'custom decorations', 'event planning', 'creative design'],
  8,
  1800.00,
  4.9,
  17,
  ARRAY['https://eventplanner.co.nz/logos/profile/limage-33029-333-photo.jpg'],
  true
);

-- Insert Wicked Stag Parties
INSERT INTO public.planners (
  business_name,
  description,
  location_city,
  location_state,
  email,
  specialties,
  services,
  years_experience,
  base_price,
  average_rating,
  total_reviews,
  portfolio_images,
  is_verified
) VALUES (
  'Wicked Stag Parties',
  'New Zealand''s premier stag party planning service. We organize unforgettable bachelor parties across Auckland, Taupo, and Wellington with exciting packages and activities.',
  'Auckland',
  'Auckland',
  'info@wickedstag.co.nz',
  ARRAY['stag parties', 'bachelor parties', 'adventure activities', 'group events'],
  ARRAY['stag party planning', 'activity coordination', 'group bookings', 'entertainment'],
  6,
  800.00,
  4.7,
  145,
  ARRAY['https://eventi.co.nz/wp-content/uploads/2025/07/wicked-stag-eventi-listing-1-1.jpg'],
  true
);

-- Insert Wicked Hens Parties New Zealand
INSERT INTO public.planners (
  business_name,
  description,
  location_city,
  location_state,
  email,
  specialties,
  services,
  years_experience,
  base_price,
  average_rating,
  total_reviews,
  portfolio_images,
  is_verified
) VALUES (
  'Wicked Hens Parties New Zealand',
  'Creating memorable hen party experiences across New Zealand. We specialize in bachelorette parties, bridal celebrations, and fun group activities in Auckland, Taupo, and Wellington.',
  'Auckland',
  'Auckland',
  'info@wickedhens.co.nz',
  ARRAY['hen parties', 'bachelorette parties', 'bridal celebrations', 'girls'' nights'],
  ARRAY['hen party planning', 'activity coordination', 'spa packages', 'entertainment'],
  5,
  750.00,
  4.8,
  132,
  ARRAY['https://eventi.co.nz/wp-content/uploads/2025/07/wicked-hens-parties-nz-eventi-6-1.jpg'],
  true
);

-- Insert Cupid Creative
INSERT INTO public.planners (
  business_name,
  description,
  location_city,
  location_state,
  email,
  specialties,
  services,
  years_experience,
  base_price,
  average_rating,
  total_reviews,
  portfolio_images,
  is_verified
) VALUES (
  'Cupid Creative',
  'Full-service event planning company specializing in weddings, corporate events, birthdays, and celebrations. We offer free consultations, flexible payment plans, and can travel throughout New Zealand.',
  'Auckland',
  'Auckland',
  'hello@cupidcreative.co.nz',
  ARRAY['weddings', 'corporate events', 'birthday parties', 'anniversaries'],
  ARRAY['event planning', 'event coordination', 'styling', 'vendor management'],
  12,
  3200.00,
  4.9,
  89,
  ARRAY['https://eventi.co.nz/wp-content/uploads/2024/12/TomandTomosWedding2024315of896-1024x683.jpg'],
  true
);

-- Insert Insphire
INSERT INTO public.planners (
  business_name,
  description,
  location_city,
  location_state,
  email,
  specialties,
  services,
  years_experience,
  base_price,
  average_rating,
  total_reviews,
  portfolio_images,
  is_verified
) VALUES (
  'Insphire',
  'We are one of New Zealand''s leading WEDDING, PARTY & EVENT HIRE companies, with over 15 years experience in the industry. Insphire is committed to making your next event a success.',
  'Auckland',
  'Auckland',
  'info@insphire.co.nz',
  ARRAY['weddings', 'corporate events', 'private parties', 'celebrations'],
  ARRAY['event planning', 'equipment hire', 'styling', 'coordination'],
  15,
  2800.00,
  4.6,
  76,
  ARRAY['https://eventplanner.co.nz/logos/profile/limage-33084-113-photo.jpg'],
  true
);

-- Insert The Vintage Party (Wellington)
INSERT INTO public.planners (
  business_name,
  description,
  location_city,
  location_state,
  email,
  specialties,
  services,
  years_experience,
  base_price,
  average_rating,
  total_reviews,
  portfolio_images,
  is_verified
) VALUES (
  'The Vintage Party',
  'The Vintage Party has a unique range of vintage & boho props, decor, lighting, furniture & tableware available for hire within the greater Wellington region. Bookings are tailored to meet your requirements, delivery is also available.',
  'Wellington',
  'Wellington',
  'hello@thevintageparty.co.nz',
  ARRAY['vintage events', 'boho styling', 'rustic weddings', 'themed parties'],
  ARRAY['vintage styling', 'event planning', 'prop hire', 'decor coordination'],
  7,
  1650.00,
  4.7,
  42,
  ARRAY['https://eventplanner.co.nz/logos/profile/limage-35169-80-photo.png'],
  true
);

-- Insert Party Essentials Ltd
INSERT INTO public.planners (
  business_name,
  description,
  location_city,
  location_state,
  email,
  specialties,
  services,
  years_experience,
  base_price,
  average_rating,
  total_reviews,
  portfolio_images,
  is_verified
) VALUES (
  'Party Essentials Ltd',
  'A family owned and operated party hire business based in East Tamaki, Auckland. Knowledgeable staff with years of experience in party planning to help ensure you have all the party hire equipment you''ll need for a successful event.',
  'Auckland',
  'Auckland',
  'info@partyessentials.co.nz',
  ARRAY['birthday parties', 'corporate events', 'family celebrations', 'community events'],
  ARRAY['party planning', 'equipment hire', 'event coordination', 'consultation'],
  18,
  1200.00,
  4.5,
  98,
  ARRAY['https://eventplanner.co.nz/logos/profile/limage-33079-406-photo.png'],
  true
);
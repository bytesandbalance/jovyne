-- Add sample helpers to the database
INSERT INTO public.helpers (user_id, skills, bio, experience_years, hourly_rate, availability_cities, portfolio_images, average_rating, total_jobs) VALUES 
(
  (SELECT id FROM auth.users LIMIT 1),
  ARRAY['Event Setup', 'Photography', 'Catering'],
  'Professional event helper with 5 years of experience in party planning and setup. Specializing in photography and catering coordination.',
  5,
  25.00,
  ARRAY['Köln', 'Bonn', 'Düsseldorf'],
  ARRAY['https://images.unsplash.com/photo-1511795409834-ef04bbd61622', 'https://images.unsplash.com/photo-1464207687429-7505649dae38'],
  4.8,
  120
),
(
  (SELECT id FROM auth.users LIMIT 1),
  ARRAY['DJ Services', 'Sound Equipment', 'Music Coordination'],
  'Experienced DJ and sound technician available for private parties and corporate events. Own professional equipment.',
  8,
  45.00,
  ARRAY['Köln', 'Düsseldorf'],
  ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', 'https://images.unsplash.com/photo-1571266028243-d220c1e84cd8'],
  4.9,
  200
),
(
  (SELECT id FROM auth.users LIMIT 1),
  ARRAY['Decoration', 'Floral Arrangements', 'Venue Setup'],
  'Creative decorator specializing in floral arrangements and venue transformation. Perfect for weddings and celebrations.',
  3,
  30.00,
  ARRAY['Bonn', 'Köln'],
  ARRAY['https://images.unsplash.com/photo-1478146896981-b80fe463b330', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed'],
  4.7,
  85
),
(
  (SELECT id FROM auth.users LIMIT 1),
  ARRAY['Bartending', 'Cocktail Service', 'Event Service'],
  'Professional bartender with cocktail expertise. Available for private parties, weddings, and corporate events.',
  6,
  35.00,
  ARRAY['Düsseldorf', 'Köln'],
  ARRAY['https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b', 'https://images.unsplash.com/photo-1551024506-0bccd828d307'],
  4.6,
  150
);

-- Create a planner first to link helper requests to
INSERT INTO public.planners (user_id, business_name, description, services, specialties, location_city, base_price, years_experience, is_verified) VALUES 
(
  (SELECT id FROM auth.users LIMIT 1),
  'Rhine Valley Events',
  'Premium event planning service covering the Rhine valley region. Specializing in weddings, corporate events, and private celebrations.',
  ARRAY['Wedding Planning', 'Corporate Events', 'Private Parties', 'Birthday Celebrations'],
  ARRAY['Luxury Weddings', 'Corporate Functions', 'Cultural Events'],
  'Köln',
  2500.00,
  7,
  true
);

-- Add sample helper requests
INSERT INTO public.helper_requests (planner_id, title, description, required_skills, event_date, start_time, end_time, total_hours, hourly_rate, location_city, status) VALUES 
(
  (SELECT id FROM planners WHERE user_id = (SELECT id FROM auth.users LIMIT 1) LIMIT 1),
  'Wedding Photography Assistant Needed',
  'Looking for an experienced photography assistant for a large wedding in Köln. Must have experience with event photography and own basic equipment.',
  ARRAY['Photography', 'Event Setup'],
  '2025-02-15',
  '10:00',
  '22:00',
  12,
  25.00,
  'Köln',
  'open'
),
(
  (SELECT id FROM planners WHERE user_id = (SELECT id FROM auth.users LIMIT 1) LIMIT 1),
  'DJ for Corporate Event',
  'Seeking professional DJ for corporate annual party in Düsseldorf. Must have own professional sound equipment and experience with corporate events.',
  ARRAY['DJ Services', 'Sound Equipment', 'Music Coordination'],
  '2025-02-28',
  '18:00',
  '24:00',
  6,
  45.00,
  'Düsseldorf',
  'open'
),
(
  (SELECT id FROM planners WHERE user_id = (SELECT id FROM auth.users LIMIT 1) LIMIT 1),
  'Birthday Party Decoration Setup',
  'Need creative decorator for childrens birthday party in Bonn. Theme is fairy tale princess. Must include setup and takedown.',
  ARRAY['Decoration', 'Event Setup'],
  '2025-03-08',
  '08:00',
  '18:00',
  10,
  28.00,
  'Bonn',
  'open'
),
(
  (SELECT id FROM planners WHERE user_id = (SELECT id FROM auth.users LIMIT 1) LIMIT 1),
  'Cocktail Bartender for Private Party',
  'Looking for experienced bartender for upscale private party in Köln. Must be skilled in classic and modern cocktails.',
  ARRAY['Bartending', 'Cocktail Service'],
  '2025-03-20',
  '19:00',
  '02:00',
  7,
  35.00,
  'Köln',
  'open'
),
(
  (SELECT id FROM planners WHERE user_id = (SELECT id FROM auth.users LIMIT 1) LIMIT 1),
  'Wedding Venue Setup Team',
  'Need multiple helpers for large wedding venue setup in Düsseldorf. Looking for experienced team members for decoration and coordination.',
  ARRAY['Decoration', 'Venue Setup', 'Event Setup'],
  '2025-04-12',
  '06:00',
  '16:00',
  10,
  22.00,
  'Düsseldorf',
  'open'
);
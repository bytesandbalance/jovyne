-- Seed data for helpers and helper requests

-- First, let's add some helper profiles
INSERT INTO public.helpers (
  id, user_id, bio, experience_years, hourly_rate, average_rating, total_jobs, 
  skills, availability_cities, portfolio_images
) VALUES 
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Experienced event setup specialist with expertise in audio/visual equipment and venue decoration. I have worked on over 200 events including weddings, corporate gatherings, and festivals.',
  5,
  25.00,
  4.8,
  87,
  ARRAY['Audio/Visual Setup', 'Venue Decoration', 'Equipment Transport', 'Event Coordination'],
  ARRAY['San Francisco', 'Oakland', 'San Jose', 'Berkeley'],
  ARRAY['https://example.com/portfolio1.jpg', 'https://example.com/portfolio2.jpg']
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Professional catering assistant and server with 3 years of experience in high-end events. Skilled in food service, bar setup, and guest relations.',
  3,
  22.00,
  4.9,
  62,
  ARRAY['Food Service', 'Bar Setup', 'Guest Relations', 'Kitchen Assistance'],
  ARRAY['San Francisco', 'Marin County', 'Napa Valley'],
  ARRAY['https://example.com/catering1.jpg']
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Creative floral designer and decorator with a passion for creating stunning visual displays. Experienced in wedding and corporate event design.',
  4,
  30.00,
  4.7,
  45,
  ARRAY['Floral Design', 'Event Decoration', 'Creative Design', 'Setup/Breakdown'],
  ARRAY['San Francisco', 'Peninsula', 'East Bay'],
  ARRAY['https://example.com/floral1.jpg', 'https://example.com/floral2.jpg', 'https://example.com/floral3.jpg']
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Event coordination specialist with strong organizational skills. Expert in managing timelines, vendor coordination, and day-of event execution.',
  6,
  35.00,
  4.9,
  120,
  ARRAY['Event Coordination', 'Vendor Management', 'Timeline Management', 'Problem Solving'],
  ARRAY['San Francisco', 'Oakland', 'San Jose', 'Santa Cruz'],
  ARRAY[]
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Photography and videography assistant with technical expertise in lighting and equipment setup. Available for various event types.',
  2,
  20.00,
  4.6,
  28,
  ARRAY['Photography Assistance', 'Lighting Setup', 'Equipment Management', 'Video Support'],
  ARRAY['San Francisco', 'Berkeley', 'Fremont'],
  ARRAY['https://example.com/photo1.jpg']
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Experienced event security and crowd management professional. Skilled in ensuring guest safety and managing large gatherings.',
  8,
  28.00,
  4.8,
  95,
  ARRAY['Crowd Management', 'Event Security', 'Guest Check-in', 'Emergency Response'],
  ARRAY['San Francisco', 'Oakland', 'San Jose', 'Concord'],
  ARRAY[]
);

-- Now let's add some helper requests posted by the existing planner
INSERT INTO public.helper_requests (
  id, planner_id, title, description, event_date, location_city, 
  required_skills, hourly_rate, total_hours, start_time, end_time, status
) VALUES 
(
  gen_random_uuid(),
  '76ead27a-91b0-4a41-9de0-90e6d5d9ca49', -- existing planner ID
  'Wedding Setup Assistant Needed',
  'Looking for an experienced helper to assist with wedding setup at Golden Gate Park Pavilion. Tasks include table arrangement, decoration setup, and audio/visual equipment preparation.',
  '2024-06-14', -- day before Smith-Johnson Wedding
  'San Francisco',
  ARRAY['Venue Decoration', 'Audio/Visual Setup', 'Event Coordination'],
  25.00,
  6,
  '10:00:00',
  '16:00:00',
  'open'
),
(
  gen_random_uuid(),
  '76ead27a-91b0-4a41-9de0-90e6d5d9ca49',
  'Catering Support for Corporate Event',
  'Seeking professional catering assistant for TechCorp Holiday Party. Must have experience with large corporate events and food service.',
  '2024-12-20',
  'San Francisco',
  ARRAY['Food Service', 'Bar Setup', 'Guest Relations'],
  22.00,
  8,
  '16:00:00',
  '24:00:00',
  'open'
),
(
  gen_random_uuid(),
  '76ead27a-91b0-4a41-9de0-90e6d5d9ca49',
  'Beach Wedding Coordination Help',
  'Need coordination assistant for beachside wedding ceremony. Must be comfortable working outdoors and handling permits/logistics.',
  '2024-08-09', -- day before Brown Beach Wedding
  'Malibu',
  ARRAY['Event Coordination', 'Outdoor Events', 'Vendor Management'],
  30.00,
  10,
  '08:00:00',
  '18:00:00',
  'open'
),
(
  gen_random_uuid(),
  '76ead27a-91b0-4a41-9de0-90e6d5d9ca49',
  'Product Launch Event Assistant',
  'High-profile tech product launch requires professional event assistant. Experience with media coordination and VIP guest management preferred.',
  '2024-05-22',
  'New York',
  ARRAY['Event Coordination', 'Guest Relations', 'Media Coordination'],
  35.00,
  12,
  '06:00:00',
  '18:00:00',
  'open'
),
(
  gen_random_uuid(),
  '76ead27a-91b0-4a41-9de0-90e6d5d9ca49',
  'Birthday Party Setup & Breakdown',
  'Looking for reliable helper for 50th birthday party setup and breakdown. Private residence event with moderate guest count.',
  '2024-04-17', -- day before David Wilson 50th Birthday (already completed)
  'San Francisco',
  ARRAY['Setup/Breakdown', 'Event Coordination', 'Venue Decoration'],
  20.00,
  8,
  '14:00:00',
  '22:00:00',
  'completed'
);

-- Add some helper applications to make it more realistic
INSERT INTO public.helper_applications (
  id, helper_request_id, helper_id, message, hourly_rate, status, applied_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM public.helper_requests WHERE title = 'Wedding Setup Assistant Needed'),
  (SELECT id FROM public.helpers WHERE bio LIKE '%event setup specialist%'),
  'I have extensive experience with wedding setups and am very familiar with Golden Gate Park Pavilion. I can bring my own decoration tools and have worked on similar scale events.',
  25.00,
  'pending',
  now() - interval '2 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.helper_requests WHERE title = 'Catering Support for Corporate Event'),
  (SELECT id FROM public.helpers WHERE bio LIKE '%catering assistant%'),
  'I specialize in corporate event catering and have worked several tech company events. I am comfortable with formal service standards and dietary restrictions.',
  22.00,
  'approved',
  now() - interval '3 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.helper_requests WHERE title = 'Beach Wedding Coordination Help'),
  (SELECT id FROM public.helpers WHERE bio LIKE '%Event coordination specialist%'),
  'I have coordinated multiple beachside events and am experienced with outdoor logistics and permit requirements. Very comfortable with the Malibu area.',
  32.00,
  'pending',
  now() - interval '1 day'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.helper_requests WHERE title = 'Product Launch Event Assistant'),
  (SELECT id FROM public.helpers WHERE bio LIKE '%Event coordination specialist%'),
  'I have worked on several high-profile tech events and understand the unique requirements of product launches. Excellent with VIP guest management.',
  35.00,
  'pending',
  now() - interval '4 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM public.helper_requests WHERE title = 'Birthday Party Setup & Breakdown'),
  (SELECT id FROM public.helpers WHERE bio LIKE '%Creative floral designer%'),
  'I completed this job successfully and the client was very satisfied with the decoration and setup quality.',
  20.00,
  'approved',
  now() - interval '10 days'
);
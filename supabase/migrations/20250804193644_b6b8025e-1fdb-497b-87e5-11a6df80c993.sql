-- Remove the foreign key constraint temporarily to allow adding sample data
ALTER TABLE planners DROP CONSTRAINT IF EXISTS planners_user_id_fkey;

-- Add more planners with fake user_ids for display purposes only
INSERT INTO planners (
  user_id,
  business_name,
  description,
  location_city,
  location_state,
  average_rating,
  base_price,
  years_experience,
  specialties,
  services,
  is_verified,
  total_reviews
) VALUES 
('11111111-1111-1111-1111-111111111111', 'Dresden Dream Events', 'Sophisticated celebrations in the heart of Saxony', 'Dresden', 'Germany', 4.7, 2800, 8, ARRAY['Elegant Weddings', 'Corporate Events', 'Anniversary Celebrations'], ARRAY['Full Event Planning', 'Venue Coordination', 'Catering Management'], true, 156),

('22222222-2222-2222-2222-222222222222', 'Stuttgart Style Co.', 'Modern event planning with a focus on innovation', 'Stuttgart', 'Germany', 4.9, 3200, 12, ARRAY['Tech Events', 'Product Launches', 'Modern Weddings'], ARRAY['Event Design', 'Technology Integration', 'Brand Events'], true, 203),

('33333333-3333-3333-3333-333333333333', 'Düsseldorf Celebrations', 'Luxury events in the fashion capital', 'Düsseldorf', 'Germany', 4.6, 3500, 10, ARRAY['Fashion Events', 'Luxury Weddings', 'Art Gallery Events'], ARRAY['High-End Planning', 'Celebrity Events', 'Fashion Shows'], true, 89),

('44444444-4444-4444-4444-444444444444', 'Nuremberg Nights', 'Traditional and modern event fusion', 'Nuremberg', 'Germany', 4.5, 2200, 6, ARRAY['Traditional German Events', 'Corporate Meetings', 'Cultural Celebrations'], ARRAY['Traditional Planning', 'Cultural Events', 'Business Functions'], true, 134),

('55555555-5555-5555-5555-555555555555', 'Bremen Bay Events', 'Coastal celebration specialists', 'Bremen', 'Germany', 4.8, 2600, 9, ARRAY['Waterfront Weddings', 'Maritime Events', 'Festival Planning'], ARRAY['Outdoor Events', 'Festival Management', 'Venue Booking'], true, 178),

('66666666-6666-6666-6666-666666666666', 'Leipzig Live Events', 'Music city event specialists', 'Leipzig', 'Germany', 4.4, 2400, 7, ARRAY['Music Events', 'Concert Planning', 'Festival Coordination'], ARRAY['Live Event Production', 'Sound Management', 'Artist Coordination'], false, 92),

('77777777-7777-7777-7777-777777777777', 'Hanover Highlights', 'Business and pleasure event experts', 'Hanover', 'Germany', 4.6, 2700, 11, ARRAY['Trade Shows', 'Business Events', 'Social Gatherings'], ARRAY['Exhibition Planning', 'Corporate Events', 'Networking Events'], true, 167),

('88888888-8888-8888-8888-888888888888', 'Essen Elegance', 'Industrial charm meets elegant celebrations', 'Essen', 'Germany', 4.3, 2100, 5, ARRAY['Industrial Venue Events', 'Birthday Parties', 'Casual Celebrations'], ARRAY['Venue Transformation', 'Casual Planning', 'Theme Events'], false, 73),

('99999999-9999-9999-9999-999999999999', 'Wiesbaden Weddings', 'Spa city serenity for special occasions', 'Wiesbaden', 'Germany', 4.7, 3100, 14, ARRAY['Spa Weddings', 'Wellness Events', 'Luxury Retreats'], ARRAY['Wellness Event Planning', 'Luxury Coordination', 'Retreat Organization'], true, 198),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Karlsruhe Kreativ', 'Creative and tech-forward event planning', 'Karlsruhe', 'Germany', 4.5, 2500, 8, ARRAY['Tech Conferences', 'Innovation Events', 'Creative Workshops'], ARRAY['Conference Planning', 'Workshop Coordination', 'Innovation Events'], true, 112);

-- Also add corresponding profiles for these planners so they display properly
INSERT INTO profiles (
  user_id,
  full_name,
  email,
  user_role
) VALUES 
('11111111-1111-1111-1111-111111111111', 'Maria Schmidt', 'maria@dresden-dreams.de', 'planner'),
('22222222-2222-2222-2222-222222222222', 'Thomas Müller', 'thomas@stuttgart-style.de', 'planner'),
('33333333-3333-3333-3333-333333333333', 'Anna Wagner', 'anna@duesseldorf-celebrations.de', 'planner'),
('44444444-4444-4444-4444-444444444444', 'Klaus Weber', 'klaus@nuremberg-nights.de', 'planner'),
('55555555-5555-5555-5555-555555555555', 'Petra Fischer', 'petra@bremen-bay.de', 'planner'),
('66666666-6666-6666-6666-666666666666', 'Stefan Koch', 'stefan@leipzig-live.de', 'planner'),
('77777777-7777-7777-7777-777777777777', 'Sabine Wolf', 'sabine@hanover-highlights.de', 'planner'),
('88888888-8888-8888-8888-888888888888', 'Michael Bauer', 'michael@essen-elegance.de', 'planner'),
('99999999-9999-9999-9999-999999999999', 'Julia Richter', 'julia@wiesbaden-weddings.de', 'planner'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Andreas Klein', 'andreas@karlsruhe-kreativ.de', 'planner');
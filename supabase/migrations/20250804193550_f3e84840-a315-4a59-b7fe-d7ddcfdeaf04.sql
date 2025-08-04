-- Create profiles first (these will act as our planner users)
INSERT INTO profiles (
  user_id,
  full_name,
  email,
  user_role
) VALUES 
(gen_random_uuid(), 'Maria Schmidt', 'maria@dresden-dreams.de', 'planner'),
(gen_random_uuid(), 'Thomas Müller', 'thomas@stuttgart-style.de', 'planner'),
(gen_random_uuid(), 'Anna Wagner', 'anna@duesseldorf-celebrations.de', 'planner'),
(gen_random_uuid(), 'Klaus Weber', 'klaus@nuremberg-nights.de', 'planner'),
(gen_random_uuid(), 'Petra Fischer', 'petra@bremen-bay.de', 'planner'),
(gen_random_uuid(), 'Stefan Koch', 'stefan@leipzig-live.de', 'planner'),
(gen_random_uuid(), 'Sabine Wolf', 'sabine@hanover-highlights.de', 'planner'),
(gen_random_uuid(), 'Michael Bauer', 'michael@essen-elegance.de', 'planner'),
(gen_random_uuid(), 'Julia Richter', 'julia@wiesbaden-weddings.de', 'planner'),
(gen_random_uuid(), 'Andreas Klein', 'andreas@karlsruhe-kreativ.de', 'planner');

-- Now add planners using the user_ids from profiles we just created
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
) 
SELECT 
  p.user_id,
  CASE 
    WHEN p.email LIKE '%dresden%' THEN 'Dresden Dream Events'
    WHEN p.email LIKE '%stuttgart%' THEN 'Stuttgart Style Co.'
    WHEN p.email LIKE '%duesseldorf%' THEN 'Düsseldorf Celebrations'
    WHEN p.email LIKE '%nuremberg%' THEN 'Nuremberg Nights'
    WHEN p.email LIKE '%bremen%' THEN 'Bremen Bay Events'
    WHEN p.email LIKE '%leipzig%' THEN 'Leipzig Live Events'
    WHEN p.email LIKE '%hanover%' THEN 'Hanover Highlights'
    WHEN p.email LIKE '%essen%' THEN 'Essen Elegance'
    WHEN p.email LIKE '%wiesbaden%' THEN 'Wiesbaden Weddings'
    WHEN p.email LIKE '%karlsruhe%' THEN 'Karlsruhe Kreativ'
  END as business_name,
  CASE 
    WHEN p.email LIKE '%dresden%' THEN 'Sophisticated celebrations in the heart of Saxony'
    WHEN p.email LIKE '%stuttgart%' THEN 'Modern event planning with a focus on innovation'
    WHEN p.email LIKE '%duesseldorf%' THEN 'Luxury events in the fashion capital'
    WHEN p.email LIKE '%nuremberg%' THEN 'Traditional and modern event fusion'
    WHEN p.email LIKE '%bremen%' THEN 'Coastal celebration specialists'
    WHEN p.email LIKE '%leipzig%' THEN 'Music city event specialists'
    WHEN p.email LIKE '%hanover%' THEN 'Business and pleasure event experts'
    WHEN p.email LIKE '%essen%' THEN 'Industrial charm meets elegant celebrations'
    WHEN p.email LIKE '%wiesbaden%' THEN 'Spa city serenity for special occasions'
    WHEN p.email LIKE '%karlsruhe%' THEN 'Creative and tech-forward event planning'
  END as description,
  CASE 
    WHEN p.email LIKE '%dresden%' THEN 'Dresden'
    WHEN p.email LIKE '%stuttgart%' THEN 'Stuttgart'
    WHEN p.email LIKE '%duesseldorf%' THEN 'Düsseldorf'
    WHEN p.email LIKE '%nuremberg%' THEN 'Nuremberg'
    WHEN p.email LIKE '%bremen%' THEN 'Bremen'
    WHEN p.email LIKE '%leipzig%' THEN 'Leipzig'
    WHEN p.email LIKE '%hanover%' THEN 'Hanover'
    WHEN p.email LIKE '%essen%' THEN 'Essen'
    WHEN p.email LIKE '%wiesbaden%' THEN 'Wiesbaden'
    WHEN p.email LIKE '%karlsruhe%' THEN 'Karlsruhe'
  END as location_city,
  'Germany' as location_state,
  CASE 
    WHEN p.email LIKE '%stuttgart%' THEN 4.9
    WHEN p.email LIKE '%bremen%' THEN 4.8
    WHEN p.email LIKE '%dresden%' OR p.email LIKE '%wiesbaden%' THEN 4.7
    WHEN p.email LIKE '%duesseldorf%' OR p.email LIKE '%hanover%' THEN 4.6
    WHEN p.email LIKE '%nuremberg%' OR p.email LIKE '%karlsruhe%' THEN 4.5
    WHEN p.email LIKE '%leipzig%' THEN 4.4
    WHEN p.email LIKE '%essen%' THEN 4.3
  END as average_rating,
  CASE 
    WHEN p.email LIKE '%duesseldorf%' THEN 3500
    WHEN p.email LIKE '%stuttgart%' THEN 3200
    WHEN p.email LIKE '%wiesbaden%' THEN 3100
    WHEN p.email LIKE '%dresden%' THEN 2800
    WHEN p.email LIKE '%hanover%' THEN 2700
    WHEN p.email LIKE '%bremen%' THEN 2600
    WHEN p.email LIKE '%karlsruhe%' THEN 2500
    WHEN p.email LIKE '%leipzig%' THEN 2400
    WHEN p.email LIKE '%nuremberg%' THEN 2200
    WHEN p.email LIKE '%essen%' THEN 2100
  END as base_price,
  CASE 
    WHEN p.email LIKE '%wiesbaden%' THEN 14
    WHEN p.email LIKE '%stuttgart%' THEN 12
    WHEN p.email LIKE '%hanover%' THEN 11
    WHEN p.email LIKE '%duesseldorf%' THEN 10
    WHEN p.email LIKE '%bremen%' THEN 9
    WHEN p.email LIKE '%dresden%' OR p.email LIKE '%karlsruhe%' THEN 8
    WHEN p.email LIKE '%leipzig%' THEN 7
    WHEN p.email LIKE '%nuremberg%' THEN 6
    WHEN p.email LIKE '%essen%' THEN 5
  END as years_experience,
  CASE 
    WHEN p.email LIKE '%dresden%' THEN ARRAY['Elegant Weddings', 'Corporate Events', 'Anniversary Celebrations']
    WHEN p.email LIKE '%stuttgart%' THEN ARRAY['Tech Events', 'Product Launches', 'Modern Weddings']
    WHEN p.email LIKE '%duesseldorf%' THEN ARRAY['Fashion Events', 'Luxury Weddings', 'Art Gallery Events']
    WHEN p.email LIKE '%nuremberg%' THEN ARRAY['Traditional German Events', 'Corporate Meetings', 'Cultural Celebrations']
    WHEN p.email LIKE '%bremen%' THEN ARRAY['Waterfront Weddings', 'Maritime Events', 'Festival Planning']
    WHEN p.email LIKE '%leipzig%' THEN ARRAY['Music Events', 'Concert Planning', 'Festival Coordination']
    WHEN p.email LIKE '%hanover%' THEN ARRAY['Trade Shows', 'Business Events', 'Social Gatherings']
    WHEN p.email LIKE '%essen%' THEN ARRAY['Industrial Venue Events', 'Birthday Parties', 'Casual Celebrations']
    WHEN p.email LIKE '%wiesbaden%' THEN ARRAY['Spa Weddings', 'Wellness Events', 'Luxury Retreats']
    WHEN p.email LIKE '%karlsruhe%' THEN ARRAY['Tech Conferences', 'Innovation Events', 'Creative Workshops']
  END as specialties,
  CASE 
    WHEN p.email LIKE '%dresden%' THEN ARRAY['Full Event Planning', 'Venue Coordination', 'Catering Management']
    WHEN p.email LIKE '%stuttgart%' THEN ARRAY['Event Design', 'Technology Integration', 'Brand Events']
    WHEN p.email LIKE '%duesseldorf%' THEN ARRAY['High-End Planning', 'Celebrity Events', 'Fashion Shows']
    WHEN p.email LIKE '%nuremberg%' THEN ARRAY['Traditional Planning', 'Cultural Events', 'Business Functions']
    WHEN p.email LIKE '%bremen%' THEN ARRAY['Outdoor Events', 'Festival Management', 'Venue Booking']
    WHEN p.email LIKE '%leipzig%' THEN ARRAY['Live Event Production', 'Sound Management', 'Artist Coordination']
    WHEN p.email LIKE '%hanover%' THEN ARRAY['Exhibition Planning', 'Corporate Events', 'Networking Events']
    WHEN p.email LIKE '%essen%' THEN ARRAY['Venue Transformation', 'Casual Planning', 'Theme Events']
    WHEN p.email LIKE '%wiesbaden%' THEN ARRAY['Wellness Event Planning', 'Luxury Coordination', 'Retreat Organization']
    WHEN p.email LIKE '%karlsruhe%' THEN ARRAY['Conference Planning', 'Workshop Coordination', 'Innovation Events']
  END as services,
  CASE 
    WHEN p.email LIKE '%leipzig%' OR p.email LIKE '%essen%' THEN false
    ELSE true
  END as is_verified,
  CASE 
    WHEN p.email LIKE '%stuttgart%' THEN 203
    WHEN p.email LIKE '%wiesbaden%' THEN 198
    WHEN p.email LIKE '%bremen%' THEN 178
    WHEN p.email LIKE '%hanover%' THEN 167
    WHEN p.email LIKE '%dresden%' THEN 156
    WHEN p.email LIKE '%nuremberg%' THEN 134
    WHEN p.email LIKE '%karlsruhe%' THEN 112
    WHEN p.email LIKE '%leipzig%' THEN 92
    WHEN p.email LIKE '%duesseldorf%' THEN 89
    WHEN p.email LIKE '%essen%' THEN 73
  END as total_reviews
FROM profiles p 
WHERE p.user_role = 'planner' 
AND p.email LIKE '%.de';
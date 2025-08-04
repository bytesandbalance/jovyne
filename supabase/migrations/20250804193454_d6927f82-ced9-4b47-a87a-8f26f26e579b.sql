-- Add more planners with German locations only
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
-- Generate some random UUIDs for user_id (these won't link to real users but will work for display)
(gen_random_uuid(), 'Dresden Dream Events', 'Sophisticated celebrations in the heart of Saxony', 'Dresden', 'Germany', 4.7, 2800, 8, ARRAY['Elegant Weddings', 'Corporate Events', 'Anniversary Celebrations'], ARRAY['Full Event Planning', 'Venue Coordination', 'Catering Management'], true, 156),

(gen_random_uuid(), 'Stuttgart Style Co.', 'Modern event planning with a focus on innovation', 'Stuttgart', 'Germany', 4.9, 3200, 12, ARRAY['Tech Events', 'Product Launches', 'Modern Weddings'], ARRAY['Event Design', 'Technology Integration', 'Brand Events'], true, 203),

(gen_random_uuid(), 'Düsseldorf Celebrations', 'Luxury events in the fashion capital', 'Düsseldorf', 'Germany', 4.6, 3500, 10, ARRAY['Fashion Events', 'Luxury Weddings', 'Art Gallery Events'], ARRAY['High-End Planning', 'Celebrity Events', 'Fashion Shows'], true, 89),

(gen_random_uuid(), 'Nuremberg Nights', 'Traditional and modern event fusion', 'Nuremberg', 'Germany', 4.5, 2200, 6, ARRAY['Traditional German Events', 'Corporate Meetings', 'Cultural Celebrations'], ARRAY['Traditional Planning', 'Cultural Events', 'Business Functions'], true, 134),

(gen_random_uuid(), 'Bremen Bay Events', 'Coastal celebration specialists', 'Bremen', 'Germany', 4.8, 2600, 9, ARRAY['Waterfront Weddings', 'Maritime Events', 'Festival Planning'], ARRAY['Outdoor Events', 'Festival Management', 'Venue Booking'], true, 178),

(gen_random_uuid(), 'Leipzig Live Events', 'Music city event specialists', 'Leipzig', 'Germany', 4.4, 2400, 7, ARRAY['Music Events', 'Concert Planning', 'Festival Coordination'], ARRAY['Live Event Production', 'Sound Management', 'Artist Coordination'], false, 92),

(gen_random_uuid(), 'Hanover Highlights', 'Business and pleasure event experts', 'Hanover', 'Germany', 4.6, 2700, 11, ARRAY['Trade Shows', 'Business Events', 'Social Gatherings'], ARRAY['Exhibition Planning', 'Corporate Events', 'Networking Events'], true, 167),

(gen_random_uuid(), 'Essen Elegance', 'Industrial charm meets elegant celebrations', 'Essen', 'Germany', 4.3, 2100, 5, ARRAY['Industrial Venue Events', 'Birthday Parties', 'Casual Celebrations'], ARRAY['Venue Transformation', 'Casual Planning', 'Theme Events'], false, 73),

(gen_random_uuid(), 'Wiesbaden Weddings', 'Spa city serenity for special occasions', 'Wiesbaden', 'Germany', 4.7, 3100, 14, ARRAY['Spa Weddings', 'Wellness Events', 'Luxury Retreats'], ARRAY['Wellness Event Planning', 'Luxury Coordination', 'Retreat Organization'], true, 198),

(gen_random_uuid(), 'Karlsruhe Kreativ', 'Creative and tech-forward event planning', 'Karlsruhe', 'Germany', 4.5, 2500, 8, ARRAY['Tech Conferences', 'Innovation Events', 'Creative Workshops'], ARRAY['Conference Planning', 'Workshop Coordination', 'Innovation Events'], true, 112);
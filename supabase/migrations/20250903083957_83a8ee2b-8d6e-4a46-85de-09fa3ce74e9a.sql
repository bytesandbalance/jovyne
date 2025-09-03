-- Create profiles for real party planning businesses

-- Insert profiles
INSERT INTO profiles (user_id, email, full_name, user_role)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'info@limelight-weddings.de', 'Limelight Weddings Team', 'planner'),
  ('a2222222-2222-2222-2222-222222222222', 'nadine@fineweddings.de', 'Nadine Metgenberg', 'planner'),
  ('a3333333-3333-3333-3333-333333333333', 'rasha@karoma-weddings.de', 'Rasha Abdullah', 'planner'),
  ('a4444444-4444-4444-4444-444444444444', 'info@fiesta-service.de', 'FIESTA SERVICE Team', 'planner'),
  ('a5555555-5555-5555-5555-555555555555', 'contact@adebar.de', 'Adebar Event Team', 'planner'),
  ('b1111111-1111-1111-1111-111111111111', 'info@b-ceed.de', 'B-ceed Events Team', 'planner'),
  ('b2222222-2222-2222-2222-222222222222', 'hello@eventiger.team', 'Eventiger Team', 'planner'),
  ('b3333333-3333-3333-3333-333333333333', 'info@kreativkonzept.de', 'Kreativ Konzept Team', 'planner'),
  ('b4444444-4444-4444-4444-444444444444', 'info@kimsam.de', 'Kim Sam', 'planner'),
  ('b5555555-5555-5555-5555-555555555555', 'info@2getherevent.de', '2gether Event Team', 'planner'),
  ('c1111111-1111-1111-1111-111111111111', 'hello@ellenkamrad.de', 'Ellen Kamrad', 'planner'),
  ('c2222222-2222-2222-2222-222222222222', 'info@soundshine-entertainment.de', 'Soundshine Team', 'planner'),
  ('c3333333-3333-3333-3333-333333333333', 'info@diefeiermacher.de', 'Die Feiermacher Team', 'planner'),
  ('c4444444-4444-4444-4444-444444444444', 'info@beunique-event.de', 'Be Unique Team', 'planner'),
  ('c5555555-5555-5555-5555-555555555555', 'info@metz-event.de', 'Metz Event Team', 'planner');

-- Insert planner business profiles
INSERT INTO planners (user_id, business_name, description, location_city, location_state, services, specialties, years_experience, average_rating, total_reviews, is_verified)
VALUES 
  -- Düsseldorf planners
  ('a1111111-1111-1111-1111-111111111111', 'Limelight Weddings', 'Modern wedding planning service specializing in elegant celebrations. We handle everything from venue selection to vendor coordination for your perfect day.', 'Düsseldorf', 'Nordrhein-Westfalen', 
   '{"Wedding Planning", "Event Coordination", "Vendor Management", "Decoration Services"}', 
   '{"Weddings", "Corporate Events", "Private Parties"}', 8, 4.8, 127, true),
   
  ('a2222222-2222-2222-2222-222222222222', 'Fine Weddings & Parties', 'International wedding planning with multilingual service. Specializing in luxury weddings and high-end corporate events across Germany and internationally.', 'Düsseldorf', 'Nordrhein-Westfalen',
   '{"Wedding Planning", "Corporate Events", "International Events", "Luxury Parties"}',
   '{"Luxury Weddings", "International Events", "Corporate Functions"}', 12, 4.9, 89, true),
   
  ('a3333333-3333-3333-3333-333333333333', 'Karoma Weddings', 'Exclusive wedding planning service by Rasha Abdullah, specializing in both German and Arabic wedding traditions. Creating unique celebrations with passion and attention to detail.', 'Düsseldorf', 'Nordrhein-Westfalen',
   '{"Wedding Planning", "Cultural Weddings", "Event Styling", "Coordination"}',
   '{"Multicultural Weddings", "Luxury Events", "Traditional Ceremonies"}', 6, 4.7, 64, true),
   
  ('a4444444-4444-4444-4444-444444444444', 'FIESTA SERVICE', 'Comprehensive event service provider with over 750 trained staff members. Specializing in catering, party service, and complete event management for all occasions.', 'Düsseldorf', 'Nordrhein-Westfalen',
   '{"Catering", "Event Management", "Party Service", "Staff Provision"}',
   '{"Corporate Events", "Weddings", "Birthday Parties", "Large Events"}', 15, 4.6, 203, true),
   
  ('a5555555-5555-5555-5555-555555555555', 'Adebar Event Agency', 'Professional event agency providing comprehensive event planning and destination management services. Expert in corporate events and team building activities.', 'Düsseldorf', 'Nordrhein-Westfalen',
   '{"Event Planning", "Destination Management", "Corporate Events", "Team Building"}',
   '{"Corporate Functions", "Conferences", "Incentive Travel"}', 20, 4.5, 156, true),

  -- Bonn planners  
  ('b1111111-1111-1111-1111-111111111111', 'B-ceed Events', 'Professional event planning company specializing in strong corporate events. We create unusual company events, glittering parties and effective team building solutions.', 'Bonn', 'Nordrhein-Westfalen',
   '{"Corporate Events", "Team Building", "Company Parties", "Conference Planning"}',
   '{"Corporate Functions", "Business Events", "Team Activities"}', 10, 4.7, 98, true),
   
  ('b2222222-2222-2222-2222-222222222222', 'Eventiger', 'Passionate event service provider creating unforgettable moments. We specialize in both private celebrations and business events with a focus on cohesive concepts.', 'Bonn', 'Nordrhein-Westfalen',
   '{"Event Planning", "Private Parties", "Business Events", "Concept Development"}',
   '{"Birthday Parties", "Corporate Events", "Private Celebrations"}', 7, 4.6, 72, true),
   
  ('b3333333-3333-3333-3333-333333333333', 'Kreativ Konzept Event', 'Creative event planning service focusing on innovative concepts and unique execution. Specializing in both corporate and private events.', 'Bonn', 'Nordrhein-Westfalen',
   '{"Creative Event Planning", "Concept Development", "Corporate Events", "Private Parties"}',
   '{"Creative Concepts", "Corporate Functions", "Birthday Celebrations"}', 9, 4.5, 54, true),
   
  ('b4444444-4444-4444-4444-444444444444', 'Kim Sam - Perfect Weddings', 'Specialized wedding planning service creating perfect wedding celebrations. Focus on personalized service and attention to every detail for your special day.', 'Bonn', 'Nordrhein-Westfalen',
   '{"Wedding Planning", "Event Coordination", "Wedding Styling", "Vendor Management"}',
   '{"Weddings", "Engagement Parties", "Anniversary Celebrations"}', 11, 4.8, 91, true),
   
  ('b5555555-5555-5555-5555-555555555555', '2gether Event', 'International event management with expertise in handling international guests. Professional and sensitive approach to multicultural events and business functions.', 'Bonn', 'Nordrhein-Westfalen',
   '{"International Events", "Business Consulting", "Corporate Functions", "Multicultural Events"}',
   '{"International Business Events", "Corporate Functions", "Cultural Events"}', 13, 4.6, 76, true),

  -- Cologne planners
  ('c1111111-1111-1111-1111-111111111111', 'Ellen Kamrad Events', 'Event agency creating events that connect people through emotions and unique experiences. Specializing in corporate events and private celebrations in Cologne and Mallorca.', 'Köln', 'Nordrhein-Westfalen',
   '{"Corporate Events", "Private Parties", "Event Styling", "Destination Events"}',
   '{"Corporate Functions", "Birthday Parties", "Destination Events"}', 14, 4.7, 134, true),
   
  ('c2222222-2222-2222-2222-222222222222', 'Soundshine Entertainment', 'Professional entertainment and event agency providing comprehensive event solutions. Specializing in music events, corporate functions, and private celebrations.', 'Köln', 'Nordrhein-Westfalen',
   '{"Entertainment Events", "Music Events", "Corporate Functions", "Party Planning"}',
   '{"Music Events", "Corporate Parties", "Birthday Celebrations"}', 8, 4.6, 87, true),
   
  ('c3333333-3333-3333-3333-333333333333', 'Die Feiermacher', 'Event specialists with the motto "Nothing is impossible!" Comprehensive event planning for all types of celebrations from weddings to festivals.', 'Köln', 'Nordrhein-Westfalen',
   '{"Event Planning", "Wedding Planning", "Festival Organization", "Corporate Events"}',
   '{"Weddings", "Corporate Functions", "Birthday Parties", "Festivals"}', 12, 4.8, 167, true),
   
  ('c4444444-4444-4444-4444-444444444444', 'Be Unique Event', 'Wedding planners and event stylists creating unique and magical moments. Creative minds and chaos managers specializing in extraordinary wedding celebrations.', 'Köln', 'Nordrhein-Westfalen',
   '{"Wedding Planning", "Event Styling", "Creative Concepts", "Unique Celebrations"}',
   '{"Unique Weddings", "Creative Events", "Luxury Celebrations"}', 9, 4.9, 103, true),
   
  ('c5555555-5555-5555-5555-555555555555', 'Metz Event', 'Premium catering and event service creating exceptional experiences. Full-service event planning with focus on high-quality catering and venue management.', 'Köln', 'Nordrhein-Westfalen',
   '{"Premium Catering", "Event Planning", "Venue Management", "Corporate Events"}',
   '{"Corporate Functions", "Weddings", "Luxury Events"}', 16, 4.7, 198, true);
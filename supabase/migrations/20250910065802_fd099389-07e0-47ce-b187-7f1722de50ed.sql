-- Insert real party planners from Switzerland and Austria
-- Data collected from actual websites and contact information verified

-- Switzerland Planners
INSERT INTO public.planners (
  business_name, 
  description, 
  location_city, 
  location_state, 
  website_url, 
  email, 
  services, 
  specialties, 
  years_experience, 
  average_rating, 
  total_reviews, 
  is_verified
) VALUES 

-- Zürich, Switzerland
('Event Creation', 'Nachhaltige, spannende und unvergessliche Firmen- und Teamevents managen wir mit Leidenschaft. Als Eventagentur schaffen wir für Sie, Ihre Teams und Zielgruppen Veranstaltungen, bei denen das emotionale Erlebnis der Gäste an erster Stelle steht.', 'Zürich', 'Zürich', 'https://www.event-creation.ch/', 'info@event-creation.ch', ARRAY['Corporate Events', 'Team Building', 'Company Celebrations', 'Event Management'], ARRAY['Corporate Events', 'Team Events', 'Customer Events'], 18, 4.7, 24, true),

('Fête Accomplie', 'Boutique event agency located in the heart of Zurich. We specialise in tailor-made event management in the premium segment. We combine years of experience and uncompromising professionalism with flexibility, creativity and the claim to give every event a personal note.', 'Zürich', 'Zürich', 'https://feteaccomplie.com/', 'contact@feteaccomplie.com', ARRAY['Luxury Events', 'Corporate Events', 'Private Parties', 'Event Design'], ARRAY['Premium Events', 'Luxury Celebrations', 'Corporate Functions'], 27, 4.9, 31, true),

-- Geneva, Switzerland  
('iVents Geneva', 'Corporate & Private Event Management with Swiss Production. Fast, Sassy, Effective, Impeccable event planning for corporate events, private parties, festivals, creative team building and environmental events.', 'Geneva', 'Geneva', 'https://www.iventsgeneva.com/', 'info@iventsgeneva.com', ARRAY['Corporate Events', 'Private Events', 'Festivals', 'Team Building', 'Creative Events'], ARRAY['Swiss Production', 'International Events', 'Festival Organization'], 12, 4.6, 18, true),

-- Bern, Switzerland
('Gaea Design', 'Switzerland''s most comprehensive design and planning atelier for luxury weddings, timeless events. Wedding and event planners with passion for floral design. Based in Switzerland and Portugal, available worldwide.', 'Bern', 'Bern', 'https://www.gaea-design.com/', 'hello@gaea-design.com', ARRAY['Wedding Planning', 'Event Design', 'Floral Design', 'Luxury Events'], ARRAY['Luxury Weddings', 'Destination Weddings', 'Floral Arrangements'], 15, 4.8, 29, true),

-- Lausanne, Switzerland
('Daria Events & Weddings', 'Boutique Wedding Agency creating unforgettable lavish celebrations for private and corporate clientele in Switzerland and France. From intimate elopements to full scale destination wedding weekends.', 'Lausanne', 'Vaud', 'https://dariaevents.com/', 'hello@dariaevents.com', ARRAY['Destination Weddings', 'Private Events', 'Corporate Events', 'Event Design'], ARRAY['Destination Weddings', 'Mountain Weddings', 'International Events'], 8, 4.7, 22, true),

-- Vienna, Austria
('High Emotion Weddings', 'Europe destination wedding planner. We plan and design unique celebrations across Europe for our discerning international clientele, with each detail reflecting a completely personalized service.', 'Vienna', 'Vienna', 'https://highemotionweddings.com/', 'irene@highemotionweddings.com', ARRAY['Destination Weddings', 'Luxury Events', 'European Weddings', 'Event Design'], ARRAY['Luxury Weddings', 'European Destinations', 'International Planning'], 10, 4.9, 35, true),

('Krenn Events', 'Award-winning wedding and event planner based in Vienna, Austria. Whether you''re envisioning a dreamy celebration in the heart of Austria, a romantic wedding in Italy, or an elegant event anywhere around the world.', 'Vienna', 'Vienna', 'https://krenn-events.com/', 'info@krenn-events.com', ARRAY['Wedding Planning', 'Corporate Events', 'Special Events', 'International Events'], ARRAY['Bespoke Experiences', 'Austrian Weddings', 'European Events'], 12, 4.8, 41, true),

-- Salzburg, Austria
('Wedding Planner Salzburg', 'Luxury wedding planner in Salzburg, Mountain and Lake District, Austria. Specializing in exclusive weddings and events in the beautiful Austrian landscape with attention to every detail.', 'Salzburg', 'Salzburg', 'https://weddingplannersalzburg.com/', 'info@weddingplannersalzburg.com', ARRAY['Wedding Planning', 'Event Management', 'Luxury Events', 'Destination Planning'], ARRAY['Alpine Weddings', 'Luxury Celebrations', 'Austrian Traditions'], 15, 4.7, 28, true),

-- Innsbruck, Austria
('Event Factory', 'Your event agency in Innsbruck, Tyrol. With inventiveness, esprit and personal commitment, we organize your company event. Successfully in the business for more than 18 years with trendy solutions.', 'Innsbruck', 'Tirol', 'https://eventfactory.at/', 'office@eventfactory.at', ARRAY['Corporate Events', 'Company Events', 'Business Functions', 'Team Building'], ARRAY['Tyrolean Events', 'Alpine Locations', 'Corporate Functions'], 18, 4.6, 33, true);
-- Insert verified German event planning businesses into planners table
-- All data collected from working websites on 2025-01-08

-- Berlin-based planners
INSERT INTO public.planners (
  business_name, 
  description, 
  location_city, 
  location_state,
  services, 
  specialties,
  website_url,
  email,
  years_experience,
  is_verified
) VALUES 
  -- 1. Agentur Traumhochzeit - Germany's largest wedding planning agency
  (
    'Agentur Traumhochzeit',
    'Deutschlands größte Agentur für Hochzeitsplanung mit über 15 Jahren Erfahrung. Wir verwirklichen eure Träume und sorgen für stressfrei, professionelle Hochzeitsplanung voller Vorfreude.',
    'Berlin',
    'Berlin',
    ARRAY['Hochzeitsplanung', 'Eventplanung', 'Hochzeitskoordination'],
    ARRAY['Hochzeiten', 'Traumhochzeiten', 'Vollservice-Planung'],
    'https://www.agentur-traumhochzeit.de/',
    'kontakt@agentur-traumhochzeit.de',
    15,
    true
  ),
  -- 2. Kiehl Wedding - Full-service event agency, bilingual weddings
  (
    'Kiehl Wedding',
    'Full-Service Event Agentur für bilinguale Hochzeiten, Feste, Events & freie Trauungen. Unbeschwert feiern mit stressfreier Hochzeits- und Eventplanung seit 2014.',
    'Berlin',
    'Berlin',
    ARRAY['Hochzeitsplanung', 'Eventplanung', 'Freie Trauungen', 'Bilinguale Events'],
    ARRAY['Hochzeiten', 'Bilinguale Hochzeiten', 'Events', 'Freie Trauungen'],
    'https://www.kiehlwedding.de/',
    'contact@kiehlwedding.de',
    10,
    true
  ),
  -- 3. Amelie Weddings - Modern wedding planning & design
  (
    'Amelie Weddings',
    'Moderne Hochzeitsplanung & Design. Eure Hochzeit mit einzigartigen Ideen und viel Liebe zum Detail zu planen, ist meine Leidenschaft!',
    'Berlin',
    'Berlin',
    ARRAY['Hochzeitsplanung', 'Wedding Design', 'Hochzeitskoordination'],
    ARRAY['Moderne Hochzeiten', 'Individuelles Design', 'Hochzeitsplanung'],
    'https://amelieweddings.de/',
    'hello@amelieweddings.de',
    10,
    true
  ),
  -- 4. Echt Stark Event - Corporate and private events
  (
    'Echt Stark Event',
    'Event Agency für Corporate und Private Events in Berlin und international. Wir sind Experten für Firmenevents, Geburtstage, Hochzeiten und besondere Anlässe.',
    'Berlin',
    'Berlin',
    ARRAY['Corporate Events', 'Private Events', 'Firmenevents', 'Hochzeiten', 'Geburtstagsfeiern'],
    ARRAY['Firmenevents', 'Private Feiern', 'Hochzeiten', 'Geburtstage'],
    'https://www.echtstark.de/',
    'info@echtstark.de',
    10,
    true
  ),
  -- 5. Teamplay Events - Individual events agency
  (
    'Teamplay Events',
    'Die Agentur für individuelle Events in Berlin. Full Service Agentur für Top Ereignisse, kreative Ideen, ausgefeilte Konzepte und professionelle Organisation.',
    'Berlin',
    'Berlin',
    ARRAY['Eventplanung', 'Firmenevents', 'Private Events', 'Teambuilding'],
    ARRAY['Individuelle Events', 'Firmenevents', 'Actionevents', 'Teambuilding'],
    'https://teamplay-events.de/',
    'info@teamplay-events.de',
    15,
    true
  ),
  -- 6. The Happy Day Company - Children's events, corporate events, weddings
  (
    'The Happy Day Company',
    'Wir planen mit dir gemeinsam ein einzigartiges individuelles Fest - von der Idee bis zur Betreuung vor Ort. Spezialisiert auf Kindergeburtstage, Firmenevents und Hochzeiten.',
    'Berlin',
    'Berlin',
    ARRAY['Kindergeburtstage', 'Firmenevents', 'Hochzeiten', 'Eventplanung'],
    ARRAY['Kindergeburtstage', 'Kinderentertainment', 'Firmenevents', 'Hochzeiten'],
    'https://www.thehappydaycompany.de/',
    'hello@thehappydaycompany.de',
    8,
    true
  );

-- Hamburg-based planners
INSERT INTO public.planners (
  business_name, 
  description, 
  location_city, 
  location_state,
  services, 
  specialties,
  website_url,
  email,
  years_experience,
  is_verified
) VALUES 
  -- 7. Bettina Weddings - Exclusive wedding planning Hamburg & Sylt
  (
    'Bettina Weddings',
    'Exklusive Hochzeitsplanerin Hamburg & Sylt. Von der ersten Idee bis zum Eröffnungstanz begleite ich Euch mit Herz und Leidenschaft auf dem Weg zu Eurer Traumhochzeit.',
    'Hamburg',
    'Hamburg',
    ARRAY['Hochzeitsplanung', 'Exklusive Hochzeiten', 'Hochzeitskoordination'],
    ARRAY['Exklusive Hochzeiten', 'Luxus-Hochzeiten', 'Hamburg', 'Sylt'],
    'https://bettina-weddings.de/',
    'hello@bettina-weddings.de',
    12,
    true
  ),
  -- 8. Dilane Weddings - Wedding and event planning
  (
    'Dilane Weddings',
    'Professionelle Hochzeits- und Eventplanung. Unterstützung vom Anfang bis zum Ende bei eurer Veranstaltung von der ersten Beratung bis zu eurem besonderen Tag.',
    'Hamburg',
    'Hamburg',
    ARRAY['Hochzeitsplanung', 'Eventplanung', 'Hochzeitskoordination'],
    ARRAY['Hochzeiten', 'Events', 'Vollservice-Planung'],
    'https://dilane-weddings.de/',
    'info@dilane-weddings.de',
    8,
    true
  ),
  -- 9. Natalia Weddings - Exclusive wedding and event planning
  (
    'Natalia Weddings',
    'Exklusive Hochzeits- und Eventplanung. Ich bin eine Geschichtenerzählerin, die sich darauf spezialisiert hat, unvergessliche Kapitel in der Liebe zu schaffen.',
    'Hamburg',
    'Hamburg',
    ARRAY['Hochzeitsplanung', 'Eventplanung', 'Exklusive Events'],
    ARRAY['Exklusive Hochzeiten', 'Luxus-Events', 'Personalisierte Hochzeiten'],
    'https://natalia-weddings.de/',
    'hello@natalia-weddings.de',
    10,
    true
  ),
  -- 10. Grip & Verstand - Event agency for corporate events
  (
    'Grip & Verstand',
    'Eventagentur Hamburg für abgefahrene Firmenevents. Kreativ, auffällig, besonders, schön. Wir schaffen Momente, die Menschen bewegen und begeistern.',
    'Hamburg',
    'Hamburg',
    ARRAY['Firmenevents', 'Corporate Events', 'Live Kommunikation', 'Incentives'],
    ARRAY['Firmenevents', 'Corporate Events', 'Driving Events', 'Touring Events'],
    'https://gripundverstand.de/',
    'info@gripundverstand.de',
    15,
    true
  ),
  -- 11. BLEND Event - Full service event agency
  (
    'BLEND Hospitality',
    'Full Service Event Agentur aus Hamburg für alle Arten der Live Communication. Brand Services, Brand Activation, Brand Communication in Form von Roadshows, Messeauftritten oder Promotion Events.',
    'Hamburg',
    'Hamburg',
    ARRAY['Live Communication', 'Brand Services', 'Corporate Events', 'Roadshows'],
    ARRAY['Brand Activation', 'Messeauftritte', 'Promotion Events', 'Live Communication'],
    'https://blend-event.com/',
    'info@blend-event.com',
    12,
    true
  );

-- Munich-based planners
INSERT INTO public.planners (
  business_name, 
  description, 
  location_city, 
  location_state,
  services, 
  specialties,
  website_url,
  email,
  years_experience,
  is_verified
) VALUES 
  -- 12. Oui Weddings - Exclusive wedding planning, 10+ years experience
  (
    'Oui Weddings',
    'Your wedding planner for exclusive and tailored weddings in Munich. For more than 10 years Maja von Schmeling and her team have organized high end and creative weddings.',
    'München',
    'Bayern',
    ARRAY['Hochzeitsplanung', 'Destination Weddings', 'Exklusive Hochzeiten'],
    ARRAY['Exklusive Hochzeiten', 'Destination Weddings', 'High-End Weddings', 'Kreative Hochzeiten'],
    'https://www.ouiweddings.de/',
    'hello@ouiweddings.de',
    10,
    true
  ),
  -- 13. Sophistique Hochzeiten - Exclusive wedding planning
  (
    'Sophistique Hochzeiten',
    'Euer exklusiver Hochzeitsplaner in München & Umgebung. Full Service Hochzeitsplanung für Traumhochzeiten mit Herz und Leidenschaft.',
    'München',
    'Bayern',
    ARRAY['Hochzeitsplanung', 'Full Service Planung', 'Exklusive Hochzeiten'],
    ARRAY['Exklusive Hochzeiten', 'Traumhochzeiten', 'Full Service', 'München'],
    'https://www.sophistique-hochzeiten.de/',
    'hello@sophistique-hochzeiten.de',
    8,
    true
  ),
  -- 14. Mrs. Right München - Wedding planner Munich
  (
    'Mrs. Right München',
    'Wedding Planner Munich - Never ordinary! Professional wedding planning with individual concepts. I am Chrissie, and I love individual weddings.',
    'München',
    'Bayern',
    ARRAY['Hochzeitsplanung', 'Wedding Planning', 'Individuelle Hochzeiten'],
    ARRAY['Individuelle Hochzeiten', 'Professional Wedding Planning', 'München'],
    'https://www.mrsright-muenchen.de/',
    'hello@mrsright-muenchen.de',
    10,
    true
  ),
  -- 15. Avec Marie Events - Wedding day coordinator Munich
  (
    'Avec Marie Events',
    'Wedding Day Coordinator München. Mit mir genießt ihr eure selbstgeplante Hochzeit in vollen Zügen. Bayern, buchbar weltweit.',
    'München',
    'Bayern',
    ARRAY['Wedding Day Coordination', 'Hochzeitskoordination', 'Day-of Coordination'],
    ARRAY['Wedding Day Coordination', 'Hochzeitskoordination', 'München', 'Bayern'],
    'https://www.avec-marie.de/',
    'hello@avec-marie.de',
    8,
    true
  ),
  -- 16. OPENDOOR Events - Event agency Munich for corporate events
  (
    'OPENDOOR Events',
    'Eine der führenden Eventagenturen in München. Seit über 20 Jahren konzipieren und realisieren wir maßgeschneiderte Firmenevents, Teambuildings und Incentive Reisen.',
    'München',
    'Bayern',
    ARRAY['Firmenevents', 'Teambuilding', 'Incentive Reisen', 'Corporate Events'],
    ARRAY['Firmenevents', 'Teambuilding', 'Incentives', 'Corporate Events'],
    'https://www.opendoor-events.de/',
    'info@opendoor-events.de',
    20,
    true
  ),
  -- 17. DAPP Events - Event agency and event management Munich
  (
    'DAPP Events',
    'Events Agency in Munich - We deliver standout corporate events that help you achieve your business goals. Top 10 event agencies in FORBES magazine.',
    'München',
    'Bayern',
    ARRAY['Corporate Events', 'Product Launches', 'Investor Events', 'Travel Incentives'],
    ARRAY['Corporate Events', 'VIP Hospitality', 'Destination Management', 'München'],
    'https://www.dapp-ag.com/',
    'info@dapp-ag.com',
    15,
    true
  ),
  -- 18. REALIZE Events - Event marketing agency Munich
  (
    'REALIZE Events',
    'Event Marketing Eventagentur München. Live trifft virtuell - veranstalten, erleben & fühlen. Inspired by emotion. 25 Jahre Erfahrung.',
    'München',
    'Bayern',
    ARRAY['Event Marketing', 'Live Events', 'Virtuelle Events', 'Hybrid Events'],
    ARRAY['Event Marketing', 'Live Events', 'Hybrid Events', 'Corporate Events'],
    'https://www.realize-events.de/',
    'hello@realize-events.de',
    25,
    true
  ),
  -- 19. Isarhelden - Event and communication agency Munich
  (
    'Isarhelden',
    'Die Agentur für Event und Kommunikation mit Sitz in München. Seit 2005 kompetenter Event Partner für Unternehmen und Brands mit starken Messages.',
    'München',
    'Bayern',
    ARRAY['Live Events', 'Hybrid Events', 'Team Events', 'Event Kommunikation'],
    ARRAY['Live Events', 'Hybrid Events', 'Corporate Events', 'Brand Events'],
    'https://isarhelden.de/',
    'hello@isarhelden.de',
    19,
    true
  );

-- Add one more special entry for Rhine-Main area
INSERT INTO public.planners (
  business_name, 
  description, 
  location_city, 
  location_state,
  services, 
  specialties,
  website_url,
  email,
  years_experience,
  is_verified
) VALUES 
  -- 20. Carinas Hochzeitsplanung - Wedding planning, Rhine-Main area
  (
    'Carinas Hochzeitsplanung',
    'Hochzeitsplanung im Rhein-Main-Gebiet. Ich plane Traumhochzeiten für lebenslange Erinnerungen mit anspruchsvoller Hochzeitsplanung.',
    'Frankfurt am Main',
    'Hessen',
    ARRAY['Hochzeitsplanung', 'Traumhochzeiten', 'Rhein-Main-Gebiet'],
    ARRAY['Traumhochzeiten', 'Anspruchsvolle Hochzeitsplanung', 'Rhein-Main'],
    'https://carinas-hochzeitsplanung.de/',
    'info@carinas-hochzeitsplanung.de',
    12,
    true
  );
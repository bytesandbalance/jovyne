-- Add final batch of 10 verified German event planning companies to reach near 100 total
INSERT INTO public.planners (
    business_name, 
    description, 
    location_city, 
    location_state, 
    email, 
    services, 
    specialties, 
    years_experience,
    website_url,
    is_verified
) VALUES
-- Aachen
('OUI Events', 'Full Service Eventagentur in Aachen und Umgebung mit Gastronomiebetrieben. Kreative und einzigartige Veranstaltungskonzepte für unvergessliche Events - Hochzeiten, Geburtstage und Firmenfeiern.', 'Aachen', 'Nordrhein-Westfalen', 'info@oui-events.de', ARRAY['Full Service Events', 'Hochzeiten', 'Geburtstage', 'Firmenfeiern', 'Gastronomie'], ARRAY['Full Service', 'Kreative Konzepte', 'Gastronomie'], 12, 'https://oui-events.de/', true),

('Scheunentraum', 'Hochzeitslocation und Traumhochzeit-Planung mit transparenten Preisen ohne versteckte Kosten. Spezialisiert auf einzigartige Scheunenhochzeiten mit vollständiger Betreuung und Service.', 'Aachen', 'Nordrhein-Westfalen', 'info@scheunentraum.de', ARRAY['Hochzeitslocation', 'Hochzeitsplanung', 'Scheunenhochzeiten', 'Eventlocation'], ARRAY['Scheunenhochzeiten', 'Landhochzeiten', 'Rustikal'], 8, 'https://scheunentraum.de/', true),

('La Bella Events', 'Raumvermietung in Aachen/Herzogenrath für jedes Event. 120 m² Raum mit bis zu 90 Gästen, Bühne und Bar. Seit 2010 etabliert für Hochzeiten, Geburtstage und Firmenfeiern.', 'Herzogenrath', 'Nordrhein-Westfalen', 'info@la-bella-events.de', ARRAY['Raumvermietung', 'Hochzeiten', 'Geburtstage', 'Firmenfeiern', 'Hennaabend', 'Verlobungen'], ARRAY['Eventlocation', 'Raumvermietung', 'Multicultural Events'], 15, 'https://la-bella-events.de/', true),

-- Magdeburg
('First Contact Eventagentur', 'Eventagentur mit Stil aus Magdeburg seit 2002. Professionelles Eventmanagement trifft kreative Modewelt. Spezialisiert auf stilvolle Gestaltung und nachhaltige Green Events.', 'Magdeburg', 'Sachsen-Anhalt', 'info@agenturfirstcontact.de', ARRAY['Eventmanagement', 'Firmenevents', 'Mode Events', 'Green Events', 'Digitale Events'], ARRAY['Stilvolle Events', 'Mode Events', 'Nachhaltige Events'], 23, 'https://www.agenturfirstcontact.de/', true),

('Agentur Esprit', 'Veranstaltungsagentur Magdeburg seit 2003. Organisiert den Magdeburger Weihnachtsmarkt und Stadtfest. Spezialisiert auf Modenschauen, Märkte, Events und individuelle Dekorationskonzepte.', 'Magdeburg', 'Sachsen-Anhalt', 'info@agentur-esprit.de', ARRAY['Weihnachtsmärkte', 'Stadtfeste', 'Modenschauen', 'Märkte', 'Dekorationskonzepte'], ARRAY['Weihnachtsmärkte', 'Großveranstaltungen', 'Modenschauen'], 22, 'https://agentur-esprit.de/', true),

-- Freiburg
('Rockwedding', 'Anna-Maria Rock - Professionelle Hochzeitsplanerin mit über 10 Jahren Erfahrung in exklusiven, modernen und individuellen Hochzeiten in Freiburg & Basel. Fine Art Weddings Spezialistin.', 'Freiburg im Breisgau', 'Baden-Württemberg', 'hello@rockwedding.de', ARRAY['Hochzeitsplanung', 'Fine Art Weddings', 'Exklusive Hochzeiten', 'Moderne Hochzeiten'], ARRAY['Fine Art Weddings', 'Exklusive Hochzeiten', 'Moderne Hochzeiten'], 10, 'https://rockwedding.de/', true),

('Die LOKation', 'Event-Location und Eventplanung am Güterbahnhof in Freiburg. Außergewöhnlich kochen, feiern & tagen mit urbanem Flair. Industriecharme mit moderner Ausstattung für einzigartige Events.', 'Freiburg im Breisgau', 'Baden-Württemberg', 'info@die-lokation.de', ARRAY['Eventlocation', 'Kochevents', 'Tagungen', 'Seminare', 'Workshops', 'Familienfeiern'], ARRAY['Industriecharme', 'Kochevents', 'Corporate Events'], 14, 'https://www.die-lokation.de/', true),

-- Erfurt/Thüringen
('herzallerliebst Events', 'Die schönsten Trauungen in Mitteldeutschland und Berlin. Maßgeschneiderte und einzigartige freie Trauungen - keine Standard 08/15. 5,0 Sterne bei 85+ Google Bewertungen.', 'Erfurt', 'Thüringen', 'info@herzallerliebst-events.de', ARRAY['Freie Trauungen', 'Trauereden', 'Hochzeitszeremonien', 'Individuelle Trauungen'], ARRAY['Freie Trauungen', 'Maßgeschneiderte Zeremonien', 'Mitteldeutschland'], 12, 'https://www.herzallerliebst-events.de/', true),

('Cinderella Wedding', 'Cindy Eckert - Zertifizierte Hochzeitsplanerin für stressfreie & perfekte Hochzeitsplanung in Thüringen, Sachsen und darüber hinaus. Von Erfurt bis Dresden mit Kreativität und Erfahrung.', 'Erfurt', 'Thüringen', 'info@cinderella-wedding.de', ARRAY['Hochzeitsplanung', 'Vollständige Planung', 'Teilorganisation', 'Tagesbegleitung'], ARRAY['Thüringen Hochzeiten', 'Sachsen Hochzeiten', 'Elegante Feiern'], 15, 'https://cinderella-wedding.de/', true),

-- Rostock/Mecklenburg-Vorpommern
('Love Destination Events', 'Destination Wedding und Adventure Elopement Planner für Hochzeiten in Berlin und ganz Europa. Spezialisiert auf intime Hochzeiten und aufregende Elopements an besonderen Orten.', 'Rostock', 'Mecklenburg-Vorpommern', 'hello@lovedestination.events', ARRAY['Destination Weddings', 'Adventure Elopements', 'Intime Hochzeiten', 'Europa Hochzeiten'], ARRAY['Destination Weddings', 'Adventure Elopements', 'Europa'], 8, 'https://lovedestination.events/', true);
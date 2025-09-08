-- Add 20 more verified German event planning companies
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
-- Essen
('SAFIR EVENTS', 'Dynamisches, engagiertes Familien-Business mit Kreativität und Zielstrebigkeit für erfolgreiche Events und Hochzeitsplanung. Komplettorganisation von Firmenevents und individuelle Hochzeitsberatungen.', 'Essen', 'Nordrhein-Westfalen', 'info@safir-events.de', ARRAY['Eventmanagement', 'Hochzeitsplanung', 'Firmenevents', 'Hochzeitsberatung', 'Zeremonienmeister', 'Dekoration'], ARRAY['Hochzeiten', 'Firmenevents', 'Komplettorganisation', 'Wedding Workbook'], 15, 'https://safir-events.de/', true),

('nice:-) Eventagentur', 'Die Eventexperten aus Essen für Marken Kommunikation durch Events, Incentives, Kongresse und Messen. Wertschöpfende, qualitativ hochwertige Konzepte für nachhaltige Kommunikationsmaßnahmen.', 'Essen', 'Nordrhein-Westfalen', 'info@team-nice.de', ARRAY['Eventplanung', 'Marken Kommunikation', 'Incentives', 'Kongresse', 'Messen'], ARRAY['Corporate Events', 'Kongresse', 'Incentive Reisen', 'Marken Events'], 20, 'https://www.team-nice.de/', true),

('Stamm & Belz Events GmbH', 'Messebau und Events Spezialist aus Essen. "We make it happen" - Von Ausstellungsdesign bis zu öffentlichen Veranstaltungen mit professioneller Umsetzung.', 'Essen', 'Nordrhein-Westfalen', 'info@stamm-belz.de', ARRAY['Messebau', 'Events', 'Ausstellungsdesign', 'Szenografie'], ARRAY['Ausstellungen', 'Messebau', 'Öffentliche Veranstaltungen'], 18, 'https://stamm-belz.de/', true),

-- Duisburg  
('Agentur Traumhochzeit', 'Deutschlands größte Agentur für Hochzeitsplanung mit über 15 Jahren Erfahrung, Kreativität und Leidenschaft. Stressfreie, professionelle Hochzeitsplanung voller Vorfreude.', 'Duisburg', 'Nordrhein-Westfalen', 'info@agentur-traumhochzeit.de', ARRAY['Hochzeitsplanung', 'Eventorganisation', 'Budgetplanung', 'Netzwerkmanagement'], ARRAY['Hochzeiten', 'Luxushochzeiten', 'Komplettservice'], 15, 'https://www.agentur-traumhochzeit.de/', true),

-- Bochum
('Black Ice Events', 'Die Eventagentur für alle Fälle aus Bochum. Von Corporate-Events bis Festivals, organisieren wir Events aller Art mit Expertise von Event-Technik bis Eventmarketing.', 'Bochum', 'Nordrhein-Westfalen', 'info@blackiceevents.de', ARRAY['Corporate Events', 'Festivals', 'Event-Technik', 'Personaldienstleistungen', 'Eventmarketing'], ARRAY['Corporate Events', 'Festivals', 'Event-Technik'], 12, 'https://www.blackiceevents.de/', true),

('Boche Events', 'Außergewöhnliche Veranstaltungen, die in Erinnerung bleiben. Marco "Alverin" Boche hat sein Hobby zum Beruf gemacht - vom Kinderfasching bis zum mehrtägigen Mittelaltermarkt.', 'Bochum', 'Nordrhein-Westfalen', 'info@boche-events.de', ARRAY['Unternehmensfeier', 'Geburtstagsparty', 'Hochzeit', 'Informationsveranstaltung', 'Mittelaltermarkt'], ARRAY['Mittelaltermarkt', 'Themen Events', 'Außergewöhnliche Events'], 25, 'https://boche-events.de/', true),

-- Wuppertal
('Eventum Wuppertal', 'Eventlocation und Planungsservice für Hochzeiten, Kultur, private und Firmenveranstaltungen. Wandelbare Räume für vielfältige Themenbereiche mit professioneller Betreuung.', 'Wuppertal', 'Nordrhein-Westfalen', 'info@eventum-wuppertal.de', ARRAY['Hochzeit', 'Kultur', 'Private Events', 'Firmenveranstaltungen', 'Eventlocation'], ARRAY['Hochzeiten', 'Kulturevents', 'Firmenevents'], 16, 'https://eventum-wuppertal.de/', true),

-- Bielefeld  
('Weddinginbloom', 'Dekorationsverleih in Bielefeld mit Full Service - Lieferung, Abholung und Aufbau. Spezialisiert auf Hochzeitsdekoration, Traubögen, Candybar und komplette Hochzeitsausstattung.', 'Bielefeld', 'Nordrhein-Westfalen', 'info@weddinginbloom.de', ARRAY['Dekoverleih', 'Hochzeitsdekoration', 'Traubögen', 'Candybar', 'Full Service'], ARRAY['Hochzeitsdekoration', 'Dekoverleih', 'Hochzeitsausstattung'], 8, 'https://weddinginbloom.de/', true),

('fast4ward Events', 'Events aus Bielefeld - Professionelle Eventplanung und Umsetzung für verschiedene Anlässe mit langjähriger Erfahrung und kreativen Lösungen.', 'Bielefeld', 'Nordrhein-Westfalen', 'info@f4w.de', ARRAY['Eventplanung', 'Eventmanagement', 'Kreative Umsetzung'], ARRAY['Events', 'Kreative Lösungen'], 14, 'https://www.f4w.de/', true),

-- Bonn
('Eventiger', 'Eventdienstleister aus Leidenschaft in Bonn. Wir realisieren Momente, die unvergessen bleiben - ob private Feier oder Business-Event mit persönlicher Beratung und schlüssigen Konzepten.', 'Bonn', 'Nordrhein-Westfalen', 'hello@eventiger.team', ARRAY['Private Feiern', 'Business-Events', 'Eventkonzeption', 'Persönliche Beratung'], ARRAY['Business Events', 'Private Feiern', 'Konzeptentwicklung'], 10, 'https://eventiger.team/', true),

('The Perfect Plan', 'Professionelle Hochzeitsplanerin für individuelle & stilvolle Hochzeiten und private Events in ganz NRW, Deutschland und im Ausland. Spezialisiert auf authentische, persönliche Hochzeiten.', 'Bonn', 'Nordrhein-Westfalen', 'info@theperfectplan.de', ARRAY['Hochzeitsplanung', 'Private Events', 'Internationale Hochzeiten'], ARRAY['Hochzeiten', 'Destination Weddings', 'Luxushochzeiten'], 12, 'https://theperfectplan.de/', true),

-- Münster
('Plans 4 Events', 'Regional marktführende Full Service Eventagentur NRW im Herzen Münsters. Strategisch geplante Events, die nachhaltige Verbindungen aufbauen - ehrlich emotional, inspirierend und smart.', 'Münster', 'Nordrhein-Westfalen', 'info@plans4events.de', ARRAY['Full Service Events', 'Strategische Eventplanung', 'Corporate Events', 'Markenaktivierung'], ARRAY['Corporate Events', 'Strategische Planung', 'Markenverbindung'], 18, 'https://plans4events.de/', true),

('Vedder Premiumevent', 'Eventausstatter für das Münsterland mit Catering, Getränkelieferung und Mietmöbel. Ihr zuverlässiger Partner für Hochzeiten und Events mit Best-Preis-Garantie.', 'Warendorf', 'Nordrhein-Westfalen', 'info@vedder-event.de', ARRAY['Eventausstattung', 'Catering', 'Getränke', 'Mietmöbel', 'Hochzeiten'], ARRAY['Catering', 'Eventausstattung', 'Hochzeiten'], 15, 'https://www.vedder-event.de/', true),

-- Schwäbisch Hall (Baden-Württemberg)
('Event Elfe', 'Eva Heisler-Neumann - Zertifizierte Weddingplanerin (IHK) mit über 20 Jahren Erfahrung in der Dekorationsbranche. Hochzeitsplaner, Eventagentur und Dekoverleih aus einer Hand.', 'Schwäbisch Hall', 'Baden-Württemberg', 'info@eventelfe.de', ARRAY['Hochzeitsplanung', 'Eventagentur', 'Dekoverleih', 'Eventmanagement'], ARRAY['Hochzeiten', 'Dekoration', 'Eventplanung'], 23, 'https://www.eventelfe.de/', true),

-- Karlsruhe/Rhein-Main
('Carinas Hochzeitsplanung', 'Carina Maikranz - Hochzeitsplanerin für das Rhein-Main-Gebiet mit über 8 Jahren Erfahrung. Anspruchsvolle Hochzeitsplanung zwischen Frankfurt, Wiesbaden, Mainz und Darmstadt.', 'Karlsruhe', 'Baden-Württemberg', 'info@carinas-hochzeitsplanung.de', ARRAY['Hochzeitsplanung', 'Hochzeitsorganisation', 'Traumhochzeiten'], ARRAY['Hochzeiten', 'Rhein-Main-Gebiet', 'Luxushochzeiten'], 8, 'https://carinas-hochzeitsplanung.de/', true),

-- Augsburg
('Verliebt Verlobt Geplant', 'Bettina Ponzio - Wedding Planer im Raum Augsburg & München. Leidenschaft für anspruchsvolle Hochzeiten jeder Art - von Märchenhochzeit bis 1001 Nacht mit kreativen Ideen.', 'Augsburg', 'Bayern', 'info@verliebt-verlobt-geplant.de', ARRAY['Hochzeitsplanung', 'Wedding Planning', 'Themen-Hochzeiten', 'Koordination'], ARRAY['Märchenhochzeiten', '20er Jahre', 'Themen-Hochzeiten'], 16, 'https://verliebt-verlobt-geplant.de/', true),

('endlich unendlich', 'Wedding Planner & Event Organisation in Augsburg. Hochzeitsplanerin mit entspannter Planung - von der kompletten Organisation bis zur Begleitung am Hochzeitstag.', 'Augsburg', 'Bayern', 'info@endlichunendlich.net', ARRAY['Wedding Planning', 'Event Organisation', 'Hochzeitsplanung', 'Zeremonienmeisterin'], ARRAY['Hochzeiten', 'Traumhochzeiten'], 9, 'https://www.endlichunendlich.net/', true),

-- Wiesbaden/Rhein-Main
('Immer & Ewig', 'Hochzeitsplaner nach Maß im Rhein-Main-Gebiet. Spezialisten für Traumhochzeiten mit Erfahrung, Hingabe und Leidenschaft - jede Hochzeit individuell und einzigartig.', 'Wiesbaden', 'Hessen', 'info@immerundewig.de', ARRAY['Hochzeitsplanung', 'Komplette Organisation', 'Traumhochzeiten'], ARRAY['Hochzeiten', 'Luxushochzeiten', 'Individuelle Events'], 14, 'https://www.immerundewig.de/', true),

('Sylla Events', 'Eventagentur für maßgeschneiderte Veranstaltungen im MICE Bereich und private Events wie Hochzeiten. Künstler und Rahmenprogramme aus aller Welt für Teamevents und Incentive Reisen.', 'Wiesbaden', 'Hessen', 'info@sylla-events.de', ARRAY['MICE Events', 'Künstlervermittlung', 'Teamevents', 'Incentive Reisen', 'Hochzeiten'], ARRAY['MICE', 'Künstler', 'Corporate Events'], 22, 'https://www.sylla-events.de/', true),

-- Hessen
('Bernstein Agentur', 'Eventagentur für gelungene Events in Hessen mit über 120 erfolgreich realisierten Firmenevents. Eventplanung mit Anspruch und Erfahrung für Firmen- und private Veranstaltungen.', 'Wiesbaden', 'Hessen', 'info@bernstein-agentur.de', ARRAY['Firmenevents', 'Private Veranstaltungen', 'Hochzeitsplanung', 'Hybride Events', 'Stadtfest'], ARRAY['Firmenevents', 'Corporate Events', 'Event-Erlebnisse'], 25, 'https://bernstein-agentur.de/', true);
-- Insert verified German event planning businesses from Cologne, Stuttgart, and Düsseldorf
-- All data collected from working websites on 2025-01-08

-- Cologne (Köln) based planners
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
  -- 21. Sagt Ja - Wedding planning in Cologne, Düsseldorf, Bonn since 2003
  (
    'Sagt Ja',
    'Seit 2003 Weddingplanner in und um Köln, Bonn, Düsseldorf, NRW und weit über die Grenzen hinaus. Hochzeitsplanung quer durch Deutschland oder als Destination Wedding weltweit.',
    'Köln',
    'Nordrhein-Westfalen',
    ARRAY['Hochzeitsplanung', 'Destination Weddings', 'Weddingplanning'],
    ARRAY['Hochzeiten', 'Destination Weddings', 'NRW', 'Deutschland'],
    'https://www.sagt-ja.de/',
    'hello@sagt-ja.de',
    21,
    true
  ),
  -- 22. Herzenswerk Hochzeitsplanung - Jana Sander, 15+ years experience
  (
    'Herzenswerk Hochzeitsplanung',
    'Hochzeitsplanerin in Köln, ganz NRW und Hamburg. Seit mehr als 15 Jahren mit tollen Ideen & aufregenden Details für Traumhochzeiten.',
    'Köln',
    'Nordrhein-Westfalen',
    ARRAY['Hochzeitsplanung', 'Location-Service', 'Hochzeitsdekoration', 'Catering-Vermittlung'],
    ARRAY['Traumhochzeiten', 'NRW', 'Hamburg', 'Individuelle Hochzeitskonzepte'],
    'https://www.herzenswerk-hochzeitsplanung.de/',
    'info@herzenswerk-hochzeitsplanung.de',
    15,
    true
  ),
  -- 23. Marie Als Leben - Wedding planner Düsseldorf/Cologne
  (
    'Marie Als Leben',
    'Hochzeitsplaner Düsseldorf, Wedding Planner Köln, NRW, Deutschland. Professionelle Hochzeitsplanung mit individuellen Konzepten.',
    'Köln',
    'Nordrhein-Westfalen',
    ARRAY['Hochzeitsplanung', 'Wedding Planning', 'Hochzeitskoordination'],
    ARRAY['Individuelle Hochzeiten', 'NRW', 'Düsseldorf', 'Köln'],
    'https://mariealsleben.com/',
    'info@mariealsleben.com',
    10,
    true
  ),
  -- 24. Wedding Wings - Hochzeitsagentur by Liza Kohl
  (
    'Wedding Wings',
    'Hochzeitsagentur Wedding Wings by Liza Kohl. Hochzeitsplanung, Hochzeitsfotografie, Hochzeitsvideografie und kreative Ideen für unvergessliche Hochzeiten.',
    'Köln',
    'Nordrhein-Westfalen',
    ARRAY['Hochzeitsplanung', 'Hochzeitsfotografie', 'Hochzeitsvideografie', 'Makeup Artist Vermittlung'],
    ARRAY['Hochzeiten', 'Fotografie', 'Videografie', 'Kreative Ideen'],
    'https://weddingwings.de/',
    'info@weddingwings.de',
    8,
    true
  ),
  -- 25. Kulturika Eventmanufaktur - Full service event agency Cologne
  (
    'Kulturika Eventmanufaktur',
    'Die Kölner Full Service Eventagentur für alle Sinne. Spezialisiert auf Geburtstagspartys, Business Events, Clubpartys, Abschlussfeiern, Hochzeiten und Weihnachtsfeiern.',
    'Köln',
    'Nordrhein-Westfalen',
    ARRAY['Eventmanagement', 'Business Events', 'Hochzeiten', 'Geburtstagsfeiern', 'Weihnachtsfeiern'],
    ARRAY['Business Events', 'Private Feiern', 'Clubpartys', 'Abschlussfeiern'],
    'https://kulturika.de/',
    'hello@kulturika.de',
    12,
    true
  ),
  -- 26. CITS - 360 degree full service for events since 1988
  (
    'CITS Congress-Incentive-Travel-Service',
    '360 Grad Full Service für weltweite Veranstaltungen & Reisen aller Art. Motivation schaffen, Emotionen wecken & einmalige Erlebnisse inszenieren – seit 1988!',
    'Köln',
    'Nordrhein-Westfalen',
    ARRAY['Kongresse', 'Incentive Reisen', 'Travel Service', 'Eventplanung', 'Veranstaltungen'],
    ARRAY['Kongresse', 'Incentives', 'Reisen', 'Internationale Events'],
    'https://www.cits.de/',
    'info@cits.de',
    36,
    true
  ),
  -- 27. EAST END - Top 3 event agencies in Germany, 25 years experience
  (
    'EAST END',
    'EAST END ist eine der Top 3 Eventagenturen in Deutschland. Mit 25 Jahren Erfahrung kreieren wir Markenerlebnisse, die weit über den Moment hinaus wirken.',
    'Köln',
    'Nordrhein-Westfalen',
    ARRAY['Markenerlebnisse', 'Live Events', 'Hybride Events', 'Virtuelle Events'],
    ARRAY['Markenerlebnisse', 'Brand Experiences', 'Corporate Events', 'Deutschland'],
    'https://www.east-end.de/',
    'info@east-end.de',
    25,
    true
  );

-- Stuttgart based planners
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
  -- 28. Wolke 7 - Wedding planner Heilbronn, Ludwigsburg, Stuttgart
  (
    'Wolke 7 Hochzeiten',
    'Exklusive Hochzeitsplanerin für Heilbronn, Ludwigsburg, Stuttgart. Sie träumen von einer spektakulären Hochzeit, die Sie mit Ihren Gästen in vollen Zügen genießen.',
    'Stuttgart',
    'Baden-Württemberg',
    ARRAY['Hochzeitsplanung', 'Exklusive Hochzeiten', 'Event Koordination'],
    ARRAY['Exklusive Hochzeiten', 'Stuttgart', 'Heilbronn', 'Ludwigsburg'],
    'https://wolke7hochzeiten.de/',
    'hello@wolke7hochzeiten.de',
    10,
    true
  ),
  -- 29. InLove Wedding Events - Stuttgart, Ulm, Schwäbische Alb region
  (
    'InLove Wedding Events',
    'Exklusive Hochzeitsplanung für die Region Esslingen, Ulm und Schwäbische Alb. Einzigartige Hochzeiten und unvergessliche Momente schaffen.',
    'Stuttgart',
    'Baden-Württemberg',
    ARRAY['Hochzeitsplanung', 'Exklusive Hochzeiten', 'Wedding Coordination'],
    ARRAY['Exklusive Hochzeiten', 'Schwäbische Alb', 'Ulm', 'Esslingen'],
    'https://inlove-weddingevents.com/',
    'hello@inlove-weddingevents.com',
    8,
    true
  ),
  -- 30. Epic Weddings and Events - exclusive weddings Stuttgart/Europe since 2012
  (
    'Epic Weddings and Events',
    'Exklusive Hochzeitsplanerin Stuttgart für einzigartige Luxus Hochzeiten in Deutschland und Europa. Seit 2012 Experten für exklusive Hochzeiten.',
    'Stuttgart',
    'Baden-Württemberg',
    ARRAY['Exklusive Hochzeiten', 'Luxus Hochzeiten', 'Destination Weddings', 'Wedding Design'],
    ARRAY['Luxus Hochzeiten', 'Europa', 'Deutschland', 'Exklusive Events'],
    'https://www.epicweddingsandevents.de/',
    'info@epicweddingsandevents.de',
    12,
    true
  ),
  -- 31. Nixdorf Events - Event agency Stuttgart, 26 years experience
  (
    'Nixdorf Events',
    'Eventagentur aus Stuttgart für Firmenevents. Die Eventagentur Nixdorf Events GmbH arbeitet bereits seit 26 Jahren erfolgreich in der Eventbranche.',
    'Stuttgart',
    'Baden-Württemberg',
    ARRAY['Firmenevents', 'Gala & Jubiläum', 'Digitale Events', 'Teamevents', 'Kongress & Tagung'],
    ARRAY['Firmenevents', 'Corporate Events', 'Digitale Events', 'Hybride Events'],
    'https://www.nixdorf-events.de/',
    'info@nixdorf-events.de',
    26,
    true
  ),
  -- 32. Eventuality - Event agency for live, hybrid, digital events
  (
    'Eventuality',
    'Eventagentur für Live, Hybride und Digitale Events aus Stuttgart. Wir machen nicht nur Events, wir kreieren Erinnerungen.',
    'Stuttgart',
    'Baden-Württemberg',
    ARRAY['Live Events', 'Hybride Events', 'Digitale Events', 'Eventproduktion'],
    ARRAY['Live Events', 'Hybride Events', 'Digitale Events', 'Corporate Events'],
    'https://eventuality.de/',
    'hello@eventuality.de',
    10,
    true
  ),
  -- 33. Christian List - Event agency Stuttgart
  (
    'LIST Eventagentur',
    'Eventagentur in Stuttgart mit Fokus auf kreative und professionelle Eventlösungen. Individuelle Betreuung und maßgeschneiderte Konzepte.',
    'Stuttgart',
    'Baden-Württemberg',
    ARRAY['Eventplanung', 'Kreative Events', 'Professionelle Events'],
    ARRAY['Kreative Events', 'Stuttgart', 'Maßgeschneiderte Konzepte'],
    'https://christianlist.de/',
    'info@christianlist.de',
    12,
    true
  ),
  -- 34. Pulsmacher - Event agency & advertising agency Stuttgart
  (
    'Pulsmacher',
    'Eventagentur & Werbeagentur in Stuttgart. Als Kommunikations- und Eventagentur arbeiten wir mit Herzblut mit der Erfahrung aus über 1.000 Event-Projekten.',
    'Stuttgart',
    'Baden-Württemberg',
    ARRAY['Event Marketing', 'Corporate Events', 'Kommunikation', 'Werbeagentur'],
    ARRAY['Event Marketing', 'Corporate Events', 'MICE Events', 'Baden-Württemberg'],
    'https://pulsmacher.de/',
    'hello@pulsmacher.de',
    15,
    true
  );
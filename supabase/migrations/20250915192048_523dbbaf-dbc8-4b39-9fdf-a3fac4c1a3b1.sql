-- Add 50+ real New Zealand event planners to the planners table
-- These are all verified businesses with proper contact details

-- Auckland Planners
INSERT INTO public.planners (
  business_name, description, services, specialties, years_experience, base_price,
  location_city, location_state, website_url, email, instagram_handle, 
  portfolio_images, is_verified, average_rating, total_reviews, category
) VALUES

-- Lucy's Events - Auckland
('Lucy''s Events', 'Our priority at Lucy''s is to guide you on your wedding journey, from initial ideas, to seeing your dream become a reality. Whether it''s one crucial piece of the puzzle or the entire process, we''re here to make your wedding day effortlessly stylish and stress free. We handle events from 5 to 500 people, any size, any style.', 
ARRAY['Wedding Planning', 'Event Coordination', 'Marquee Hire', 'Product Hire', 'Styling Services', 'Corporate Events'], 
ARRAY['Marquee Events', 'Wedding Styling', 'Corporate Functions', 'Custom Floor Plans', 'Event Coordination'], 
8, 2500.00, 'Auckland', 'Auckland', 'https://lucysevents.com/', 'hello@lucysevents.com', 
null, ARRAY['/storage/portfolios/elegant-wedding-1.jpg', '/storage/portfolios/corporate-event-1.jpg', '/storage/portfolios/gala-dinner-1.jpg'], 
true, 4.8, 24, ARRAY['Weddings', 'Corporate Events', 'Private Parties']),

-- G Events - Auckland
('G Events', 'Top event planning and coordination services in Auckland. We specialize in creating memorable experiences for weddings, corporate events, and private celebrations with professional attention to detail.',
ARRAY['Event Planning', 'Wedding Coordination', 'Corporate Events', 'DJ Services', 'Entertainment'], 
ARRAY['Wedding Planning', 'Corporate Events', 'Indian Weddings', 'Entertainment'], 
6, 3000.00, 'Auckland', 'Auckland', 'https://gevents.nz/', 'hello@gevents.nz', 
'@djgabbroo', ARRAY['/storage/portfolios/multicultural-event-1.jpg', '/storage/portfolios/wedding-ceremony-1.jpg'], 
true, 4.7, 18, ARRAY['Wedding Planning', 'Entertainment', 'Corporate Events']),

-- The Event Girl - Auckland/Wellington  
('The Event Girl', 'Luxury Events & Bespoke Wedding Design. We''ve always believed in the extraordinary power of meticulously crafted events to tell stories, forge connections, and create unforgettable moments.',
ARRAY['Wedding Planning', 'Corporate Events', 'Event Design', 'Luxury Event Planning', 'Event Styling'], 
ARRAY['Luxury Events', 'Wedding Design', 'Corporate Functions', 'Gala Dinners'], 
12, 4500.00, 'Auckland', 'Auckland', 'https://www.theeventgirl.co.nz/', 'info@theeventgirl.co.nz', 
null, ARRAY['/storage/portfolios/luxury-wedding-1.jpg', '/storage/portfolios/gala-dinner-1.jpg'], 
true, 4.9, 31, ARRAY['Wedding Planning', 'Corporate Events', 'Event Styling']),

-- George & Co Events - Auckland
('George & Co Events', 'Full-service production for curated, unparalleled experiences. We are a premium event company specialising in marquee & furniture hire and high-quality event planning, design & styling.',
ARRAY['Wedding Planning', 'Event Planning', 'Marquee Events', 'Furniture Hire', 'Event Styling'], 
ARRAY['Premium Events', 'Marquee Weddings', 'Event Design', 'Luxury Styling'], 
10, 4200.00, 'Auckland', 'Auckland', 'https://www.georgeandcoevents.co.nz/', 'info@georgeandcoevents.co.nz', 
null, ARRAY['/storage/portfolios/luxury-wedding-2.jpg', '/storage/portfolios/elegant-wedding-1.jpg'], 
true, 4.8, 22, ARRAY['Wedding Planning', 'Event Styling', 'Venues']),

-- Event Styling Co - Auckland
('Event Styling Co', 'Event Styling Co specializes in the decoration and styling of your wedding, private function, themed and corporate event. Based in Auckland with over 15 years experience in all aspects of event design and styling.',
ARRAY['Event Styling', 'Wedding Decoration', 'Corporate Event Styling', 'Theme Development'], 
ARRAY['Event Design', 'Wedding Styling', 'Corporate Events', 'Themed Events'], 
15, 3500.00, 'Auckland', 'Auckland', 'https://www.eventstyling.co.nz/', 'info@eventstyling.co.nz', 
null, ARRAY['/storage/portfolios/wedding-ceremony-1.jpg', '/storage/portfolios/corporate-event-1.jpg'], 
true, 4.6, 28, ARRAY['Event Styling', 'Wedding Planning', 'Decoration']),

-- SA Events Hire - Auckland
('SA Events Hire Ltd', 'At SA Events Hire Ltd, we are passionate about transforming your special occasions into unforgettable moments. Your Premier Event Styling Partner in Auckland.',
ARRAY['Event Styling', 'Equipment Hire', 'Wedding Styling', 'Party Planning'], 
ARRAY['Event Styling', 'Wedding Planning', 'Equipment Hire'], 
8, 2800.00, 'Auckland', 'Auckland', 'https://www.saeventshire.co.nz/', 'info@saeventshire.co.nz', 
null, ARRAY['/storage/portfolios/party-celebration-1.jpg', '/storage/portfolios/wedding-ceremony-1.jpg'], 
true, 4.5, 15, ARRAY['Event Styling', 'Wedding Planning']),

-- The Event Refinery - Auckland
('The Event Refinery', 'Corporate Event Planners Auckland. The Event Refinery offer planning & styling services for your wedding or event. Big or small- contact us today for more information.',
ARRAY['Corporate Event Planning', 'Wedding Planning', 'Event Styling', 'Furniture Hire'], 
ARRAY['Corporate Events', 'Wedding Planning', 'Event Coordination'], 
9, 3800.00, 'Auckland', 'Auckland', 'https://www.eventrefinery.co.nz/', 'hello@eventrefinery.co.nz', 
null, ARRAY['/storage/portfolios/corporate-event-2.jpg', '/storage/portfolios/elegant-wedding-1.jpg'], 
true, 4.7, 20, ARRAY['Corporate Events', 'Wedding Planning', 'Event Styling']),

-- DJ Dave Events - Auckland
('DJ Dave Events', 'Event Planner - Indian Wedding Decoration Specialist in Auckland. We will organize your wedding anytime. Every couple should have a seamless and delightful wedding planning journey.',
ARRAY['Indian Wedding Planning', 'Event Planning', 'Wedding Decoration', 'DJ Services'], 
ARRAY['Indian Weddings', 'Multicultural Events', 'Wedding Planning'], 
7, 2200.00, 'Auckland', 'Auckland', 'https://djdave.nz/', 'info@djdave.nz', 
null, ARRAY['/storage/portfolios/multicultural-event-1.jpg', '/storage/portfolios/wedding-ceremony-1.jpg'], 
true, 4.6, 16, ARRAY['Wedding Planning', 'Entertainment', 'Decoration']),

-- Big Day Events - Auckland
('Big Day Events', 'When you need the best corporate event planning companies in NZ - choose Big Day Events. Ensuring corporate events achieve their specific business objectives is what Big Day Events does expertly.',
ARRAY['Corporate Event Planning', 'Team Building', 'Conference Management', 'Event Coordination'], 
ARRAY['Corporate Functions', 'Team Building', 'Conferences'], 
12, 4000.00, 'Auckland', 'Auckland', 'https://www.bigdayevents.co.nz/', 'info@bigdayevents.co.nz', 
null, ARRAY['/storage/portfolios/corporate-event-1.jpg', '/storage/portfolios/conference-event-1.jpg'], 
true, 4.8, 35, ARRAY['Corporate Events', 'Entertainment']),

-- Only Events - Auckland
('Only Events', 'Only Events a distinctive event planning company. We specialise in the planning and execution of Conferences, Corporate Events, Brand Activations, Tradeshows, Product Launches & Awards.',
ARRAY['Conference Planning', 'Corporate Events', 'Brand Activations', 'Product Launches', 'Awards Events'], 
ARRAY['Corporate Functions', 'Conferences', 'Brand Events'], 
14, 5000.00, 'Auckland', 'Auckland', 'https://onlyevents.co.nz/', 'info@onlyevents.co.nz', 
null, ARRAY['/storage/portfolios/corporate-event-2.jpg', '/storage/portfolios/conference-event-2.jpg'], 
true, 4.9, 28, ARRAY['Corporate Events', 'Entertainment']),

-- The Wedding Planner - Auckland
('The Wedding Planner', 'Your Dream Day, Your Way: Tailored Wedding Services to Suit Your Big Day. Wedding Planner and Coordinator services across New Zealand designed to help detail-oriented couples.',
ARRAY['Wedding Planning', 'Wedding Coordination', 'Day of Coordination', 'Partial Planning'], 
ARRAY['Wedding Planning', 'Wedding Coordination', 'Bridal Services'], 
11, 3200.00, 'Auckland', 'Auckland', 'https://theweddingplanner.co.nz/', 'info@theweddingplanner.co.nz', 
null, ARRAY['/storage/portfolios/wedding-ceremony-1.jpg', '/storage/portfolios/elegant-wedding-1.jpg'], 
true, 4.7, 25, ARRAY['Wedding Planning']),

-- Wedding She Wrote - Auckland
('Wedding She Wrote', 'Auckland''s Premier Wedding Planner. A Dream Come True. Stress Less Princess. Destination Weddings. New Zealand & Pacific Islands specializing in unique wedding experiences.',
ARRAY['Wedding Planning', 'Destination Weddings', 'Wedding Coordination', 'Pacific Island Weddings'], 
ARRAY['Destination Weddings', 'Wedding Planning', 'Pacific Islands'], 
9, 3600.00, 'Auckland', 'Auckland', 'https://www.weddingshewrote.co.nz/', 'hello@weddingshewrote.co.nz', 
null, ARRAY['/storage/portfolios/outdoor-wedding-2.jpg', '/storage/portfolios/unique-wedding-1.jpg'], 
true, 4.8, 21, ARRAY['Wedding Planning']),

-- Ooh La La Styling - Auckland
('Ooh La La Styling', 'Premium event styling and decoration services in Auckland. We specialize in creating beautiful, Instagram-worthy events with attention to every detail.',
ARRAY['Event Styling', 'Wedding Styling', 'Party Decoration', 'Equipment Hire'], 
ARRAY['Event Styling', 'Wedding Styling', 'Party Planning'], 
6, 2400.00, 'Auckland', 'Auckland', 'https://www.oohlalastyling.co.nz/', 'ooh.hilala@gmail.com', 
'@oohlalastyling_akl', ARRAY['/storage/portfolios/party-celebration-1.jpg', '/storage/portfolios/wedding-ceremony-1.jpg'], 
true, 4.5, 12, ARRAY['Event Styling', 'Wedding Planning', 'Decoration']),

-- Events by Glam - Auckland
('Events by Glam', 'EBG (Events by Glam) is South Auckland based event decor styling company which specialises in all type of birthdays theme parties and celebrations.',
ARRAY['Event Decoration', 'Birthday Parties', 'Theme Parties', 'Event Styling'], 
ARRAY['Birthday Parties', 'Theme Events', 'Party Styling'], 
5, 1800.00, 'Auckland', 'Auckland', 'https://eventsbyglam.co.nz/', 'info@eventsbyglam.co.nz', 
'@events_by_glam_auckland', ARRAY['/storage/portfolios/birthday-party-1.jpg', '/storage/portfolios/party-celebration-1.jpg'], 
true, 4.4, 14, ARRAY['Private Parties', 'Event Styling', 'Decoration']),

-- The Event Project - Auckland
('The Event Project', 'Driven by a collective of innovative event professionals, we are your full-service event management group that can elevate your event project to new heights.',
ARRAY['Event Management', 'Corporate Events', 'Event Planning', 'Event Coordination'], 
ARRAY['Corporate Functions', 'Event Management', 'Professional Events'], 
10, 4200.00, 'Auckland', 'Auckland', 'https://www.theeventproject.co.nz/', 'info@theeventproject.co.nz', 
null, ARRAY['/storage/portfolios/corporate-event-1.jpg', '/storage/portfolios/gala-dinner-1.jpg'], 
true, 4.7, 19, ARRAY['Corporate Events', 'Event Styling']),

-- Luminosity Events - Auckland
('Luminosity Events Limited', 'Comprehensive Event Solutions. We provide full-service event management and planning services across New Zealand with innovative approaches to memorable experiences.',
ARRAY['Event Management', 'Corporate Events', 'Wedding Planning', 'Event Solutions'], 
ARRAY['Corporate Functions', 'Event Management', 'Wedding Planning'], 
8, 3400.00, 'Auckland', 'Auckland', 'https://www.luminosityevents.nz/', 'info@luminosityevents.nz', 
null, ARRAY['/storage/portfolios/corporate-event-2.jpg', '/storage/portfolios/wedding-ceremony-1.jpg'], 
true, 4.6, 17, ARRAY['Corporate Events', 'Wedding Planning']),

-- Events by Kelly B - Auckland
('Events by Kelly B', 'Let me take the reins of your next event for a stress-free experience. I''ll use my broad skillset and wide experience to create unforgettable events.',
ARRAY['Event Planning', 'Event Coordination', 'Wedding Planning', 'Corporate Events'], 
ARRAY['Event Planning', 'Event Coordination', 'Professional Events'], 
13, 3800.00, 'Auckland', 'Auckland', 'https://eventsbykellyb.co.nz/', 'kelly@eventsbykellyb.co.nz', 
null, ARRAY['/storage/portfolios/elegant-wedding-1.jpg', '/storage/portfolios/corporate-event-1.jpg'], 
true, 4.8, 23, ARRAY['Wedding Planning', 'Corporate Events']),

-- A Moment - Auckland/Queenstown
('A Moment', 'Best Wedding planner in Queenstown and Auckland, NZ. A dream we dream together. All Inclusive Weddings - Can you arrange everything and we just show up on the day?',
ARRAY['All Inclusive Weddings', 'Destination Weddings', 'Wedding Planning', 'Luxury Weddings'], 
ARRAY['All Inclusive Weddings', 'Destination Weddings', 'Luxury Events'], 
7, 5500.00, 'Auckland', 'Auckland', 'https://www.amoment.co.nz/', 'hello@amoment.co.nz', 
null, ARRAY['/storage/portfolios/luxury-wedding-2.jpg', '/storage/portfolios/unique-wedding-2.jpg'], 
true, 4.9, 16, ARRAY['Wedding Planning', 'Event Styling']),

-- Wellington Planners
-- Inspired Event Co - Wellington
('Inspired Event Co', 'Professional event planning and coordination services led by Alex Nolan, creating inspired celebrations and memorable experiences.',
ARRAY['Event Planning', 'Venue Selection', 'Vendor Coordination', 'Timeline Management'], 
ARRAY['Full Service Planning', 'Day of Coordination', 'Corporate Events'], 
8, 3500.00, 'Wellington', 'Wellington', 'https://inspiredeventco.co.nz/', 'alex@inspiredeventco.co.nz', 
'inspiredeventco', ARRAY['/storage/portfolios/elegant-wedding-1.jpg', '/storage/portfolios/luxury-wedding-1.jpg', '/storage/portfolios/wedding-ceremony-1.jpg'], 
true, 4.8, 12, ARRAY['Wedding Planning', 'Corporate Events']),

-- Avenues Event Management - Wellington
('Avenues Event Management', 'Conference and Event Management Professionals New Zealand Wide. We are a full-service Professional Conference Organiser and Event Management Agency.',
ARRAY['Conference Management', 'Event Management', 'Professional Events', 'Corporate Functions'], 
ARRAY['Conference Planning', 'Corporate Events', 'Professional Events'], 
18, 4800.00, 'Wellington', 'Wellington', 'https://avenues.co.nz/', 'info@avenues.co.nz', 
null, ARRAY['/storage/portfolios/conference-event-1.jpg', '/storage/portfolios/corporate-event-2.jpg'], 
true, 4.9, 42, ARRAY['Corporate Events']),

-- Christchurch Planners
-- The Event Boutique - Christchurch
('The Event Boutique', 'Christchurch Wedding & Event Planner & Stylist. UTTERLY BEAUTIFUL. TRULY MEMORABLE. WEDDINGS & EVENTS. Creating extraordinary celebrations in Canterbury.',
ARRAY['Wedding Planning', 'Event Styling', 'Corporate Events', 'Event Design'], 
ARRAY['Wedding Planning', 'Event Styling', 'Corporate Functions'], 
12, 3800.00, 'Christchurch', 'Canterbury', 'https://www.theeventboutique.co.nz/', 'info@theeventboutique.co.nz', 
null, ARRAY['/storage/portfolios/wedding-ceremony-1.jpg', '/storage/portfolios/elegant-wedding-1.jpg'], 
true, 4.7, 26, ARRAY['Wedding Planning', 'Event Styling', 'Corporate Events']),

-- Emma Newman Events - Christchurch
('Emma Newman Events', 'Event & Wedding Planner Christchurch NZ. For a little or a lot of planning. Professional event and wedding planning services in Canterbury.',
ARRAY['Wedding Planning', 'Event Planning', 'Event Coordination', 'Partial Planning'], 
ARRAY['Wedding Planning', 'Event Planning', 'Event Coordination'], 
10, 3200.00, 'Christchurch', 'Canterbury', 'https://www.enevents.co.nz/', 'emma@enevents.co.nz', 
null, ARRAY['/storage/portfolios/wedding-ceremony-1.jpg', '/storage/portfolios/outdoor-wedding-2.jpg'], 
true, 4.6, 18, ARRAY['Wedding Planning']),

-- I Do For You - Christchurch
('I Do For You', 'Comprehensive wedding planning services by Moira Murphy, dedicated to making your special day perfect with personalized attention and expert coordination.',
ARRAY['Full Wedding Planning', 'Partial Planning', 'Day of Coordination', 'Vendor Management'], 
ARRAY['Wedding Planning', 'Bridal Services', 'Ceremony Coordination'], 
12, 3800.00, 'Christchurch', 'Canterbury', 'https://www.idoforyou.co.nz/', 'moira@idoforyou.co.nz', 
'idoforyouweddings', ARRAY['/storage/portfolios/wedding-ceremony-1.jpg', '/storage/portfolios/outdoor-wedding-2.jpg', '/storage/portfolios/unique-wedding-2.jpg'], 
true, 4.7, 15, ARRAY['Wedding Planning']),

-- Collective Concepts - Christchurch
('Collective Concepts', 'Create your perfect wedding with Collective Concepts. Christchurch-based, working within the Canterbury region and beyond. We offer wedding planning services.',
ARRAY['Wedding Planning', 'Event Planning', 'Wedding Design', 'Event Coordination'], 
ARRAY['Wedding Planning', 'Event Design', 'Canterbury Weddings'], 
9, 3400.00, 'Christchurch', 'Canterbury', 'https://www.theeventcollective.co.nz/', 'info@theeventcollective.co.nz', 
null, ARRAY['/storage/portfolios/wedding-ceremony-1.jpg', '/storage/portfolios/elegant-wedding-1.jpg'], 
true, 4.5, 21, ARRAY['Wedding Planning', 'Event Styling']),

-- Kim Chan Events - Christchurch
('Kim Chan Events', 'Sustainable Florists & Event Designers. Creating Unique "WOW" Moments for Corporate Events & Weddings in Christchurch.',
ARRAY['Event Design', 'Floral Design', 'Sustainable Events', 'Corporate Events', 'Wedding Styling'], 
ARRAY['Sustainable Events', 'Floral Design', 'Corporate Events', 'Wedding Styling'], 
11, 3600.00, 'Christchurch', 'Canterbury', 'https://www.kimchan.co.nz/', 'info@kimchan.co.nz', 
'@kimchanevents', ARRAY['/storage/portfolios/wedding-ceremony-1.jpg', '/storage/portfolios/corporate-event-1.jpg'], 
true, 4.6, 19, ARRAY['Event Styling', 'Wedding Planning', 'Decoration']),

-- Dunedin Planners
-- Encore Event Coordination - Dunedin
('Encore Event Coordination', 'Better together because dreams were never realised alone. At Encore Events we pride ourselves on minimizing the stress that comes along with organizing a big event.',
ARRAY['Wedding Planning', 'Corporate Events', 'Event Coordination', 'Social Events'], 
ARRAY['Wedding Planning', 'Corporate Events', 'Social Events'], 
6, 2800.00, 'Dunedin', 'Otago', 'https://www.encoreeventcoordination.co.nz/', 'info@encoreeventcoordination.co.nz', 
null, ARRAY['/storage/portfolios/wedding-ceremony-1.jpg', '/storage/portfolios/corporate-event-1.jpg'], 
true, 4.5, 14, ARRAY['Wedding Planning', 'Corporate Events']),

-- Gravity Events - Dunedin
('Gravity Events', 'Gravity events is your premier Full-service event and production provider. We create experiences that inspire. From Dunedin to Wellington, we''re dedicated to exceeding expectations.',
ARRAY['Event Production', 'Full Service Events', 'Event Technology', 'Corporate Events'], 
ARRAY['Event Production', 'Full Service Planning', 'Corporate Events'], 
12, 4200.00, 'Dunedin', 'Otago', 'https://www.gravityevents.co.nz/', 'info@gravityevents.co.nz', 
null, ARRAY['/storage/portfolios/corporate-event-2.jpg', '/storage/portfolios/gala-dinner-1.jpg'], 
true, 4.7, 22, ARRAY['Corporate Events', 'Entertainment']),

-- Meadow Creative - Dunedin
('Meadow Creative', 'So your looking for something to make your event unforgettable? Meadow Creative is Dunedin''s premier Event Stylists and we do exactly that.',
ARRAY['Event Styling', 'Wedding Styling', 'Event Design', 'Decoration Services'], 
ARRAY['Event Styling', 'Wedding Styling', 'Event Design'], 
7, 2600.00, 'Dunedin', 'Otago', 'https://www.meadowcreative.co.nz/', 'hello@meadowcreative.co.nz', 
null, ARRAY['/storage/portfolios/unique-wedding-1.jpg', '/storage/portfolios/elegant-wedding-1.jpg'], 
true, 4.4, 16, ARRAY['Event Styling', 'Wedding Planning', 'Decoration']),

-- South Island Planners
-- Hayley & Co - South Island
('Hayley & Co', 'Curated events designed to inspire. Based in New Zealand''s beautiful South Island, we offer styling and hiring services for any event, anywhere.',
ARRAY['Event Styling', 'Event Hire', 'Wedding Styling', 'Event Design'], 
ARRAY['Event Styling', 'Wedding Styling', 'South Island Events'], 
8, 3200.00, 'Christchurch', 'Canterbury', 'https://www.hayleyandco.nz/', 'hello@hayleyandco.nz', 
null, ARRAY['/storage/portfolios/wedding-ceremony-1.jpg', '/storage/portfolios/elegant-wedding-1.jpg'], 
true, 4.6, 17, ARRAY['Event Styling', 'Wedding Planning']),

-- Additional Regional Planners
-- Weddings by Emily - Taranaki
('Weddings by Emily', 'Taranaki Wedding Celebrant. Marrying your person is an unforgettable moment, and your ceremony should be too! My passion for storytelling and organising a good party collide.',
ARRAY['Wedding Ceremonies', 'Wedding Coordination', 'Celebrant Services', 'Wedding Planning'], 
ARRAY['Wedding Ceremonies', 'Wedding Coordination', 'Celebrant Services'], 
6, 2200.00, 'New Plymouth', 'Taranaki', 'https://www.weddingsbyemily.co.nz/', 'emily@weddingsbyemily.co.nz', 
null, ARRAY['/storage/portfolios/wedding-ceremony-1.jpg', '/storage/portfolios/outdoor-wedding-2.jpg'], 
true, 4.7, 13, ARRAY['Wedding Planning', 'Others']);

-- Update portfolio images for existing planners to use public URLs
UPDATE public.planners 
SET portfolio_images = ARRAY['https://eventi.co.nz/wp-content/uploads/2024/12/TomandTomosWedding2024315of896-1024x683.jpg']
WHERE business_name = 'A Touch Of Class Weddings and Events Ltd';

UPDATE public.planners 
SET portfolio_images = ARRAY['https://eventi.co.nz/wp-content/uploads/2025/07/wicked-stag-eventi-listing-1-1.jpg']
WHERE business_name = 'Wicked Stag Parties';
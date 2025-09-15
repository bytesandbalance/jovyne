-- Add Lucy's Events to the planners table
INSERT INTO public.planners (
  business_name,
  description,
  location_city,
  location_state,
  services,
  specialties,
  years_experience,
  base_price,
  average_rating,
  total_reviews,
  portfolio_images,
  website_url,
  email,
  is_verified,
  category
) VALUES (
  'Lucy''s Events',
  'Our priority at Lucy''s is to guide you on your wedding journey, from initial ideas, to seeing your dream become a reality. Whether it''s one crucial piece of the puzzle or the entire process, we''re here to make your wedding day effortlessly stylish and stress free. We handle events from 5 to 500 people, any size, any style.',
  'Auckland',
  'Auckland',
  ARRAY['Wedding Planning', 'Event Coordination', 'Marquee Hire', 'Product Hire', 'Styling Services', 'Corporate Events'],
  ARRAY['Marquee Events', 'Wedding Styling', 'Corporate Functions', 'Custom Floor Plans', 'Event Coordination'],
  8,
  2500.00,
  4.8,
  24,
  ARRAY['/storage/portfolios/elegant-wedding-1.jpg', '/storage/portfolios/corporate-event-1.jpg', '/storage/portfolios/gala-dinner-1.jpg'],
  'https://lucysevents.com/',
  'hello@lucysevents.com',
  true,
  ARRAY['Weddings', 'Corporate Events', 'Private Parties']
);
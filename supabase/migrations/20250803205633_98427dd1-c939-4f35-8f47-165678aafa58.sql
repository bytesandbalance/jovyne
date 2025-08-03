-- Update all helpers with German cities and link to the only user
UPDATE public.helpers 
SET 
  availability_cities = ARRAY['Köln', 'Bonn', 'Düsseldorf'],
  user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE id IS NOT NULL;
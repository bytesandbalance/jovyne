-- Create some test data for helper functionality
-- First, let's add some test profiles
INSERT INTO public.profiles (user_id, email, full_name, user_role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'helper1@test.com', 'Sarah Johnson', 'helper'),
('550e8400-e29b-41d4-a716-446655440002', 'helper2@test.com', 'Mike Chen', 'helper'),
('550e8400-e29b-41d4-a716-446655440003', 'planner1@test.com', 'Event Pro LLC', 'planner')
ON CONFLICT (user_id) DO NOTHING;

-- Add helper profiles
INSERT INTO public.helpers (user_id, bio, skills, experience_years, hourly_rate, availability_cities, average_rating, total_jobs) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Experienced event helper with a passion for creating memorable celebrations', 
 ARRAY['Event Setup', 'Photography', 'Decoration'], 3, 25.00, ARRAY['Köln', 'Düsseldorf'], 4.8, 15),
('550e8400-e29b-41d4-a716-446655440002', 'Professional bartender and event coordinator', 
 ARRAY['Bartending', 'Cocktail Service', 'Event Service'], 5, 30.00, ARRAY['Bonn', 'Köln'], 4.9, 22)
ON CONFLICT (user_id) DO NOTHING;

-- Add planner profile
INSERT INTO public.planners (user_id, business_name, description, location_city, location_state, specialties, base_price, years_experience, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'Dream Events Co', 'Premium event planning services for all occasions', 
 'Köln', 'NRW', ARRAY['Weddings', 'Corporate Events', 'Birthday Parties'], 500.00, 8, true)
ON CONFLICT (user_id) DO NOTHING;

-- Add some helper requests
INSERT INTO public.helper_requests (planner_id, title, description, event_date, start_time, end_time, location_city, hourly_rate, total_hours, required_skills, status) VALUES
((SELECT id FROM public.planners WHERE user_id = '550e8400-e29b-41d4-a716-446655440003'), 
 'Wedding Setup Assistant Needed', 
 'Looking for experienced helper to assist with wedding ceremony and reception setup. Must be detail-oriented and professional.',
 '2025-02-15', '08:00:00', '18:00:00', 'Köln', 28.00, 10.0, ARRAY['Event Setup', 'Decoration'], 'open'),
((SELECT id FROM public.planners WHERE user_id = '550e8400-e29b-41d4-a716-446655440003'), 
 'Corporate Event Bartender', 
 'Professional bartender needed for corporate networking event. Experience with cocktail service required.',
 '2025-02-20', '17:00:00', '23:00:00', 'Düsseldorf', 35.00, 6.0, ARRAY['Bartending', 'Cocktail Service'], 'open');

-- Add a sample application 
INSERT INTO public.helper_applications (helper_id, helper_request_id, status, message, hourly_rate) VALUES
((SELECT id FROM public.helpers WHERE user_id = '550e8400-e29b-41d4-a716-446655440001'),
 (SELECT id FROM public.helper_requests WHERE title = 'Wedding Setup Assistant Needed'),
 'approved', 'I would love to help with your wedding setup! I have extensive experience with event decoration and setup.', 28.00);
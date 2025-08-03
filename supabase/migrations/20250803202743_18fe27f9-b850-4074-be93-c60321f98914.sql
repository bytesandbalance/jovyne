-- Comprehensive seed data for the event planning platform

-- Insert sample profiles (both clients and planners)
INSERT INTO public.profiles (user_id, email, full_name, user_role, phone) VALUES
-- Planners
('11111111-1111-1111-1111-111111111111', 'sarah@elegantevents.com', 'Sarah Johnson', 'planner', '+1 (555) 123-4567'),
('22222222-2222-2222-2222-222222222222', 'mike@dreamweddings.com', 'Mike Chen', 'planner', '+1 (555) 987-6543'),
('33333333-3333-3333-3333-333333333333', 'emma@corporateplus.com', 'Emma Davis', 'planner', '+1 (555) 456-7890'),
-- Clients
('44444444-4444-4444-4444-444444444444', 'john.smith@email.com', 'John Smith', 'client', '+1 (555) 234-5678'),
('55555555-5555-5555-5555-555555555555', 'lisa.williams@email.com', 'Lisa Williams', 'client', '+1 (555) 345-6789'),
('66666666-6666-6666-6666-666666666666', 'robert.brown@email.com', 'Robert Brown', 'client', '+1 (555) 567-8901'),
('77777777-7777-7777-7777-777777777777', 'maria.garcia@email.com', 'Maria Garcia', 'client', '+1 (555) 678-9012'),
('88888888-8888-8888-8888-888888888888', 'david.wilson@email.com', 'David Wilson', 'client', '+1 (555) 789-0123');

-- Insert planner profiles
INSERT INTO public.planners (id, user_id, business_name, description, years_experience, base_price, location_city, location_state, services, specialties, website_url, instagram_handle, portfolio_images, is_verified, average_rating, total_reviews) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Elegant Events by Sarah', 'Creating unforgettable moments with attention to every detail', 8, 2500.00, 'San Francisco', 'CA', ARRAY['Wedding Planning', 'Corporate Events', 'Birthday Parties'], ARRAY['Luxury Weddings', 'Outdoor Events'], 'https://elegantevents.com', '@elegantevents', ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed'], true, 4.8, 45),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Dream Weddings Co', 'Making your dream wedding come true with personalized service', 12, 3200.00, 'Los Angeles', 'CA', ARRAY['Wedding Planning', 'Engagement Parties'], ARRAY['Beach Weddings', 'Vintage Themes'], 'https://dreamweddings.com', '@dreamweddings', ARRAY['https://images.unsplash.com/photo-1606216794074-735e91aa2c92'], true, 4.9, 78),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Corporate Plus Events', 'Professional corporate event management and planning', 6, 1800.00, 'New York', 'NY', ARRAY['Corporate Events', 'Conferences', 'Product Launches'], ARRAY['Tech Events', 'Networking'], 'https://corporateplus.com', '@corporateplus', ARRAY['https://images.unsplash.com/photo-1511578314322-379afb476865'], true, 4.7, 32);

-- Insert clients data
INSERT INTO public.clients (id, planner_id, user_id, full_name, email, phone, address, notes) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'John Smith', 'john.smith@email.com', '+1 (555) 234-5678', '123 Oak Street, San Francisco, CA 94102', 'Planning a 150-guest wedding for June 2024'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'Lisa Williams', 'lisa.williams@email.com', '+1 (555) 345-6789', '456 Pine Avenue, San Francisco, CA 94103', 'Corporate holiday party for 200 employees'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', 'Robert Brown', 'robert.brown@email.com', '+1 (555) 567-8901', '789 Elm Drive, Los Angeles, CA 90210', 'Beach wedding ceremony and reception'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 'Maria Garcia', 'maria.garcia@email.com', '+1 (555) 678-9012', '321 Broadway, New York, NY 10007', 'Product launch event for tech startup'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', 'David Wilson', 'david.wilson@email.com', '+1 (555) 789-0123', '654 Market Street, San Francisco, CA 94105', '50th birthday celebration');

-- Insert events
INSERT INTO public.events (id, planner_id, client_id, title, description, event_date, event_time, guest_count, budget, venue_name, venue_address, status, notes) VALUES
('11111111-aaaa-bbbb-cccc-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Smith-Johnson Wedding', 'Elegant outdoor wedding ceremony and reception', '2024-06-15', '16:00:00', 150, 45000.00, 'Golden Gate Park Pavilion', '501 Stanyan St, San Francisco, CA 94117', 'planning', 'Outdoor ceremony with indoor reception backup plan'),
('22222222-bbbb-cccc-dddd-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'TechCorp Holiday Party', 'Annual corporate holiday celebration', '2024-12-20', '18:00:00', 200, 25000.00, 'Hotel Nikko San Francisco', '222 Mason St, San Francisco, CA 94102', 'planning', 'Corporate event with dinner and entertainment'),
('33333333-cccc-dddd-eeee-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', 'Brown Beach Wedding', 'Romantic beachside wedding ceremony', '2024-08-10', '17:30:00', 80, 35000.00, 'Malibu Beach Resort', '22878 Pacific Coast Hwy, Malibu, CA 90265', 'planning', 'Sunset ceremony on the beach'),
('44444444-dddd-eeee-ffff-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 'InnovateTech Product Launch', 'Launch event for new AI platform', '2024-05-22', '19:00:00', 300, 50000.00, 'Metropolitan Museum', '1000 5th Ave, New York, NY 10028', 'planning', 'High-profile tech product launch with media'),
('55555555-eeee-ffff-aaaa-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', 'David Wilson 50th Birthday', '50th birthday celebration party', '2024-04-18', '19:00:00', 75, 15000.00, 'Private Residence', '654 Market Street, San Francisco, CA 94105', 'completed', 'Successful surprise party celebration');

-- Insert event tasks
INSERT INTO public.event_tasks (id, event_id, title, description, priority, due_date, is_completed) VALUES
('taska111-1111-1111-1111-111111111111', '11111111-aaaa-bbbb-cccc-111111111111', 'Book photographer', 'Secure wedding photographer and videographer', 'high', '2024-04-01', false),
('taskb222-2222-2222-2222-222222222222', '11111111-aaaa-bbbb-cccc-111111111111', 'Order wedding flowers', 'Coordinate with florist for ceremony and reception arrangements', 'medium', '2024-05-15', false),
('taskc333-3333-3333-3333-333333333333', '11111111-aaaa-bbbb-cccc-111111111111', 'Finalize menu', 'Complete catering menu selection and dietary requirements', 'high', '2024-04-10', true),
('taskd444-4444-4444-4444-444444444444', '22222222-bbbb-cccc-dddd-222222222222', 'Setup AV equipment', 'Coordinate sound system and presentation setup', 'medium', '2024-12-15', false),
('taske555-5555-5555-5555-555555555555', '22222222-bbbb-cccc-dddd-222222222222', 'Hire entertainment', 'Book live band or DJ for corporate party', 'low', '2024-11-30', false),
('taskf666-6666-6666-6666-666666666666', '33333333-cccc-dddd-eeee-333333333333', 'Beach permits', 'Obtain all necessary permits for beach ceremony', 'high', '2024-07-01', false),
('taskg777-7777-7777-7777-777777777777', '44444444-dddd-eeee-ffff-444444444444', 'Media coordination', 'Coordinate with press and tech journalists', 'high', '2024-05-01', false);

-- Insert invoices
INSERT INTO public.invoices (id, planner_id, client_id, event_id, invoice_number, amount, status, due_date, issued_date, description) VALUES
('inv11111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', '11111111-aaaa-bbbb-cccc-111111111111', 'INV-202403-001', 22500.00, 'sent', '2024-04-15', '2024-03-15', 'Wedding planning services - 50% deposit'),
('inv22222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', '22222222-bbbb-cccc-dddd-222222222222', 'INV-202403-002', 12500.00, 'paid', '2024-04-01', '2024-03-01', 'Corporate event planning - deposit'),
('inv33333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', '33333333-cccc-dddd-eeee-333333333333', 'INV-202403-003', 17500.00, 'draft', '2024-04-30', '2024-03-20', 'Beach wedding planning services'),
('inv44444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', '44444444-dddd-eeee-ffff-444444444444', 'INV-202403-004', 25000.00, 'overdue', '2024-03-01', '2024-02-01', 'Product launch event planning'),
('inv55555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', '55555555-eeee-ffff-aaaa-555555555555', 'INV-202402-001', 15000.00, 'paid', '2024-03-01', '2024-02-01', '50th birthday party - full payment');

-- Insert some reviews
INSERT INTO public.reviews (id, planner_id, client_id, event_id, rating, comment) VALUES
('rev11111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', '55555555-eeee-ffff-aaaa-555555555555', 5, 'Sarah exceeded all expectations! The surprise party was absolutely perfect and David was thrilled.'),
('rev22222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', '33333333-cccc-dddd-eeee-333333333333', 5, 'Mike made our dream beach wedding come true. Every detail was perfectly planned and executed.'),
('rev33333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', '44444444-dddd-eeee-ffff-444444444444', 4, 'Professional service for our product launch. Great attention to detail and smooth execution.');
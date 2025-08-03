-- Create seed data using existing user and realistic mock data

-- Get current user_id for reference
-- Insert additional realistic clients (using existing user as reference)
INSERT INTO public.clients (planner_id, full_name, email, phone, address, notes) VALUES
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), 'John Smith', 'john.smith@email.com', '+1 (555) 234-5678', '123 Oak Street, San Francisco, CA 94102', 'Planning a 150-guest wedding for June 2024'),
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), 'Lisa Williams', 'lisa.williams@email.com', '+1 (555) 345-6789', '456 Pine Avenue, San Francisco, CA 94103', 'Corporate holiday party for 200 employees'),
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), 'Robert Brown', 'robert.brown@email.com', '+1 (555) 567-8901', '789 Elm Drive, Los Angeles, CA 90210', 'Beach wedding ceremony and reception'),
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), 'Maria Garcia', 'maria.garcia@email.com', '+1 (555) 678-9012', '321 Broadway, New York, NY 10007', 'Product launch event for tech startup'),
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), 'David Wilson', 'david.wilson@email.com', '+1 (555) 789-0123', '654 Market Street, San Francisco, CA 94105', '50th birthday celebration');

-- Insert realistic events for the planner
INSERT INTO public.events (planner_id, client_id, title, description, event_date, event_time, guest_count, budget, venue_name, venue_address, status, notes) VALUES
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8', 'Smith-Johnson Wedding', 'Elegant outdoor wedding ceremony and reception', '2024-06-15', '16:00:00', 150, 45000.00, 'Golden Gate Park Pavilion', '501 Stanyan St, San Francisco, CA 94117', 'planning', 'Outdoor ceremony with indoor reception backup plan'),
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8', 'TechCorp Holiday Party', 'Annual corporate holiday celebration', '2024-12-20', '18:00:00', 200, 25000.00, 'Hotel Nikko San Francisco', '222 Mason St, San Francisco, CA 94102', 'planning', 'Corporate event with dinner and entertainment'),
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8', 'Brown Beach Wedding', 'Romantic beachside wedding ceremony', '2024-08-10', '17:30:00', 80, 35000.00, 'Malibu Beach Resort', '22878 Pacific Coast Hwy, Malibu, CA 90265', 'planning', 'Sunset ceremony on the beach'),
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8', 'InnovateTech Product Launch', 'Launch event for new AI platform', '2024-05-22', '19:00:00', 300, 50000.00, 'Metropolitan Museum', '1000 5th Ave, New York, NY 10028', 'planning', 'High-profile tech product launch with media'),
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8', 'David Wilson 50th Birthday', '50th birthday celebration party', '2024-04-18', '19:00:00', 75, 15000.00, 'Private Residence', '654 Market Street, San Francisco, CA 94105', 'completed', 'Successful surprise party celebration');
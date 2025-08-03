-- Add tasks and invoices for the seeded events

-- Insert event tasks for the events
INSERT INTO public.event_tasks (event_id, title, description, priority, due_date, is_completed) VALUES
((SELECT id FROM events WHERE title = 'Smith-Johnson Wedding'), 'Book photographer', 'Secure wedding photographer and videographer', 'high', '2024-04-01', false),
((SELECT id FROM events WHERE title = 'Smith-Johnson Wedding'), 'Order wedding flowers', 'Coordinate with florist for ceremony and reception arrangements', 'medium', '2024-05-15', false),
((SELECT id FROM events WHERE title = 'Smith-Johnson Wedding'), 'Finalize menu', 'Complete catering menu selection and dietary requirements', 'high', '2024-04-10', true),
((SELECT id FROM events WHERE title = 'TechCorp Holiday Party'), 'Setup AV equipment', 'Coordinate sound system and presentation setup', 'medium', '2024-12-15', false),
((SELECT id FROM events WHERE title = 'TechCorp Holiday Party'), 'Hire entertainment', 'Book live band or DJ for corporate party', 'low', '2024-11-30', false),
((SELECT id FROM events WHERE title = 'Brown Beach Wedding'), 'Beach permits', 'Obtain all necessary permits for beach ceremony', 'high', '2024-07-01', false),
((SELECT id FROM events WHERE title = 'InnovateTech Product Launch'), 'Media coordination', 'Coordinate with press and tech journalists', 'high', '2024-05-01', false);

-- Insert invoices for the events
INSERT INTO public.invoices (planner_id, client_id, event_id, invoice_number, amount, status, due_date, issued_date, description) VALUES
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), (SELECT id FROM clients WHERE full_name = 'John Smith'), (SELECT id FROM events WHERE title = 'Smith-Johnson Wedding'), 'INV-202403-001', 22500.00, 'sent', '2024-04-15', '2024-03-15', 'Wedding planning services - 50% deposit'),
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), (SELECT id FROM clients WHERE full_name = 'Lisa Williams'), (SELECT id FROM events WHERE title = 'TechCorp Holiday Party'), 'INV-202403-002', 12500.00, 'paid', '2024-04-01', '2024-03-01', 'Corporate event planning - deposit'),
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), (SELECT id FROM clients WHERE full_name = 'Robert Brown'), (SELECT id FROM events WHERE title = 'Brown Beach Wedding'), 'INV-202403-003', 17500.00, 'draft', '2024-04-30', '2024-03-20', 'Beach wedding planning services'),
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), (SELECT id FROM clients WHERE full_name = 'Maria Garcia'), (SELECT id FROM events WHERE title = 'InnovateTech Product Launch'), 'INV-202403-004', 25000.00, 'overdue', '2024-03-01', '2024-02-01', 'Product launch event planning'),
((SELECT id FROM planners WHERE user_id = 'db7cde5f-003f-484f-8c8d-e2ba9e513fa8'), (SELECT id FROM clients WHERE full_name = 'David Wilson'), (SELECT id FROM events WHERE title = 'David Wilson 50th Birthday'), 'INV-202402-001', 15000.00, 'paid', '2024-03-01', '2024-02-01', '50th birthday party - full payment');
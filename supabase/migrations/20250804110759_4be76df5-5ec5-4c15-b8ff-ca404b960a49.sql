-- Create mock users and their profiles

-- Mock Helper User 1
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'sarah.helper@example.com',
    now(),
    '{"full_name": "Sarah Johnson", "user_role": "helper"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    user_role,
    phone
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'sarah.helper@example.com',
    'Sarah Johnson',
    'helper',
    '+49 123 456 7890'
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.helpers (
    user_id,
    skills,
    bio,
    experience_years,
    hourly_rate,
    availability_cities,
    average_rating,
    total_jobs
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    ARRAY['Photography', 'Event Setup', 'Guest Relations'],
    'Professional event helper with 3 years of experience in wedding and corporate events. Specializing in photography and guest coordination.',
    3,
    25.00,
    ARRAY['Berlin', 'Munich'],
    4.8,
    67
) ON CONFLICT (user_id) DO NOTHING;

-- Mock Helper User 2
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'mike.helper@example.com',
    now(),
    '{"full_name": "Mike Davis", "user_role": "helper"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    user_role,
    phone
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'mike.helper@example.com',
    'Mike Davis',
    'helper',
    '+49 987 654 3210'
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.helpers (
    user_id,
    skills,
    bio,
    experience_years,
    hourly_rate,
    availability_cities,
    average_rating,
    total_jobs
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    ARRAY['Sound/AV', 'Lighting', 'Equipment Setup'],
    'Technical specialist for events. Expert in sound systems, lighting setup, and AV equipment management.',
    5,
    30.00,
    ARRAY['Hamburg', 'Cologne'],
    4.9,
    89
) ON CONFLICT (user_id) DO NOTHING;

-- Mock Planner User
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'anna.planner@example.com',
    now(),
    '{"full_name": "Anna Schmidt", "user_role": "planner"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    user_role,
    phone
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'anna.planner@example.com',
    'Anna Schmidt',
    'planner',
    '+49 555 123 4567'
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.planners (
    user_id,
    business_name,
    description,
    services,
    specialties,
    location_city,
    location_state,
    base_price,
    years_experience,
    is_verified,
    average_rating,
    total_reviews
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'Elite Events by Anna',
    'Premium event planning service specializing in weddings and corporate events. We handle everything from intimate gatherings to large celebrations.',
    ARRAY['Wedding Planning', 'Corporate Events', 'Birthday Parties', 'Anniversary Celebrations'],
    ARRAY['Luxury Weddings', 'Destination Events', 'Corporate Retreats'],
    'Berlin',
    'Berlin',
    2500.00,
    8,
    true,
    4.7,
    124
) ON CONFLICT (user_id) DO NOTHING;

-- Mock Client User
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'tom.client@example.com',
    now(),
    '{"full_name": "Tom Mueller", "user_role": "client"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    user_role,
    phone
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'tom.client@example.com',
    'Tom Mueller',
    'client',
    '+49 777 888 9999'
) ON CONFLICT (user_id) DO NOTHING;

-- Create a client record for the planner
INSERT INTO public.clients (
    planner_id,
    user_id,
    full_name,
    email,
    phone,
    address,
    notes
) VALUES (
    (SELECT id FROM public.planners WHERE user_id = '33333333-3333-3333-3333-333333333333'),
    '44444444-4444-4444-4444-444444444444',
    'Tom Mueller',
    'tom.client@example.com',
    '+49 777 888 9999',
    'Alexanderplatz 1, 10178 Berlin',
    'Looking for wedding planning services for September 2024'
) ON CONFLICT (user_id, planner_id) DO NOTHING;

-- Create mock events
INSERT INTO public.events (
    id,
    client_id,
    planner_id,
    title,
    description,
    event_date,
    event_time,
    venue_name,
    venue_address,
    guest_count,
    budget,
    status,
    notes
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    '44444444-4444-4444-4444-444444444444',
    (SELECT id FROM public.planners WHERE user_id = '33333333-3333-3333-3333-333333333333'),
    'Tom & Lisa Wedding',
    'Elegant outdoor wedding ceremony and reception for 120 guests',
    '2024-09-15',
    '15:00:00',
    'Schloss Charlottenburg Gardens',
    'Spandauer Damm 10-22, 14059 Berlin',
    120,
    25000.00,
    'planning',
    'Couple wants outdoor ceremony with garden reception. Photography and videography required.'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (
    id,
    client_id,
    planner_id,
    title,
    description,
    event_date,
    event_time,
    venue_name,
    venue_address,
    guest_count,
    budget,
    status
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    '44444444-4444-4444-4444-444444444444',
    (SELECT id FROM public.planners WHERE user_id = '33333333-3333-3333-3333-333333333333'),
    'Corporate Annual Gala',
    'Annual company celebration with awards ceremony and dinner',
    '2024-10-20',
    '18:30:00',
    'Hotel Adlon Kempinski',
    'Unter den Linden 77, 10117 Berlin',
    200,
    40000.00,
    'confirmed'
) ON CONFLICT (id) DO NOTHING;

-- Create helper requests
INSERT INTO public.helper_requests (
    id,
    planner_id,
    event_id,
    title,
    description,
    required_skills,
    event_date,
    start_time,
    end_time,
    total_hours,
    hourly_rate,
    location_city,
    status
) VALUES (
    '77777777-7777-7777-7777-777777777777',
    (SELECT id FROM public.planners WHERE user_id = '33333333-3333-3333-3333-333333333333'),
    '55555555-5555-5555-5555-555555555555',
    'Wedding Photography Assistant',
    'Looking for an experienced photography assistant for outdoor wedding. Must be comfortable with professional camera equipment and guest interaction.',
    ARRAY['Photography', 'Guest Relations'],
    '2024-09-15',
    '13:00:00',
    '22:00:00',
    9,
    22.00,
    'Berlin',
    'open'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.helper_requests (
    id,
    planner_id,
    event_id,
    title,
    description,
    required_skills,
    event_date,
    start_time,
    end_time,
    total_hours,
    hourly_rate,
    location_city,
    status
) VALUES (
    '88888888-8888-8888-8888-888888888888',
    (SELECT id FROM public.planners WHERE user_id = '33333333-3333-3333-3333-333333333333'),
    '66666666-6666-6666-6666-666666666666',
    'AV Technician for Corporate Gala',
    'Need experienced AV technician for corporate gala. Must handle sound system, microphones, and presentation equipment.',
    ARRAY['Sound/AV', 'Equipment Setup'],
    '2024-10-20',
    '16:00:00',
    '24:00:00',
    8,
    28.00,
    'Berlin',
    'open'
) ON CONFLICT (id) DO NOTHING;

-- Create some helper applications
INSERT INTO public.helper_applications (
    id,
    helper_id,
    helper_request_id,
    message,
    hourly_rate,
    status,
    applied_at
) VALUES (
    '99999999-9999-9999-9999-999999999999',
    '11111111-1111-1111-1111-111111111111',
    '77777777-7777-7777-7777-777777777777',
    'Hi! I have 3 years of wedding photography experience and would love to assist with your event. I am very comfortable with professional equipment and great with guests.',
    23.00,
    'pending',
    now() - interval '2 days'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.helper_applications (
    id,
    helper_id,
    helper_request_id,
    message,
    hourly_rate,
    status,
    applied_at
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    '88888888-8888-8888-8888-888888888888',
    'I have 5 years of experience with AV equipment and corporate events. I can handle all sound systems and presentation tech. Available for the full event duration.',
    28.00,
    'pending',
    now() - interval '1 day'
) ON CONFLICT (id) DO NOTHING;
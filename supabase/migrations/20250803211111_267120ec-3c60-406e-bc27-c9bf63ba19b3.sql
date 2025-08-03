-- Create a new user directly in auth.users (for demo purposes)
-- Note: In production, users should sign up through the app
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
    gen_random_uuid(),
    'helper@example.com',
    now(),
    '{"full_name": "Max Helper", "user_role": "helper"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
);

-- Create profile for the new helper user
INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    user_role
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'helper@example.com'),
    'helper@example.com',
    'Max Helper',
    'helper'
);

-- Create helper profile for the new user
INSERT INTO public.helpers (
    user_id,
    skills,
    bio,
    experience_years,
    hourly_rate,
    availability_cities,
    portfolio_images,
    average_rating,
    total_jobs
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'helper@example.com'),
    ARRAY['Photography', 'Event Coordination', 'Setup/Breakdown'],
    'Enthusiastic helper specializing in event photography and coordination. Available for weddings, parties, and corporate events.',
    2,
    20.00,
    ARRAY['Köln', 'Bonn'],
    ARRAY['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4', 'https://images.unsplash.com/photo-1519741497674-611481863552'],
    4.5,
    45
);
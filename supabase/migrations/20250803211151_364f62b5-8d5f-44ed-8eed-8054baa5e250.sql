-- Update existing user to have helper role
UPDATE public.profiles 
SET user_role = 'helper'
WHERE email = 'helper@example.com';

-- If helper@example.com doesn't exist, let's create a helper user with a different email
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
) 
SELECT 
    gen_random_uuid(),
    'max.helper@example.com',
    now(),
    '{"full_name": "Max Helper", "user_role": "helper"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'max.helper@example.com');

-- Create profile for the new helper user
INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    user_role
) 
SELECT 
    (SELECT id FROM auth.users WHERE email = 'max.helper@example.com'),
    'max.helper@example.com',
    'Max Helper',
    'helper'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'max.helper@example.com');

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
) 
SELECT 
    (SELECT id FROM auth.users WHERE email = 'max.helper@example.com'),
    ARRAY['Photography', 'Event Coordination', 'Setup/Breakdown'],
    'Enthusiastic helper specializing in event photography and coordination. Available for weddings, parties, and corporate events.',
    2,
    20.00,
    ARRAY['Köln', 'Bonn'],
    ARRAY['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4', 'https://images.unsplash.com/photo-1519741497674-611481863552'],
    4.5,
    45
WHERE NOT EXISTS (SELECT 1 FROM public.helpers WHERE user_id = (SELECT id FROM auth.users WHERE email = 'max.helper@example.com'));
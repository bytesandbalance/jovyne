-- Insert seed data for helpers, helper requests, and helper applications

-- Insert helper profiles
INSERT INTO helpers (
  user_id,
  skills,
  experience_years,
  hourly_rate,
  bio,
  availability_cities,
  portfolio_images,
  average_rating,
  total_jobs
) VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-123456789001'::uuid,
    ARRAY['photography', 'video editing', 'social media']::text[],
    5,
    75.00,
    'Professional photographer and videographer specializing in wedding and event photography. I have a keen eye for capturing special moments and creating lasting memories.',
    ARRAY['New York', 'Brooklyn', 'Manhattan']::text[],
    ARRAY['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400']::text[],
    4.8,
    42
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-123456789002'::uuid,
    ARRAY['catering', 'food service', 'menu planning']::text[],
    8,
    45.00,
    'Experienced caterer with expertise in various cuisines. I love creating memorable dining experiences for special events and can handle everything from intimate gatherings to large celebrations.',
    ARRAY['Los Angeles', 'Beverly Hills', 'Santa Monica']::text[],
    ARRAY['https://images.unsplash.com/photo-1555244162-803834f70033?w=400', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400']::text[],
    4.6,
    67
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-123456789003'::uuid,
    ARRAY['floral design', 'decorating', 'styling']::text[],
    3,
    55.00,
    'Creative floral designer passionate about bringing events to life through beautiful arrangements. I specialize in wedding flowers, centerpieces, and event styling.',
    ARRAY['Chicago', 'Evanston', 'Oak Park']::text[],
    ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400']::text[],
    4.9,
    34
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-123456789004'::uuid,
    ARRAY['music', 'DJ services', 'sound equipment']::text[],
    6,
    80.00,
    'Professional DJ and music coordinator with extensive experience in weddings, corporate events, and private parties. I bring the perfect soundtrack to your special day.',
    ARRAY['Miami', 'Fort Lauderdale', 'West Palm Beach']::text[],
    ARRAY['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', 'https://images.unsplash.com/photo-1571266028243-d220ee1f5bbc?w=400']::text[],
    4.7,
    89
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-123456789005'::uuid,
    ARRAY['lighting', 'technical setup', 'event coordination']::text[],
    4,
    60.00,
    'Technical event specialist focusing on lighting design and setup. I ensure your event has the perfect ambiance with professional lighting solutions.',
    ARRAY['Austin', 'Houston', 'Dallas']::text[],
    ARRAY['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400']::text[],
    4.5,
    56
  );

-- Insert helper requests
INSERT INTO helper_requests (
  planner_id,
  event_id,
  title,
  description,
  required_skills,
  location_city,
  event_date,
  start_time,
  end_time,
  total_hours,
  hourly_rate,
  status
) VALUES
  (
    (SELECT id FROM planners LIMIT 1),
    (SELECT id FROM events LIMIT 1),
    'Wedding Photographer Needed',
    'Looking for an experienced wedding photographer for a beautiful outdoor ceremony. Must have own equipment and portfolio of previous wedding work.',
    ARRAY['photography', 'editing', 'wedding experience']::text[],
    'New York',
    '2024-06-15',
    '14:00:00',
    '22:00:00',
    8,
    75.00,
    'open'
  ),
  (
    (SELECT id FROM planners LIMIT 1),
    NULL,
    'Corporate Event Catering Assistant',
    'Need an experienced catering assistant for a corporate networking event. Will help with food service, setup, and cleanup.',
    ARRAY['catering', 'food service', 'customer service']::text[],
    'Los Angeles',
    '2024-05-20',
    '16:00:00',
    '21:00:00',
    5,
    35.00,
    'open'
  ),
  (
    (SELECT id FROM planners LIMIT 1),
    NULL,
    'Birthday Party Decorator',
    'Seeking a creative decorator for a child\'s birthday party. Theme is princess/fairy tale. Must be good with children and have decoration supplies.',
    ARRAY['decorating', 'party planning', 'children events']::text[],
    'Chicago',
    '2024-04-28',
    '10:00:00',
    '16:00:00',
    6,
    40.00,
    'open'
  ),
  (
    (SELECT id FROM planners LIMIT 1),
    NULL,
    'DJ for Anniversary Celebration',
    'Looking for a professional DJ for a 25th wedding anniversary celebration. Need someone who can play a mix of classic hits and romantic music.',
    ARRAY['DJ services', 'music', 'anniversary events']::text[],
    'Miami',
    '2024-07-10',
    '18:00:00',
    '23:00:00',
    5,
    85.00,
    'open'
  ),
  (
    (SELECT id FROM planners LIMIT 1),
    NULL,
    'Event Lighting Technician',
    'Need a lighting technician for a corporate gala. Must have experience with professional lighting equipment and creating elegant ambiance.',
    ARRAY['lighting', 'technical setup', 'corporate events']::text[],
    'Austin',
    '2024-05-30',
    '15:00:00',
    '24:00:00',
    9,
    65.00,
    'open'
  );

-- Insert helper applications
INSERT INTO helper_applications (
  helper_id,
  helper_request_id,
  message,
  hourly_rate,
  status
) VALUES
  (
    (SELECT id FROM helpers WHERE skills @> ARRAY['photography']::text[] LIMIT 1),
    (SELECT id FROM helper_requests WHERE title = 'Wedding Photographer Needed' LIMIT 1),
    'I would love to photograph your wedding! I have over 5 years of experience and a beautiful portfolio of outdoor ceremonies. My style is romantic and timeless.',
    75.00,
    'pending'
  ),
  (
    (SELECT id FROM helpers WHERE skills @> ARRAY['catering']::text[] LIMIT 1),
    (SELECT id FROM helper_requests WHERE title = 'Corporate Event Catering Assistant' LIMIT 1),
    'I have extensive experience in corporate catering and would be perfect for this role. I\'m professional, efficient, and great with client interactions.',
    35.00,
    'pending'
  ),
  (
    (SELECT id FROM helpers WHERE skills @> ARRAY['floral design']::text[] LIMIT 1),
    (SELECT id FROM helper_requests WHERE title = 'Birthday Party Decorator' LIMIT 1),
    'Princess parties are my specialty! I have all the decorations needed and love working with children. I can create a magical fairy tale atmosphere.',
    40.00,
    'accepted'
  );
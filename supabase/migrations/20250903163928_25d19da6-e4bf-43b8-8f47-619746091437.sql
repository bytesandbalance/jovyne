-- Update planners with portfolio images based on their specialties

-- Corporate/Business Event planners
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/corporate-event-1.jpg', '/storage/portfolios/corporate-event-2.jpg', '/storage/portfolios/conference-event-1.jpg', '/storage/portfolios/conference-event-2.jpg']
WHERE id IN ('6b4ec875-b008-4960-9ac9-84c98bb87b9e', 'bbcf813d-810e-479a-8bcb-d5d1429ff63b', 'a75c92af-6c94-4d1e-bfe6-6514f1a8bac5', '130360da-8bf8-449b-b70d-d03330031da6', '45ae3870-0ccb-48ba-b840-270da9d08b74', 'fbd338bc-4253-49d7-9eab-998c1df46020', 'e263b2d0-f3d2-4c2d-8149-934ad1c147ec', 'd6cce936-2ef8-45ae-b9b4-d198a1cb31e4');

-- Wedding specialists
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/luxury-wedding-1.jpg', '/storage/portfolios/luxury-wedding-2.jpg', '/storage/portfolios/wedding-ceremony-1.jpg']
WHERE id IN ('3bbbbbb6-b181-4328-bd82-2f730a516f31', 'a386fab7-c8c3-485d-93f4-15767eed24e8', '84af585d-4873-43fb-b6c3-1ef94d3ec694');

-- Multicultural wedding specialist
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/multicultural-event-1.jpg', '/storage/portfolios/multicultural-wedding-2.jpg', '/storage/portfolios/luxury-wedding-1.jpg']
WHERE id = 'b1087083-7660-4220-8a52-f51044557cc9';

-- Birthday party and celebration specialists
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/birthday-party-1.jpg', '/storage/portfolios/birthday-party-2.jpg', '/storage/portfolios/conference-event-1.jpg']
WHERE id IN ('dcd044a6-dd40-4fa7-846d-8df59d3a20b0', 'b0b1549a-b4a5-4baa-a794-2831338c59d9');

-- Music and entertainment events
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/music-event-1.jpg', '/storage/portfolios/birthday-party-1.jpg', '/storage/portfolios/corporate-event-1.jpg']
WHERE id = 'bc79f048-3523-4787-99b3-1da0bbe7f795';

-- General event planning business (mix of all types)
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/corporate-event-1.jpg', '/storage/portfolios/luxury-wedding-1.jpg', '/storage/portfolios/birthday-party-1.jpg']
WHERE id = '76ead27a-91b0-4a41-9de0-90e6d5d9ca49';
-- Update each planner with unique diverse portfolio images

-- Corporate/Business Event planners (each gets different combinations)
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/corporate-event-1.jpg', '/storage/portfolios/corporate-meeting-1.jpg', '/storage/portfolios/business-conference-1.jpg']
WHERE id = '6b4ec875-b008-4960-9ac9-84c98bb87b9e'; -- 2gether Event

UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/conference-event-1.jpg', '/storage/portfolios/gala-dinner-1.jpg', '/storage/portfolios/corporate-event-2.jpg']
WHERE id = 'bbcf813d-810e-479a-8bcb-d5d1429ff63b'; -- Adebar Event Agency

UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/business-conference-1.jpg', '/storage/portfolios/corporate-event-1.jpg', '/storage/portfolios/conference-event-2.jpg']
WHERE id = 'a75c92af-6c94-4d1e-bfe6-6514f1a8bac5'; -- B-ceed Events

UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/corporate-meeting-1.jpg', '/storage/portfolios/gala-dinner-1.jpg', '/storage/portfolios/corporate-event-2.jpg']
WHERE id = '130360da-8bf8-449b-b70d-d03330031da6'; -- Ellen Kamrad Events

-- Wedding specialists (each gets unique wedding combinations)
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/luxury-wedding-1.jpg', '/storage/portfolios/elegant-wedding-1.jpg', '/storage/portfolios/outdoor-wedding-2.jpg']
WHERE id = '3bbbbbb6-b181-4328-bd82-2f730a516f31'; -- Be Unique Event

UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/wedding-ceremony-1.jpg', '/storage/portfolios/luxury-wedding-2.jpg', '/storage/portfolios/elegant-wedding-1.jpg']
WHERE id = 'a386fab7-c8c3-485d-93f4-15767eed24e8'; -- Kim Sam - Perfect Weddings

UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/outdoor-wedding-2.jpg', '/storage/portfolios/luxury-wedding-1.jpg', '/storage/portfolios/wedding-ceremony-1.jpg']
WHERE id = '84af585d-4873-43fb-b6c3-1ef94d3ec694'; -- Limelight Weddings

-- Multicultural wedding specialist
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/multicultural-event-1.jpg', '/storage/portfolios/multicultural-wedding-2.jpg', '/storage/portfolios/elegant-wedding-1.jpg']
WHERE id = 'b1087083-7660-4220-8a52-f51044557cc9'; -- Karoma Weddings

-- Mixed event planners with diverse portfolios
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/corporate-event-1.jpg', '/storage/portfolios/luxury-wedding-2.jpg', '/storage/portfolios/gala-dinner-1.jpg']
WHERE id = '45ae3870-0ccb-48ba-b840-270da9d08b74'; -- FIESTA SERVICE

UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/luxury-wedding-1.jpg', '/storage/portfolios/corporate-meeting-1.jpg', '/storage/portfolios/conference-event-1.jpg']
WHERE id = 'fbd338bc-4253-49d7-9eab-998c1df46020'; -- Fine Weddings & Parties

UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/birthday-party-1.jpg', '/storage/portfolios/party-celebration-1.jpg', '/storage/portfolios/birthday-celebration-1.jpg']
WHERE id = 'dcd044a6-dd40-4fa7-846d-8df59d3a20b0'; -- Die Feiermacher

UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/corporate-event-2.jpg', '/storage/portfolios/business-conference-1.jpg', '/storage/portfolios/gala-dinner-1.jpg']
WHERE id = 'e263b2d0-f3d2-4c2d-8149-934ad1c147ec'; -- Kreativ Konzept Event

UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/gala-dinner-1.jpg', '/storage/portfolios/luxury-wedding-2.jpg', '/storage/portfolios/corporate-meeting-1.jpg']
WHERE id = 'd6cce936-2ef8-45ae-b9b4-d198a1cb31e4'; -- Metz Event

-- Birthday and party specialists
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/birthday-party-2.jpg', '/storage/portfolios/party-celebration-1.jpg', '/storage/portfolios/birthday-celebration-1.jpg']
WHERE id = 'b0b1549a-b4a5-4baa-a794-2831338c59d9'; -- Eventiger

-- Music and entertainment
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/music-event-1.jpg', '/storage/portfolios/party-celebration-1.jpg', '/storage/portfolios/birthday-party-2.jpg']
WHERE id = 'bc79f048-3523-4787-99b3-1da0bbe7f795'; -- Soundshine Entertainment

-- General event planning
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/conference-event-2.jpg', '/storage/portfolios/outdoor-wedding-2.jpg', '/storage/portfolios/birthday-celebration-1.jpg']
WHERE id = '76ead27a-91b0-4a41-9de0-90e6d5d9ca49'; -- Event Planning Business
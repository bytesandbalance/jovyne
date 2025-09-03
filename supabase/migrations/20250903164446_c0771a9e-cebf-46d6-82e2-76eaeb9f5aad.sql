-- Give Be Unique Event completely different portfolio photos
UPDATE planners SET portfolio_images = ARRAY['/storage/portfolios/unique-wedding-1.jpg', '/storage/portfolios/unique-wedding-2.jpg', '/storage/portfolios/unique-wedding-3.jpg']
WHERE id = '3bbbbbb6-b181-4328-bd82-2f730a516f31'; -- Be Unique Event
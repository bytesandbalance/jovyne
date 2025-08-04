-- Update existing planners to have German locations
UPDATE planners 
SET 
  location_city = CASE 
    WHEN business_name = 'Elegant Events Berlin' THEN 'Berlin'
    WHEN business_name = 'Munich Magic Moments' THEN 'Munich' 
    WHEN business_name = 'Hamburg Celebrations' THEN 'Hamburg'
    WHEN business_name = 'Cologne Event Creations' THEN 'Cologne'
    WHEN business_name = 'Frankfurt Festivities' THEN 'Frankfurt'
  END,
  location_state = 'Germany'
WHERE business_name IN ('Elegant Events Berlin', 'Munich Magic Moments', 'Hamburg Celebrations', 'Cologne Event Creations', 'Frankfurt Festivities');
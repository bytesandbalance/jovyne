-- Delete all planners except "Event Planning Business"
DELETE FROM planners 
WHERE business_name != 'Event Planning Business';
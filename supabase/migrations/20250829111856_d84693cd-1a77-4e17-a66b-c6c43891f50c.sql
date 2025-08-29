-- Remove events table and cleanup event_id references
-- Making the system request-oriented instead of event-oriented

-- Drop foreign key constraints that reference events table
ALTER TABLE IF EXISTS public.helper_invoices DROP CONSTRAINT IF EXISTS helper_invoices_event_id_fkey;
ALTER TABLE IF EXISTS public.planner_invoices DROP CONSTRAINT IF EXISTS planner_invoices_event_id_fkey;
ALTER TABLE IF EXISTS public.helper_requests DROP CONSTRAINT IF EXISTS helper_requests_event_id_fkey;
ALTER TABLE IF EXISTS public.planner_requests DROP CONSTRAINT IF EXISTS planner_requests_event_id_fkey;
ALTER TABLE IF EXISTS public.reviews DROP CONSTRAINT IF EXISTS reviews_event_id_fkey;

-- Remove event_id columns from related tables since we're going request-oriented
-- Keep the columns but remove the foreign key constraints as they may still be useful for tracking
-- Users can decide later if they want to remove these columns entirely

-- Drop the events table
DROP TABLE IF EXISTS public.events;
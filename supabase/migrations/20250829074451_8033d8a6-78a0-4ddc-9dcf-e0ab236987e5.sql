-- Create proper planner request status enum
CREATE TYPE planner_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Update planner_requests table to use the correct enum
ALTER TABLE planner_requests 
ALTER COLUMN status TYPE planner_request_status 
USING status::text::planner_request_status;
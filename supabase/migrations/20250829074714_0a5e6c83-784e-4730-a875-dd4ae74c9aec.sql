-- Drop the existing enum if it exists
DROP TYPE IF EXISTS planner_request_status;

-- First drop the default constraint
ALTER TABLE planner_requests ALTER COLUMN status DROP DEFAULT;

-- Create proper planner request status enum  
CREATE TYPE planner_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Update planner_requests table to use the correct enum
ALTER TABLE planner_requests 
ALTER COLUMN status TYPE planner_request_status 
USING CASE 
  WHEN status::text = 'open' THEN 'pending'::planner_request_status
  WHEN status::text = 'filled' THEN 'approved'::planner_request_status
  WHEN status::text = 'cancelled' THEN 'rejected'::planner_request_status
  ELSE 'pending'::planner_request_status
END;

-- Set new default
ALTER TABLE planner_requests ALTER COLUMN status SET DEFAULT 'pending';
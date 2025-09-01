-- Add helper_id field to helper_requests table to support direct planner-to-helper requests
ALTER TABLE helper_requests ADD COLUMN helper_id uuid REFERENCES helpers(id);

-- Add index for better query performance
CREATE INDEX idx_helper_requests_helper_id ON helper_requests(helper_id);

-- Update RLS policies to allow helpers to see requests sent to them
DROP POLICY "Helpers and requesters can view helper requests" ON helper_requests;

CREATE POLICY "Helpers and requesters can view helper requests" 
ON helper_requests 
FOR SELECT 
USING (
  -- Helpers can see open requests (for general discovery) OR requests sent specifically to them
  (status = 'open'::helper_request_status AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() AND p.user_role = 'helper'::user_role
  )) OR
  -- Or helpers can see requests sent directly to them
  (helper_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM helpers h 
    WHERE h.id = helper_requests.helper_id AND h.user_id = auth.uid()
  )) OR
  -- Requesters (planners/clients) can see their own requests
  (auth.uid() = (SELECT p.user_id FROM planners p WHERE p.id = helper_requests.planner_id)) OR
  (auth.uid() = (SELECT c.user_id FROM clients c WHERE c.id = helper_requests.client_id))
);
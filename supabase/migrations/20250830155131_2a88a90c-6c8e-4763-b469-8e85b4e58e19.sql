-- Step 1: Clean up duplicate clients (keep the oldest record for each user_id)
WITH ranked_clients AS (
  SELECT id, user_id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as rn
  FROM clients
),
clients_to_delete AS (
  SELECT id FROM ranked_clients WHERE rn > 1
)
DELETE FROM clients WHERE id IN (SELECT id FROM clients_to_delete);

-- Step 2: Create a unique constraint to prevent future duplicates
ALTER TABLE clients ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- Step 3: Update existing approved planner requests to link clients to planners
WITH approved_requests AS (
  SELECT DISTINCT pr.client_id, pr.planner_id
  FROM planner_requests pr
  WHERE pr.status = 'approved' AND pr.planner_id IS NOT NULL
)
UPDATE clients 
SET planner_id = ar.planner_id
FROM approved_requests ar
WHERE clients.id = ar.client_id AND clients.planner_id IS NULL;

-- Step 4: Create or update function to handle future planner request approvals
CREATE OR REPLACE FUNCTION public.handle_planner_request_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When a planner request is approved, link the client to the planner
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.planner_id IS NOT NULL THEN
    UPDATE clients 
    SET planner_id = NEW.planner_id 
    WHERE id = NEW.client_id AND planner_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger for planner request approvals
DROP TRIGGER IF EXISTS on_planner_request_approved ON planner_requests;
CREATE TRIGGER on_planner_request_approved
  AFTER UPDATE ON planner_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_planner_request_approval();
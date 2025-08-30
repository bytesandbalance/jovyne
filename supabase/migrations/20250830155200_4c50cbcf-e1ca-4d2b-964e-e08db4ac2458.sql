-- Step 1: Update foreign key references to point to the oldest client record for each user_id
WITH ranked_clients AS (
  SELECT id, user_id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as rn
  FROM clients
),
client_mapping AS (
  SELECT 
    old_client.id as old_id,
    new_client.id as new_id
  FROM ranked_clients old_client
  JOIN ranked_clients new_client ON old_client.user_id = new_client.user_id 
  WHERE old_client.rn > 1 AND new_client.rn = 1
)
UPDATE planner_requests 
SET client_id = cm.new_id
FROM client_mapping cm
WHERE planner_requests.client_id = cm.old_id;

-- Step 2: Update helper_requests foreign keys if any exist
WITH ranked_clients AS (
  SELECT id, user_id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as rn
  FROM clients
),
client_mapping AS (
  SELECT 
    old_client.id as old_id,
    new_client.id as new_id
  FROM ranked_clients old_client
  JOIN ranked_clients new_client ON old_client.user_id = new_client.user_id 
  WHERE old_client.rn > 1 AND new_client.rn = 1
)
UPDATE helper_requests 
SET client_id = cm.new_id
FROM client_mapping cm
WHERE helper_requests.client_id = cm.old_id;

-- Step 3: Update any other foreign key references (invoices, etc)
WITH ranked_clients AS (
  SELECT id, user_id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as rn
  FROM clients
),
client_mapping AS (
  SELECT 
    old_client.id as old_id,
    new_client.id as new_id
  FROM ranked_clients old_client
  JOIN ranked_clients new_client ON old_client.user_id = new_client.user_id 
  WHERE old_client.rn > 1 AND new_client.rn = 1
)
UPDATE helper_invoices 
SET client_id = cm.new_id
FROM client_mapping cm
WHERE helper_invoices.client_id = cm.old_id;

-- Step 4: Update planner_invoices
WITH ranked_clients AS (
  SELECT id, user_id, 
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as rn
  FROM clients
),
client_mapping AS (
  SELECT 
    old_client.id as old_id,
    new_client.id as new_id
  FROM ranked_clients old_client
  JOIN ranked_clients new_client ON old_client.user_id = new_client.user_id 
  WHERE old_client.rn > 1 AND new_client.rn = 1
)
UPDATE planner_invoices 
SET client_id = cm.new_id
FROM client_mapping cm
WHERE planner_invoices.client_id = cm.old_id;
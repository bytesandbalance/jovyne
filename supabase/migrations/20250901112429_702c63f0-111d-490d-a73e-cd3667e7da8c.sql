-- Add new status values to helper_request_status enum for direct planner-to-helper requests
ALTER TYPE helper_request_status ADD VALUE 'pending';
ALTER TYPE helper_request_status ADD VALUE 'approved';  
ALTER TYPE helper_request_status ADD VALUE 'declined';
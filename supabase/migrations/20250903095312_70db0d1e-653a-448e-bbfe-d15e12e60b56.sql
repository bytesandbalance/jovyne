-- Let's manually create an invoice for the existing approved request to test
-- This will help us verify the system works for future approvals

DO $$
DECLARE
  request_record RECORD;
  client_user_id uuid;
  planner_user_id uuid;
  client_profile RECORD;
  planner_profile RECORD;
  fee NUMERIC;
  new_event_id UUID;
BEGIN
  -- Get the approved request
  SELECT * INTO request_record FROM public.planner_requests WHERE status = 'approved' LIMIT 1;
  
  IF request_record.id IS NOT NULL THEN
    -- Get client and planner user IDs
    SELECT c.user_id INTO client_user_id FROM public.clients c WHERE c.id = request_record.client_id;
    SELECT p.user_id INTO planner_user_id FROM public.planners p WHERE p.id = request_record.planner_id;
    
    -- Get profile information for invoice
    SELECT pr.full_name, pr.email, pr.phone INTO client_profile 
    FROM public.profiles pr WHERE pr.user_id = client_user_id;
    
    SELECT pr.full_name INTO planner_profile 
    FROM public.profiles pr WHERE pr.user_id = planner_user_id;

    fee := COALESCE(request_record.budget, 0);

    -- Create the invoice
    INSERT INTO public.planner_invoices (
      client_id,
      planner_id,
      planner_request_id,
      event_id,
      job_title,
      client_name,
      client_contact_email,
      client_contact_phone,
      planner_name,
      event_date,
      proposed_fee,
      total_hours,
      amount,
      status
    )
    VALUES (
      request_record.client_id,
      request_record.planner_id,
      request_record.id,
      request_record.event_id,
      request_record.title,
      client_profile.full_name,
      client_profile.email,
      client_profile.phone,
      planner_profile.full_name,
      request_record.event_date,
      fee,
      request_record.total_hours,
      fee,
      'draft'
    );
    
    RAISE NOTICE 'Invoice created successfully for request: %', request_record.title;
  ELSE
    RAISE NOTICE 'No approved requests found';
  END IF;
END $$;
-- Fix the planner invoice transitions function to allow INSERT operations
CREATE OR REPLACE FUNCTION public.enforce_planner_invoice_transitions()
RETURNS TRIGGER AS $$
DECLARE
  old_status TEXT := (CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.status::text, 'draft') ELSE NULL END);
  new_status TEXT := NEW.status::text;
  client_user_id uuid;
  planner_user_id uuid;
  dup_msg BOOLEAN := FALSE;
BEGIN
  -- Allow INSERT operations with any initial status
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  -- Lock any edits after completed
  IF (OLD.status = 'completed'::public.helper_invoice_status) THEN
    RAISE EXCEPTION 'Invoice is completed and cannot be modified';
  END IF;

  -- Resolve auth user ids
  SELECT c.user_id INTO client_user_id FROM public.clients c WHERE c.id = COALESCE(NEW.client_id, OLD.client_id);
  SELECT p.user_id INTO planner_user_id FROM public.planners p WHERE p.id = COALESCE(NEW.planner_id, OLD.planner_id);

  -- Allowed transitions + notifications
  IF old_status = 'draft' AND (new_status = 'sent_to_planner' OR new_status = 'awaiting_payment') THEN
    NEW.sent_at := COALESCE(NEW.sent_at, now());
    NEW.status := 'awaiting_payment';

    -- Notify client that an invoice was sent (dedupe within 2 minutes)
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = planner_user_id
        AND m.recipient_id = client_user_id
        AND m.subject = 'Invoice Received'
        AND m.created_at > now() - interval '2 minutes'
    ) INTO dup_msg;

    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        planner_user_id,
        client_user_id,
        'Invoice Received',
        'You have received an invoice from ' || COALESCE(NEW.planner_name,'a planner') ||
        ' for ' || COALESCE(NEW.job_title,'a job') ||
        '. Amount: ' || COALESCE(NEW.amount, 0)::text || '. Please review and mark as paid.'
      );
    END IF;

  ELSIF old_status = 'awaiting_payment' AND new_status = 'paid_planner' THEN
    NEW.paid_at := COALESCE(NEW.paid_at, now());

    -- Notify planner that client marked as paid (dedupe within 2 minutes)
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = client_user_id
        AND m.recipient_id = planner_user_id
        AND m.subject = 'Invoice Marked as Paid'
        AND m.created_at > now() - interval '2 minutes'
    ) INTO dup_msg;

    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        client_user_id,
        planner_user_id,
        'Invoice Marked as Paid',
        'Your invoice for ' || COALESCE(NEW.job_title,'the job') || ' was marked as paid. Please confirm receipt to complete.'
      );
    END IF;

  ELSIF old_status = 'paid_planner' AND new_status = 'completed' THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());

    -- Notify client that planner confirmed receipt (dedupe within 2 minutes)
    SELECT EXISTS(
      SELECT 1 FROM public.messages m
      WHERE m.sender_id = planner_user_id
        AND m.recipient_id = client_user_id
        AND m.subject = 'Invoice Completed'
        AND m.created_at > now() - interval '2 minutes'
    ) INTO dup_msg;

    IF NOT dup_msg THEN
      INSERT INTO public.messages (sender_id, recipient_id, subject, message)
      VALUES (
        planner_user_id,
        client_user_id,
        'Invoice Completed',
        'The planner has confirmed receipt for ' || COALESCE(NEW.job_title,'the job') || '. This invoice is now completed.'
      );
    END IF;
  ELSE
    -- Allow idempotent updates with same status (metadata edits)
    IF old_status = new_status THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Invalid status transition from % to %', old_status, new_status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Now create the missing invoice for the "Kids Birthday" request
INSERT INTO public.planner_invoices (
  client_id,
  planner_id,
  planner_application_id,
  planner_request_id,
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
SELECT 
  pr.client_id,
  pa.planner_id,
  pa.id,
  pr.id,
  pr.title,
  c_profile.full_name,
  c_profile.email,
  c_profile.phone,
  p_profile.full_name,
  pr.event_date,
  pa.proposed_fee,
  pr.total_hours,
  pa.proposed_fee,
  'draft'
FROM public.planner_applications pa
JOIN public.planner_requests pr ON pr.id = pa.planner_request_id
JOIN public.clients c ON c.id = pr.client_id
JOIN public.profiles c_profile ON c_profile.user_id = c.user_id
JOIN public.planners p ON p.id = pa.planner_id
JOIN public.profiles p_profile ON p_profile.user_id = p.user_id
WHERE pa.id = '2b848230-3f05-4ded-9526-a5fbf4a1501d'
  AND pa.status = 'approved';
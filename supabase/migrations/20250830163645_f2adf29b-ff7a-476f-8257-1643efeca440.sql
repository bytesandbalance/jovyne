-- Create the missing planner_applications table
CREATE TABLE public.planner_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planner_request_id UUID NOT NULL REFERENCES public.planner_requests(id),
  planner_id UUID NOT NULL REFERENCES public.planners(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proposed_fee NUMERIC,
  cover_letter TEXT,
  estimated_hours NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(planner_request_id, planner_id) -- Prevent duplicate applications
);

-- Enable RLS
ALTER TABLE public.planner_applications ENABLE ROW LEVEL SECURITY;

-- Policies for planner applications
CREATE POLICY "Anyone can view planner applications" 
ON public.planner_applications 
FOR SELECT 
USING (true);

CREATE POLICY "Planners can create their own applications" 
ON public.planner_applications 
FOR INSERT 
WITH CHECK (
  planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
);

CREATE POLICY "Planners can update their own applications" 
ON public.planner_applications 
FOR UPDATE 
USING (
  planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
);

CREATE POLICY "Clients can update application status for their requests" 
ON public.planner_applications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.planner_requests pr
    JOIN public.clients c ON c.id = pr.client_id
    WHERE pr.id = planner_applications.planner_request_id 
    AND c.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_planner_applications_updated_at
  BEFORE UPDATE ON public.planner_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Now create the fixed invoice creation function
CREATE OR REPLACE FUNCTION public.create_planner_invoice_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  pr RECORD;
  client_user_id UUID;
  planner_user_id UUID;
  client_profile RECORD;
  planner_profile RECORD;
  fee NUMERIC;
  already_has_invoice BOOLEAN := FALSE;
  dup_msg BOOLEAN := FALSE;
  new_event_id UUID;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Load related request
    SELECT * INTO pr FROM public.planner_requests WHERE id = NEW.planner_request_id;

    -- Determine client and planner auth user ids
    IF pr IS NOT NULL THEN
      SELECT c.user_id INTO client_user_id FROM public.clients c WHERE c.id = pr.client_id;
    END IF;
    SELECT p.user_id INTO planner_user_id FROM public.planners p WHERE p.id = NEW.planner_id;

    -- Fallbacks to avoid NULLs and satisfy messages RLS (sender must be auth.uid())
    client_user_id := COALESCE(client_user_id, auth.uid());
    planner_user_id := COALESCE(planner_user_id, (SELECT p.user_id FROM public.planners p WHERE p.id = NEW.planner_id));

    -- Handle approval/acceptance: create downstream records
    IF NEW.status::text IN ('approved','accepted') THEN
      IF pr IS NULL THEN
        RETURN NEW;
      END IF;

      -- Link client to planner (update client record)
      UPDATE public.clients 
      SET planner_id = NEW.planner_id
      WHERE id = pr.client_id;

      -- Create event record
      INSERT INTO public.events (
        title,
        description,
        event_date,
        event_time,
        venue_name,
        venue_address,
        guest_count,
        budget,
        client_id,
        planner_id,
        status
      ) VALUES (
        pr.title,
        pr.description,
        pr.event_date,
        pr.start_time,
        NULL, -- venue_name to be filled later
        NULL, -- venue_address to be filled later
        NULL, -- guest_count to be filled later
        pr.budget,
        client_user_id,
        NEW.planner_id,
        'planning'
      ) RETURNING id INTO new_event_id;

      -- Update planner request with event reference
      UPDATE public.planner_requests 
      SET event_id = new_event_id
      WHERE id = NEW.planner_request_id;

      -- Idempotency: only create one invoice per application
      SELECT EXISTS (
        SELECT 1 FROM public.planner_invoices pi WHERE pi.planner_application_id = NEW.id
      ) INTO already_has_invoice;

      IF NOT already_has_invoice THEN
        SELECT pr.full_name, pr.email, pr.phone INTO client_profile FROM public.profiles pr WHERE pr.user_id = client_user_id;
        SELECT pr.full_name INTO planner_profile FROM public.profiles pr WHERE pr.user_id = planner_user_id;

        fee := COALESCE(NEW.proposed_fee, pr.budget, 0);

        INSERT INTO public.planner_invoices (
          client_id,
          planner_id,
          planner_application_id,
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
          pr.client_id,
          NEW.planner_id,
          NEW.id,
          pr.id,
          new_event_id,
          pr.title,
          client_profile.full_name,
          client_profile.email,
          client_profile.phone,
          planner_profile.full_name,
          pr.event_date,
          fee,
          pr.total_hours,
          fee,
          'draft'
        );
      END IF;

      -- Notify planner of approval and invoice creation (dedupe within 2 minutes)
      IF client_user_id IS NOT NULL AND planner_user_id IS NOT NULL THEN
        SELECT EXISTS(
          SELECT 1 FROM public.messages m
          WHERE m.sender_id = client_user_id
            AND m.recipient_id = planner_user_id
            AND m.subject = 'Application Approved'
            AND m.created_at > now() - interval '2 minutes'
        ) INTO dup_msg;

        IF NOT dup_msg THEN
          INSERT INTO public.messages (sender_id, recipient_id, subject, message)
          VALUES (
            client_user_id,
            planner_user_id,
            'Application Approved',
            'Your application for ' || COALESCE(pr.title,'the event') || ' has been approved! An event has been created and an invoice form is ready in your dashboard. Please review, complete, and send it to the client.'
          );
        END IF;
      END IF;

    ELSIF NEW.status::text = 'rejected' THEN
      -- Notify planner of rejection (dedupe within 2 minutes)
      IF client_user_id IS NOT NULL AND planner_user_id IS NOT NULL THEN
        SELECT EXISTS(
          SELECT 1 FROM public.messages m
          WHERE m.sender_id = client_user_id
            AND m.recipient_id = planner_user_id
            AND m.subject = 'Application Rejected'
            AND m.created_at > now() - interval '2 minutes'
        ) INTO dup_msg;

        IF NOT dup_msg THEN
          INSERT INTO public.messages (sender_id, recipient_id, subject, message)
          VALUES (
            client_user_id,
            planner_user_id,
            'Application Rejected',
            'Your application for ' || COALESCE(pr.title,'the event') || ' was not approved. Thank you for applying.'
          );
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create function to handle invoice status transitions and notifications
CREATE OR REPLACE FUNCTION public.enforce_planner_invoice_transitions()
RETURNS TRIGGER AS $$
DECLARE
  old_status TEXT := (CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.status::text, 'draft') ELSE NULL END);
  new_status TEXT := NEW.status::text;
  client_user_id uuid;
  planner_user_id uuid;
  dup_msg BOOLEAN := FALSE;
BEGIN
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

-- Create triggers
DROP TRIGGER IF EXISTS on_planner_application_approved ON public.planner_applications;
CREATE TRIGGER on_planner_application_approved
  AFTER UPDATE ON public.planner_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_planner_invoice_on_approval();

DROP TRIGGER IF EXISTS on_planner_invoice_status_change ON public.planner_invoices;
CREATE TRIGGER on_planner_invoice_status_change
  BEFORE INSERT OR UPDATE ON public.planner_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_planner_invoice_transitions();
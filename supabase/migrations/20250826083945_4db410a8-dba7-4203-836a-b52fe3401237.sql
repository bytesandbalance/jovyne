-- Extend helper_requests to support client requests
ALTER TABLE public.helper_requests ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Add check constraint to ensure either planner_id or client_id is provided
ALTER TABLE public.helper_requests ADD CONSTRAINT helper_requests_requester_check 
CHECK ((planner_id IS NOT NULL AND client_id IS NULL) OR (planner_id IS NULL AND client_id IS NOT NULL));

-- Extend helper_invoices to support client invoices
ALTER TABLE public.helper_invoices ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Add check constraint to ensure either planner_id or client_id is provided  
ALTER TABLE public.helper_invoices ADD CONSTRAINT helper_invoices_requester_check
CHECK ((planner_id IS NOT NULL AND client_id IS NULL) OR (planner_id IS NULL AND client_id IS NOT NULL));

-- Update RLS policies for helper_requests to include clients
DROP POLICY IF EXISTS "Helpers and owner can view helper requests" ON public.helper_requests;
CREATE POLICY "Helpers and requesters can view helper requests" ON public.helper_requests
FOR SELECT 
USING (
  (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.user_role = 'helper'::user_role))
  OR 
  (auth.uid() = (SELECT p.user_id FROM planners p WHERE p.id = helper_requests.planner_id))
  OR
  (auth.uid() = (SELECT c.user_id FROM clients c WHERE c.id = helper_requests.client_id))
);

DROP POLICY IF EXISTS "Planners can manage their helper requests" ON public.helper_requests;
CREATE POLICY "Requesters can manage their helper requests" ON public.helper_requests
FOR ALL
USING (
  (auth.uid() = (SELECT p.user_id FROM planners p WHERE p.id = helper_requests.planner_id))
  OR
  (auth.uid() = (SELECT c.user_id FROM clients c WHERE c.id = helper_requests.client_id))
);

-- Update RLS policies for helper_applications to work with client requests
DROP POLICY IF EXISTS "Planners can view applications for their requests" ON public.helper_applications;
CREATE POLICY "Requesters can view applications for their requests" ON public.helper_applications
FOR SELECT
USING (
  auth.uid() = (
    SELECT COALESCE(p.user_id, c.user_id)
    FROM helper_requests hr
    LEFT JOIN planners p ON p.id = hr.planner_id  
    LEFT JOIN clients c ON c.id = hr.client_id
    WHERE hr.id = helper_applications.helper_request_id
  )
);

DROP POLICY IF EXISTS "Planners can update application status" ON public.helper_applications;
CREATE POLICY "Requesters can update application status" ON public.helper_applications
FOR UPDATE
USING (
  auth.uid() = (
    SELECT COALESCE(p.user_id, c.user_id)
    FROM helper_requests hr
    LEFT JOIN planners p ON p.id = hr.planner_id
    LEFT JOIN clients c ON c.id = hr.client_id  
    WHERE hr.id = helper_applications.helper_request_id
  )
)
WITH CHECK (
  auth.uid() = (
    SELECT COALESCE(p.user_id, c.user_id)
    FROM helper_requests hr
    LEFT JOIN planners p ON p.id = hr.planner_id
    LEFT JOIN clients c ON c.id = hr.client_id
    WHERE hr.id = helper_applications.helper_request_id
  )
);

-- Update RLS policies for helper_invoices to include clients
DROP POLICY IF EXISTS "Planners can view their helper invoices" ON public.helper_invoices;
CREATE POLICY "Requesters can view their helper invoices" ON public.helper_invoices
FOR SELECT
USING (
  (planner_id = (SELECT p.id FROM planners p WHERE p.user_id = auth.uid()))
  OR
  (client_id = (SELECT c.id FROM clients c WHERE c.user_id = auth.uid()))
);

DROP POLICY IF EXISTS "Planners can update their helper invoices" ON public.helper_invoices;
CREATE POLICY "Requesters can update their helper invoices" ON public.helper_invoices
FOR UPDATE
USING (
  (planner_id = (SELECT p.id FROM planners p WHERE p.user_id = auth.uid()))
  OR  
  (client_id = (SELECT c.id FROM clients c WHERE c.user_id = auth.uid()))
);

-- Create planner_requests table for Client → Planner workflow
CREATE TABLE public.planner_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  event_id UUID REFERENCES public.events(id),
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  budget NUMERIC,
  total_hours NUMERIC,
  status helper_request_status DEFAULT 'open'::helper_request_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_services TEXT[] DEFAULT '{}',
  location_city TEXT NOT NULL
);

-- Enable RLS on planner_requests
ALTER TABLE public.planner_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for planner_requests
CREATE POLICY "Planners and clients can view planner requests" ON public.planner_requests
FOR SELECT
USING (
  (EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.user_role = 'planner'::user_role))
  OR
  (auth.uid() = (SELECT c.user_id FROM clients c WHERE c.id = planner_requests.client_id))
);

CREATE POLICY "Clients can manage their planner requests" ON public.planner_requests
FOR ALL
USING (auth.uid() = (SELECT c.user_id FROM clients c WHERE c.id = planner_requests.client_id));

-- Create planner_applications table
CREATE TABLE public.planner_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planner_request_id UUID NOT NULL REFERENCES public.planner_requests(id),
  planner_id UUID NOT NULL REFERENCES public.planners(id),
  proposed_fee NUMERIC,
  status application_status DEFAULT 'pending'::application_status,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message TEXT
);

-- Enable RLS on planner_applications  
ALTER TABLE public.planner_applications ENABLE ROW LEVEL SECURITY;

-- RLS policies for planner_applications
CREATE POLICY "Planners can view their applications" ON public.planner_applications
FOR SELECT
USING (planner_id = (SELECT p.id FROM planners p WHERE p.user_id = auth.uid()));

CREATE POLICY "Planners can create applications" ON public.planner_applications
FOR INSERT
WITH CHECK (planner_id = (SELECT p.id FROM planners p WHERE p.user_id = auth.uid()));

CREATE POLICY "Planners can update their pending applications" ON public.planner_applications
FOR UPDATE
USING (
  (planner_id = (SELECT p.id FROM planners p WHERE p.user_id = auth.uid()))
  AND (status = 'pending'::application_status)
)
WITH CHECK (
  (planner_id = (SELECT p.id FROM planners p WHERE p.user_id = auth.uid()))
  AND (status = 'pending'::application_status)
);

CREATE POLICY "Clients can view applications for their requests" ON public.planner_applications
FOR SELECT
USING (
  auth.uid() = (
    SELECT c.user_id
    FROM clients c
    JOIN planner_requests pr ON pr.client_id = c.id
    WHERE pr.id = planner_applications.planner_request_id
  )
);

CREATE POLICY "Clients can update application status" ON public.planner_applications
FOR UPDATE
USING (
  auth.uid() = (
    SELECT c.user_id
    FROM clients c
    JOIN planner_requests pr ON pr.client_id = c.id
    WHERE pr.id = planner_applications.planner_request_id
  )
)
WITH CHECK (
  auth.uid() = (
    SELECT c.user_id
    FROM clients c
    JOIN planner_requests pr ON pr.client_id = c.id
    WHERE pr.id = planner_applications.planner_request_id
  )
);

-- Create planner_invoices table
CREATE TABLE public.planner_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  planner_id UUID NOT NULL REFERENCES public.planners(id),
  planner_application_id UUID REFERENCES public.planner_applications(id),
  planner_request_id UUID REFERENCES public.planner_requests(id),
  event_id UUID REFERENCES public.events(id),
  job_title TEXT NOT NULL,
  client_name TEXT,
  client_contact_email TEXT,
  client_contact_phone TEXT,
  planner_name TEXT,
  event_date DATE,
  proposed_fee NUMERIC,
  total_hours NUMERIC,
  amount NUMERIC,
  status helper_invoice_status NOT NULL DEFAULT 'draft'::helper_invoice_status,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on planner_invoices
ALTER TABLE public.planner_invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies for planner_invoices
CREATE POLICY "Planners can view their planner invoices" ON public.planner_invoices
FOR SELECT
USING (planner_id = (SELECT p.id FROM planners p WHERE p.user_id = auth.uid()));

CREATE POLICY "Planners can update their planner invoices" ON public.planner_invoices
FOR UPDATE
USING (planner_id = (SELECT p.id FROM planners p WHERE p.user_id = auth.uid()));

CREATE POLICY "Clients can view their planner invoices" ON public.planner_invoices
FOR SELECT
USING (client_id = (SELECT c.id FROM clients c WHERE c.user_id = auth.uid()));

CREATE POLICY "Clients can update their planner invoices" ON public.planner_invoices
FOR UPDATE
USING (client_id = (SELECT c.id FROM clients c WHERE c.user_id = auth.uid()));

-- Add triggers for updated_at columns
CREATE TRIGGER update_planner_requests_updated_at
  BEFORE UPDATE ON public.planner_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planner_applications_updated_at
  BEFORE UPDATE ON public.planner_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planner_invoices_updated_at
  BEFORE UPDATE ON public.planner_invoices
  FOR EACH ROW  
  EXECUTE FUNCTION public.update_updated_at_column();
-- Create the missing events table that our invoice function needs
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TIME,
  venue_name TEXT,
  venue_address TEXT,
  guest_count INTEGER,
  budget NUMERIC,
  client_id UUID REFERENCES public.clients(id),
  planner_id UUID REFERENCES public.planners(id),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Users can view their own events"
ON public.events
FOR SELECT
USING (
  client_id = (SELECT c.id FROM public.clients c WHERE c.user_id = auth.uid()) OR
  planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
);

CREATE POLICY "Clients and planners can manage their events"
ON public.events
FOR ALL
USING (
  client_id = (SELECT c.id FROM public.clients c WHERE c.user_id = auth.uid()) OR
  planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
);

-- Add trigger for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Now manually create the missing invoice for the approved "Kids Birthday" request
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
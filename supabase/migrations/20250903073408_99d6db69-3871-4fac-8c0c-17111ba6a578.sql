-- Create events table
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time time without time zone,
  venue_name text,
  venue_address text,
  guest_count integer,
  budget numeric,
  client_id uuid NOT NULL,
  planner_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'planning',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "Clients can view their own events" 
ON public.events 
FOR SELECT 
USING (client_id = auth.uid());

CREATE POLICY "Planners can view their assigned events" 
ON public.events 
FOR SELECT 
USING (planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid()));

CREATE POLICY "Planners can update their assigned events" 
ON public.events 
FOR UPDATE 
USING (planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid()));

CREATE POLICY "System can create events on approval"
ON public.events
FOR INSERT
WITH CHECK (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
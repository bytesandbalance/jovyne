-- Create communication requests table
CREATE TABLE public.communication_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'planner')),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('helper', 'planner')),
  
  -- Request details (same as helper_requests structure)
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location_city TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  total_hours NUMERIC,
  hourly_rate NUMERIC,
  
  -- Communication details
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  
  -- Response from recipient
  response_message TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communication_requests ENABLE ROW LEVEL SECURITY;

-- Policies for communication requests
CREATE POLICY "Users can send requests" 
ON public.communication_requests 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Senders can view their sent requests" 
ON public.communication_requests 
FOR SELECT 
USING (auth.uid() = sender_id);

CREATE POLICY "Recipients can view their received requests" 
ON public.communication_requests 
FOR SELECT 
USING (auth.uid() = recipient_id);

CREATE POLICY "Recipients can update request responses" 
ON public.communication_requests 
FOR UPDATE 
USING (auth.uid() = recipient_id);

-- Trigger for updated_at
CREATE TRIGGER update_communication_requests_updated_at
BEFORE UPDATE ON public.communication_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
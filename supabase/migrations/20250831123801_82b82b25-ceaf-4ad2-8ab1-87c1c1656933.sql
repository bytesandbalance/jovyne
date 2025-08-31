-- Create helper_applications table to handle helper job applications
CREATE TABLE public.helper_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  helper_request_id uuid NOT NULL,
  helper_id uuid NOT NULL,
  hourly_rate numeric,
  estimated_hours numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  cover_letter text
);

-- Enable Row Level Security
ALTER TABLE public.helper_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for helper_applications
-- Helpers can create and view their own applications
CREATE POLICY "Helpers can create their own applications"
ON public.helper_applications
FOR INSERT
TO authenticated
WITH CHECK (helper_id = (
  SELECT h.id FROM public.helpers h WHERE h.user_id = auth.uid()
));

CREATE POLICY "Helpers can view their own applications"
ON public.helper_applications
FOR SELECT
TO authenticated
USING (helper_id = (
  SELECT h.id FROM public.helpers h WHERE h.user_id = auth.uid()
));

CREATE POLICY "Helpers can update their own applications"
ON public.helper_applications
FOR UPDATE
TO authenticated
USING (helper_id = (
  SELECT h.id FROM public.helpers h WHERE h.user_id = auth.uid()
));

-- Requesters (planners and clients) can view and update applications for their requests
CREATE POLICY "Requesters can view applications for their requests"
ON public.helper_applications
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.helper_requests hr
  LEFT JOIN public.planners p ON p.id = hr.planner_id
  LEFT JOIN public.clients c ON c.id = hr.client_id
  WHERE hr.id = helper_applications.helper_request_id
  AND (p.user_id = auth.uid() OR c.user_id = auth.uid())
));

CREATE POLICY "Requesters can update application status for their requests"
ON public.helper_applications
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.helper_requests hr
  LEFT JOIN public.planners p ON p.id = hr.planner_id
  LEFT JOIN public.clients c ON c.id = hr.client_id
  WHERE hr.id = helper_applications.helper_request_id
  AND (p.user_id = auth.uid() OR c.user_id = auth.uid())
));

-- Add trigger for updated_at
CREATE TRIGGER update_helper_applications_updated_at
BEFORE UPDATE ON public.helper_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
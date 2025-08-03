-- Create enum types for better data consistency
CREATE TYPE public.user_role AS ENUM ('client', 'planner', 'helper');
CREATE TYPE public.event_status AS ENUM ('planning', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.helper_request_status AS ENUM ('open', 'in_review', 'filled', 'cancelled');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- User profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  user_role public.user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Party planners table
CREATE TABLE public.planners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  description TEXT,
  services TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  years_experience INTEGER DEFAULT 0,
  base_price DECIMAL(10,2),
  location_city TEXT,
  location_state TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  portfolio_images TEXT[] DEFAULT '{}',
  website_url TEXT,
  instagram_handle TEXT,
  is_verified BOOLEAN DEFAULT false,
  average_rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planner_id UUID REFERENCES public.planners(id) NOT NULL,
  client_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  venue_name TEXT,
  venue_address TEXT,
  guest_count INTEGER,
  budget DECIMAL(10,2),
  status public.event_status DEFAULT 'planning',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event tasks/checklist table
CREATE TABLE public.event_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES auth.users,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Helper requests table
CREATE TABLE public.helper_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planner_id UUID REFERENCES public.planners(id) NOT NULL,
  event_id UUID REFERENCES public.events(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location_city TEXT NOT NULL,
  hourly_rate DECIMAL(8,2),
  total_hours DECIMAL(4,1),
  status public.helper_request_status DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Helper applications table
CREATE TABLE public.helper_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  helper_request_id UUID REFERENCES public.helper_requests(id) ON DELETE CASCADE NOT NULL,
  helper_id UUID REFERENCES auth.users NOT NULL,
  message TEXT,
  hourly_rate DECIMAL(8,2),
  status public.application_status DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(helper_request_id, helper_id)
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  planner_id UUID REFERENCES public.planners(id) NOT NULL,
  client_id UUID REFERENCES auth.users NOT NULL,
  event_id UUID REFERENCES public.events(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(planner_id, client_id, event_id)
);

-- Helper profiles table
CREATE TABLE public.helpers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  hourly_rate DECIMAL(8,2),
  availability_cities TEXT[] DEFAULT '{}',
  bio TEXT,
  portfolio_images TEXT[] DEFAULT '{}',
  average_rating DECIMAL(2,1) DEFAULT 0.0,
  total_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helper_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helper_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.helpers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for planners
CREATE POLICY "Anyone can view verified planners" ON public.planners FOR SELECT USING (is_verified = true OR auth.uid() = user_id);
CREATE POLICY "Planners can update their own profile" ON public.planners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Planners can insert their own profile" ON public.planners FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for events
CREATE POLICY "Planners and clients can view their events" ON public.events 
  FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() = (SELECT user_id FROM public.planners WHERE id = planner_id)
  );
CREATE POLICY "Clients can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Planners and clients can update their events" ON public.events 
  FOR UPDATE USING (
    auth.uid() = client_id OR 
    auth.uid() = (SELECT user_id FROM public.planners WHERE id = planner_id)
  );

-- RLS Policies for event_tasks
CREATE POLICY "Event participants can view tasks" ON public.event_tasks 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_id AND (
        auth.uid() = e.client_id OR 
        auth.uid() = (SELECT user_id FROM public.planners WHERE id = e.planner_id)
      )
    )
  );
CREATE POLICY "Event participants can manage tasks" ON public.event_tasks 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_id AND (
        auth.uid() = e.client_id OR 
        auth.uid() = (SELECT user_id FROM public.planners WHERE id = e.planner_id)
      )
    )
  );

-- RLS Policies for helper_requests
CREATE POLICY "Anyone can view open helper requests" ON public.helper_requests FOR SELECT USING (true);
CREATE POLICY "Planners can manage their helper requests" ON public.helper_requests 
  FOR ALL USING (auth.uid() = (SELECT user_id FROM public.planners WHERE id = planner_id));

-- RLS Policies for helper_applications
CREATE POLICY "Helpers can view their applications" ON public.helper_applications FOR SELECT USING (auth.uid() = helper_id);
CREATE POLICY "Planners can view applications for their requests" ON public.helper_applications 
  FOR SELECT USING (
    auth.uid() = (
      SELECT p.user_id FROM public.planners p 
      JOIN public.helper_requests hr ON hr.planner_id = p.id 
      WHERE hr.id = helper_request_id
    )
  );
CREATE POLICY "Helpers can create applications" ON public.helper_applications FOR INSERT WITH CHECK (auth.uid() = helper_id);
CREATE POLICY "Planners can update application status" ON public.helper_applications 
  FOR UPDATE USING (
    auth.uid() = (
      SELECT p.user_id FROM public.planners p 
      JOIN public.helper_requests hr ON hr.planner_id = p.id 
      WHERE hr.id = helper_request_id
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update their reviews" ON public.reviews FOR UPDATE USING (auth.uid() = client_id);

-- RLS Policies for helpers
CREATE POLICY "Anyone can view helper profiles" ON public.helpers FOR SELECT USING (true);
CREATE POLICY "Helpers can update their own profile" ON public.helpers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Helpers can insert their own profile" ON public.helpers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_planners_updated_at BEFORE UPDATE ON public.planners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_event_tasks_updated_at BEFORE UPDATE ON public.event_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_helper_requests_updated_at BEFORE UPDATE ON public.helper_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_helpers_updated_at BEFORE UPDATE ON public.helpers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update planner rating when reviews are added/updated
CREATE OR REPLACE FUNCTION public.update_planner_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.planners 
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating::numeric), 1) 
      FROM public.reviews 
      WHERE planner_id = COALESCE(NEW.planner_id, OLD.planner_id)
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE planner_id = COALESCE(NEW.planner_id, OLD.planner_id)
    )
  WHERE id = COALESCE(NEW.planner_id, OLD.planner_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating planner ratings
CREATE TRIGGER update_planner_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_planner_rating();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, user_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'user_role')::public.user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
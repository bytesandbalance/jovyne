-- Create tables for planner organizational features

-- 1. Task & Project Management
CREATE TABLE public.planner_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id UUID NOT NULL REFERENCES public.planners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- admin, marketing, vendor_meetings, project, etc.
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Vendor & Supplier Directory
CREATE TABLE public.planner_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id UUID NOT NULL REFERENCES public.planners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL, -- caterer, florist, venue, photographer, etc.
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  pricing_info TEXT,
  availability_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Event Templates Library
CREATE TABLE public.planner_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id UUID NOT NULL REFERENCES public.planners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL, -- checklist, timeline, budget, package
  event_type TEXT, -- wedding, corporate, birthday, etc.
  content JSONB NOT NULL DEFAULT '{}', -- flexible structure for different template types
  estimated_budget NUMERIC,
  estimated_hours NUMERIC,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Business Calendar & Availability
CREATE TABLE public.planner_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id UUID NOT NULL REFERENCES public.planners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL, -- availability_block, vendor_meeting, marketing_activity, personal
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  location TEXT,
  is_available BOOLEAN DEFAULT true, -- for availability blocks
  vendor_id UUID REFERENCES public.planner_vendors(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Inventory Management
CREATE TABLE public.planner_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id UUID NOT NULL REFERENCES public.planners(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL, -- equipment, decorations, supplies, furniture, etc.
  quantity INTEGER NOT NULL DEFAULT 1,
  condition TEXT NOT NULL DEFAULT 'excellent', -- excellent, good, fair, poor, needs_repair
  purchase_date DATE,
  purchase_price NUMERIC,
  current_value NUMERIC,
  location TEXT, -- storage location
  description TEXT,
  maintenance_notes TEXT,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.planner_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Planners can only access their own data
CREATE POLICY "Planners can manage their own tasks" ON public.planner_tasks
  FOR ALL USING (
    planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
  )
  WITH CHECK (
    planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
  );

CREATE POLICY "Planners can manage their own vendors" ON public.planner_vendors
  FOR ALL USING (
    planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
  )
  WITH CHECK (
    planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
  );

CREATE POLICY "Planners can manage their own templates" ON public.planner_templates
  FOR ALL USING (
    planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
  )
  WITH CHECK (
    planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
  );

CREATE POLICY "Planners can manage their own calendar" ON public.planner_calendar
  FOR ALL USING (
    planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
  )
  WITH CHECK (
    planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
  );

CREATE POLICY "Planners can manage their own inventory" ON public.planner_inventory
  FOR ALL USING (
    planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
  )
  WITH CHECK (
    planner_id = (SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid())
  );

-- Add triggers for updated_at columns
CREATE TRIGGER update_planner_tasks_updated_at
  BEFORE UPDATE ON public.planner_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planner_vendors_updated_at
  BEFORE UPDATE ON public.planner_vendors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planner_templates_updated_at
  BEFORE UPDATE ON public.planner_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planner_calendar_updated_at
  BEFORE UPDATE ON public.planner_calendar
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planner_inventory_updated_at
  BEFORE UPDATE ON public.planner_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
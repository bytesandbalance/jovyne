-- Create client_tasks table for task management
CREATE TABLE public.client_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_budget_categories table for budget tracking
CREATE TABLE public.client_budget_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL DEFAULT 0,
  spent_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_budget_expenses table for expense tracking
CREATE TABLE public.client_budget_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.client_budget_categories(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  expense_date DATE NOT NULL,
  vendor TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.client_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_budget_expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for client_tasks
CREATE POLICY "Clients can manage their own tasks"
ON public.client_tasks
FOR ALL
USING (client_id = (SELECT c.id FROM public.clients c WHERE c.user_id = auth.uid()))
WITH CHECK (client_id = (SELECT c.id FROM public.clients c WHERE c.user_id = auth.uid()));

-- Create RLS policies for client_budget_categories
CREATE POLICY "Clients can manage their own budget categories"
ON public.client_budget_categories
FOR ALL
USING (client_id = (SELECT c.id FROM public.clients c WHERE c.user_id = auth.uid()))
WITH CHECK (client_id = (SELECT c.id FROM public.clients c WHERE c.user_id = auth.uid()));

-- Create RLS policies for client_budget_expenses
CREATE POLICY "Clients can manage their own budget expenses"
ON public.client_budget_expenses
FOR ALL
USING (client_id = (SELECT c.id FROM public.clients c WHERE c.user_id = auth.uid()))
WITH CHECK (client_id = (SELECT c.id FROM public.clients c WHERE c.user_id = auth.uid()));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_client_tasks_updated_at
  BEFORE UPDATE ON public.client_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_budget_categories_updated_at
  BEFORE UPDATE ON public.client_budget_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_budget_expenses_updated_at
  BEFORE UPDATE ON public.client_budget_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_client_tasks_client_id ON public.client_tasks(client_id);
CREATE INDEX idx_client_tasks_due_date ON public.client_tasks(due_date);
CREATE INDEX idx_client_tasks_status ON public.client_tasks(status);

CREATE INDEX idx_client_budget_categories_client_id ON public.client_budget_categories(client_id);
CREATE INDEX idx_client_budget_expenses_client_id ON public.client_budget_expenses(client_id);
CREATE INDEX idx_client_budget_expenses_category_id ON public.client_budget_expenses(category_id);
CREATE INDEX idx_client_budget_expenses_expense_date ON public.client_budget_expenses(expense_date);
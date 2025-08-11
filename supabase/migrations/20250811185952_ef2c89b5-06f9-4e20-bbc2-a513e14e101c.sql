-- Fix: policies without IF NOT EXISTS using conditional DO blocks

-- 1) Create helper_invoice_status enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'helper_invoice_status') THEN
    CREATE TYPE public.helper_invoice_status AS ENUM (
      'draft',
      'sent_to_planner',
      'awaiting_payment',
      'paid_planner',
      'completed'
    );
  END IF;
END$$;

-- 2) Create helper_invoices table
CREATE TABLE IF NOT EXISTS public.helper_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planner_id UUID NOT NULL,
  helper_id UUID NOT NULL,
  helper_application_id UUID,
  helper_request_id UUID,
  event_id UUID,
  job_title TEXT NOT NULL,
  planner_name TEXT,
  planner_contact_email TEXT,
  planner_contact_phone TEXT,
  helper_name TEXT,
  event_date DATE,
  hourly_rate NUMERIC,
  total_hours NUMERIC,
  amount NUMERIC,
  status public.helper_invoice_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_helper_invoices_helper_id ON public.helper_invoices (helper_id);
CREATE INDEX IF NOT EXISTS idx_helper_invoices_planner_id ON public.helper_invoices (planner_id);
CREATE INDEX IF NOT EXISTS idx_helper_invoices_status ON public.helper_invoices (status);

-- 4) Enable RLS
ALTER TABLE public.helper_invoices ENABLE ROW LEVEL SECURITY;

-- 5) Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'helper_invoices' AND policyname = 'Helpers can view their helper invoices'
  ) THEN
    CREATE POLICY "Helpers can view their helper invoices"
    ON public.helper_invoices
    FOR SELECT
    USING (
      helper_id = (
        SELECT h.id FROM public.helpers h WHERE h.user_id = auth.uid()
      )
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'helper_invoices' AND policyname = 'Planners can view their helper invoices'
  ) THEN
    CREATE POLICY "Planners can view their helper invoices"
    ON public.helper_invoices
    FOR SELECT
    USING (
      planner_id = (
        SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid()
      )
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'helper_invoices' AND policyname = 'Helpers can update their helper invoices'
  ) THEN
    CREATE POLICY "Helpers can update their helper invoices"
    ON public.helper_invoices
    FOR UPDATE
    USING (
      helper_id = (
        SELECT h.id FROM public.helpers h WHERE h.user_id = auth.uid()
      )
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'helper_invoices' AND policyname = 'Planners can update their helper invoices'
  ) THEN
    CREATE POLICY "Planners can update their helper invoices"
    ON public.helper_invoices
    FOR UPDATE
    USING (
      planner_id = (
        SELECT p.id FROM public.planners p WHERE p.user_id = auth.uid()
      )
    );
  END IF;
END$$;

-- 6) Timestamp trigger
DROP TRIGGER IF EXISTS trg_helper_invoices_updated_at ON public.helper_invoices;
CREATE TRIGGER trg_helper_invoices_updated_at
BEFORE UPDATE ON public.helper_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 7) Status transition enforcement and timestamps
CREATE OR REPLACE FUNCTION public.enforce_helper_invoice_transitions()
RETURNS TRIGGER AS $$
DECLARE
  old_status TEXT := (CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.status::text, 'draft') ELSE NULL END);
  new_status TEXT := NEW.status::text;
BEGIN
  -- Lock any edits after completed
  IF (OLD.status = 'completed'::public.helper_invoice_status) THEN
    RAISE EXCEPTION 'Invoice is completed and cannot be modified';
  END IF;

  -- Allowed transitions
  IF old_status = 'draft' AND new_status = 'sent_to_planner' THEN
    NEW.sent_at := COALESCE(NEW.sent_at, now());
    NEW.status := 'awaiting_payment';
  ELSIF old_status = 'awaiting_payment' AND new_status = 'paid_planner' THEN
    NEW.paid_at := COALESCE(NEW.paid_at, now());
  ELSIF old_status = 'paid_planner' AND new_status = 'completed' THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());
  ELSE
    IF old_status = new_status THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Invalid status transition from % to %', old_status, new_status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

DROP TRIGGER IF EXISTS trg_helper_invoice_transitions ON public.helper_invoices;
CREATE TRIGGER trg_helper_invoice_transitions
BEFORE UPDATE ON public.helper_invoices
FOR EACH ROW
EXECUTE FUNCTION public.enforce_helper_invoice_transitions();

-- 8) Auto-create invoice when application is approved
CREATE OR REPLACE FUNCTION public.create_helper_invoice_on_approval()
RETURNS TRIGGER AS $$
DECLARE
  hr RECORD;
  planner_user_id UUID;
  helper_user_id UUID;
  planner_profile RECORD;
  helper_profile RECORD;
  rate NUMERIC;
  hours NUMERIC;
  amt NUMERIC;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status::text IN ('approved','accepted') THEN
    SELECT * INTO hr FROM public.helper_requests WHERE id = NEW.helper_request_id;
    IF hr IS NULL THEN
      RETURN NEW;
    END IF;

    SELECT p.user_id INTO planner_user_id FROM public.planners p WHERE p.id = hr.planner_id;
    SELECT h.user_id INTO helper_user_id FROM public.helpers h WHERE h.id = NEW.helper_id;

    SELECT pr.full_name, pr.email, pr.phone INTO planner_profile FROM public.profiles pr WHERE pr.user_id = planner_user_id;
    SELECT pr.full_name INTO helper_profile FROM public.profiles pr WHERE pr.user_id = helper_user_id;

    rate := COALESCE(NEW.hourly_rate, hr.hourly_rate, 0);
    hours := COALESCE(hr.total_hours, 0);
    amt := rate * hours;

    INSERT INTO public.helper_invoices (
      planner_id,
      helper_id,
      helper_application_id,
      helper_request_id,
      event_id,
      job_title,
      planner_name,
      planner_contact_email,
      planner_contact_phone,
      helper_name,
      event_date,
      hourly_rate,
      total_hours,
      amount,
      status
    )
    VALUES (
      hr.planner_id,
      NEW.helper_id,
      NEW.id,
      hr.id,
      hr.event_id,
      hr.title,
      planner_profile.full_name,
      planner_profile.email,
      planner_profile.phone,
      helper_profile.full_name,
      hr.event_date,
      rate,
      hours,
      amt,
      'draft'
    );

    INSERT INTO public.messages (sender_id, recipient_id, subject, message)
    VALUES (
      planner_user_id,
      helper_user_id,
      'Application Approved',
      'Your application for ' || hr.title || ' has been approved. An invoice form has been created in your dashboard. Please review, complete, and send it to the planner.'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

DROP TRIGGER IF EXISTS trg_create_invoice_on_application_approval ON public.helper_applications;
CREATE TRIGGER trg_create_invoice_on_application_approval
AFTER UPDATE OF status ON public.helper_applications
FOR EACH ROW
EXECUTE FUNCTION public.create_helper_invoice_on_approval();
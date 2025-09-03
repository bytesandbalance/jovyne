-- First create the enum type for invoice status
CREATE TYPE public.helper_invoice_status AS ENUM (
  'draft',
  'sent_to_planner', 
  'awaiting_payment',
  'paid_planner',
  'completed'
);

-- Add the status column to planner_invoices table
ALTER TABLE public.planner_invoices 
ADD COLUMN status public.helper_invoice_status NOT NULL DEFAULT 'draft';
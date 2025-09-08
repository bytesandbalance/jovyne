-- Fix schema to allow manual entries (NULL values for external clients/invoices)

-- Make user_id nullable in clients table to allow manual client entries
ALTER TABLE public.clients 
ALTER COLUMN user_id DROP NOT NULL;

-- Make client_id nullable in planner_invoices table to allow manual invoice entries
ALTER TABLE public.planner_invoices 
ALTER COLUMN client_id DROP NOT NULL;
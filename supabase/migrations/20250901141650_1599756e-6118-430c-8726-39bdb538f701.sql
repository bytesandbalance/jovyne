-- Remove all helper-related database objects

-- Drop triggers first (if they exist)
DROP TRIGGER IF EXISTS update_helper_invoices_updated_at ON public.helper_invoices;
DROP TRIGGER IF EXISTS update_helpers_updated_at ON public.helpers;
DROP TRIGGER IF EXISTS update_helper_requests_updated_at ON public.helper_requests;
DROP TRIGGER IF EXISTS update_helper_applications_updated_at ON public.helper_applications;
DROP TRIGGER IF EXISTS update_helper_tasks_updated_at ON public.helper_tasks;

-- Drop functions related to helpers
DROP FUNCTION IF EXISTS public.create_helper_invoice_on_approval() CASCADE;
DROP FUNCTION IF EXISTS public.create_helper_invoice_on_request_approval() CASCADE;
DROP FUNCTION IF EXISTS public.notify_planner_of_application() CASCADE;
DROP FUNCTION IF EXISTS public.notify_requester_of_application() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_helper_invoice_transitions() CASCADE;
DROP FUNCTION IF EXISTS public.ensure_helper_profile() CASCADE;

-- Drop helper-related tables in correct order (considering dependencies)
DROP TABLE IF EXISTS public.helper_invoices CASCADE;
DROP TABLE IF EXISTS public.helper_applications CASCADE;
DROP TABLE IF EXISTS public.helper_requests CASCADE;
DROP TABLE IF EXISTS public.helper_tasks CASCADE;
DROP TABLE IF EXISTS public.helpers CASCADE;

-- Drop helper-related enums
DROP TYPE IF EXISTS public.helper_request_status CASCADE;
DROP TYPE IF EXISTS public.helper_invoice_status CASCADE;

-- Update user_role enum to remove 'helper'
-- First remove the default constraint
ALTER TABLE public.profiles ALTER COLUMN user_role DROP DEFAULT;

-- Create new enum without helper
CREATE TYPE public.user_role_new AS ENUM ('client', 'planner');

-- Update profiles table to use new enum
ALTER TABLE public.profiles 
  ALTER COLUMN user_role TYPE public.user_role_new 
  USING user_role::text::public.user_role_new;

-- Drop old enum and rename new one
DROP TYPE public.user_role CASCADE;
ALTER TYPE public.user_role_new RENAME TO user_role;

-- Set default for profiles.user_role
ALTER TABLE public.profiles 
  ALTER COLUMN user_role SET DEFAULT 'client'::public.user_role;
-- Fix foreign key on helper_applications.helper_id to reference public.helpers(id)
-- and backfill any rows that may still store auth user IDs instead of helper IDs.

-- 1) Backfill existing data where helper_id accidentally stores user_id
UPDATE public.helper_applications ha
SET helper_id = h.id
FROM public.helpers h
WHERE ha.helper_id = h.user_id
  AND ha.helper_id <> h.id;

-- 2) Drop incorrect FK (likely pointing to auth.users or public.users)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE t.relname = 'helper_applications'
      AND n.nspname = 'public'
      AND c.conname = 'helper_applications_helper_id_fkey'
  ) THEN
    ALTER TABLE public.helper_applications
    DROP CONSTRAINT helper_applications_helper_id_fkey;
  END IF;
END $$;

-- 3) Ensure column type is UUID (no-op if already uuid)
ALTER TABLE public.helper_applications
ALTER COLUMN helper_id TYPE uuid USING helper_id::uuid;

-- 4) Create the correct FK to public.helpers(id)
ALTER TABLE public.helper_applications
ADD CONSTRAINT helper_applications_helper_id_fkey
FOREIGN KEY (helper_id) REFERENCES public.helpers(id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

-- 5) Helpful index for queries
CREATE INDEX IF NOT EXISTS idx_helper_applications_helper_id ON public.helper_applications(helper_id);

-- Fix FK on helper_applications.helper_id to reference public.helpers(id)

-- 1) Backfill any rows where helper_id stored user_id
UPDATE public.helper_applications ha
SET helper_id = h.id
FROM public.helpers h
WHERE ha.helper_id = h.user_id
  AND ha.helper_id <> h.id;

-- 2) Drop incorrect FK if exists
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

-- 3) Recreate correct FK to public.helpers(id)
ALTER TABLE public.helper_applications
ADD CONSTRAINT helper_applications_helper_id_fkey
FOREIGN KEY (helper_id) REFERENCES public.helpers(id) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE;

-- 4) Helpful index
CREATE INDEX IF NOT EXISTS idx_helper_applications_helper_id ON public.helper_applications(helper_id);

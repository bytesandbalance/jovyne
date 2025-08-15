-- Add updated_at column to helper_applications and ensure it auto-updates on changes
ALTER TABLE public.helper_applications
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Safely create BEFORE UPDATE trigger to maintain updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_helper_applications_updated_at'
  ) THEN
    CREATE TRIGGER set_helper_applications_updated_at
    BEFORE UPDATE ON public.helper_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

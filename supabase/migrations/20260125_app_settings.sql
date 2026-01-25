-- Application Settings (Single-Row Pattern)
--
-- This table stores application-wide settings using a single-row pattern.
-- The CHECK constraint ensures only one row can exist with id=1.
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard -> SQL Editor
-- 2. Paste and run this script
-- 3. Configure email settings via the admin UI or directly in the table

-- ============================================================================
-- Step 1: Create the app_settings table with single-row pattern
-- ============================================================================

CREATE TABLE public.app_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),

  -- Email configuration
  email_default_recipients TEXT[] DEFAULT '{}',       -- Default email addresses for export
  email_user_can_edit BOOLEAN DEFAULT true,           -- Can users modify recipients?
  email_defaults_replaceable BOOLEAN DEFAULT true,    -- Can defaults be replaced entirely?

  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add comment for documentation
COMMENT ON TABLE public.app_settings IS 'Application-wide settings (single-row pattern)';
COMMENT ON COLUMN public.app_settings.email_default_recipients IS 'Default email addresses for export recipients';
COMMENT ON COLUMN public.app_settings.email_user_can_edit IS 'Whether users can modify email recipients';
COMMENT ON COLUMN public.app_settings.email_defaults_replaceable IS 'Whether default recipients can be completely replaced';

-- ============================================================================
-- Step 2: Enable Row Level Security
-- ============================================================================

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Step 3: Create RLS policies
-- ============================================================================

-- All authenticated users can read app settings
CREATE POLICY "Authenticated users can read app settings"
  ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update app settings
CREATE POLICY "Admins can update app settings"
  ON public.app_settings
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_role') = 'admin'
  );

-- No INSERT policy - single row is inserted during migration
-- No DELETE policy - prevent accidental deletion of settings row

-- ============================================================================
-- Step 4: Create updated_at trigger
-- ============================================================================

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Step 5: Insert the single settings row
-- ============================================================================

INSERT INTO public.app_settings (id) VALUES (1);

-- ============================================================================
-- Migration Complete
-- ============================================================================
--
-- After running this migration:
-- 1. Check the app_settings table to verify the single row exists
-- 2. Update email_default_recipients via admin UI or SQL:
--    UPDATE public.app_settings SET email_default_recipients = ARRAY['admin@example.com'] WHERE id = 1;
-- 3. Configure email_user_can_edit and email_defaults_replaceable as needed
--
-- Note: The CHECK constraint (id = 1) prevents multiple rows from being inserted.

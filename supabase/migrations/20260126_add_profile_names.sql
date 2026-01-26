-- Add first_name and last_name to profiles table
-- Also add RLS policy for all authenticated users to read profiles
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard -> SQL Editor
-- 2. Paste and run this script
-- 3. Manually update existing users' first_name and last_name values

-- ============================================================================
-- Step 1: Add name columns to profiles table
-- ============================================================================

-- Add columns with default empty string first (for existing rows)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS last_name TEXT NOT NULL DEFAULT '';

-- ============================================================================
-- Step 2: Add RLS policy for all authenticated users to read profiles
-- ============================================================================

-- Allow all authenticated users to read basic profile info
-- This enables showing who created/edited RFPs to all users
CREATE POLICY "All authenticated users can read profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- Step 3: Update handle_new_user trigger to include names from metadata
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Migration Complete
-- ============================================================================
--
-- After running this migration:
-- 1. Update existing users' first_name and last_name in the profiles table
-- 2. Test registration to ensure names are saved correctly

-- =============================================
-- Phase 10.1 Combined Migrations
-- Run this entire script in Supabase Dashboard SQL Editor
-- =============================================

-- =============================================
-- PART 1: Multi-User RFP Access
-- Adds last_edited_by column and updates RLS policies
-- =============================================

-- Step 1: Add last_edited_by column to track who made most recent change
ALTER TABLE rfp_upload_jobs
ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 2: Update RLS policies for rfp_upload_jobs

-- Drop existing user-specific policies
DROP POLICY IF EXISTS "Users can view own rfp jobs" ON rfp_upload_jobs;
DROP POLICY IF EXISTS "Users can delete own rfp jobs" ON rfp_upload_jobs;

-- CREATE policies (use DO block to handle "already exists" gracefully)
DO $$
BEGIN
  -- INSERT: Must be the uploader
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert rfp jobs' AND tablename = 'rfp_upload_jobs') THEN
    CREATE POLICY "Authenticated users can insert rfp jobs"
      ON rfp_upload_jobs FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- SELECT: All authenticated users can view all jobs
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view all rfp jobs' AND tablename = 'rfp_upload_jobs') THEN
    CREATE POLICY "Authenticated users can view all rfp jobs"
      ON rfp_upload_jobs FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- UPDATE: All authenticated users can update any job
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update all rfp jobs' AND tablename = 'rfp_upload_jobs') THEN
    CREATE POLICY "Authenticated users can update all rfp jobs"
      ON rfp_upload_jobs FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  -- DELETE: All authenticated users can delete any job
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete all rfp jobs' AND tablename = 'rfp_upload_jobs') THEN
    CREATE POLICY "Authenticated users can delete all rfp jobs"
      ON rfp_upload_jobs FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Grant UPDATE permission
GRANT UPDATE ON rfp_upload_jobs TO authenticated;

-- Step 3: Update RLS policies for rfp_items

-- Drop existing user-specific policies
DROP POLICY IF EXISTS "Users can view own rfp items" ON rfp_items;
DROP POLICY IF EXISTS "Users can update own rfp items" ON rfp_items;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view all rfp items' AND tablename = 'rfp_items') THEN
    CREATE POLICY "Authenticated users can view all rfp items"
      ON rfp_items FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update all rfp items' AND tablename = 'rfp_items') THEN
    CREATE POLICY "Authenticated users can update all rfp items"
      ON rfp_items FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Step 4: Update RLS policies for rfp_match_suggestions

-- Drop existing user-specific policies
DROP POLICY IF EXISTS "Users can view own match suggestions" ON rfp_match_suggestions;
DROP POLICY IF EXISTS "Users can update own match suggestions" ON rfp_match_suggestions;
DROP POLICY IF EXISTS "Users can insert manual matches" ON rfp_match_suggestions;
DROP POLICY IF EXISTS "Users can delete manual matches" ON rfp_match_suggestions;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view all match suggestions' AND tablename = 'rfp_match_suggestions') THEN
    CREATE POLICY "Authenticated users can view all match suggestions"
      ON rfp_match_suggestions FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update all match suggestions' AND tablename = 'rfp_match_suggestions') THEN
    CREATE POLICY "Authenticated users can update all match suggestions"
      ON rfp_match_suggestions FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert manual matches' AND tablename = 'rfp_match_suggestions') THEN
    CREATE POLICY "Authenticated users can insert manual matches"
      ON rfp_match_suggestions FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete manual matches' AND tablename = 'rfp_match_suggestions') THEN
    CREATE POLICY "Authenticated users can delete manual matches"
      ON rfp_match_suggestions FOR DELETE
      TO authenticated
      USING (match_type = 'Manual');
  END IF;
END $$;

-- =============================================
-- PART 2: Confirmed At Column for 3-State KPI Model
-- Por Rever: has pending items to decide
-- Revistos: all items addressed, confirmed_at IS NULL
-- Confirmados: confirmed_at IS NOT NULL
-- =============================================

ALTER TABLE rfp_upload_jobs
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Index for efficient filtering by confirmation status
CREATE INDEX IF NOT EXISTS idx_rfp_upload_jobs_confirmed_at
ON rfp_upload_jobs(confirmed_at)
WHERE confirmed_at IS NOT NULL;

-- =============================================
-- Done! Phase 10.1 migrations applied.
-- =============================================

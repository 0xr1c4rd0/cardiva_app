-- Migration: Enable multi-user RFP access
-- This allows all authenticated users to view, edit, and delete any RFP
-- for team collaboration scenarios
--
-- Run this in Supabase Dashboard SQL Editor

-- =============================================
-- Step 1: Add last_edited_by column to track who made most recent change
-- =============================================
ALTER TABLE rfp_upload_jobs
ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- =============================================
-- Step 2: Update RLS policies for rfp_upload_jobs
-- =============================================

-- Drop existing user-specific policies
DROP POLICY IF EXISTS "Users can view own rfp jobs" ON rfp_upload_jobs;
DROP POLICY IF EXISTS "Users can delete own rfp jobs" ON rfp_upload_jobs;

-- Create new policies for all authenticated users
-- INSERT: Must be the uploader (user_id = auth.uid())
CREATE POLICY "Authenticated users can insert rfp jobs"
  ON rfp_upload_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- SELECT: All authenticated users can view all jobs
CREATE POLICY "Authenticated users can view all rfp jobs"
  ON rfp_upload_jobs FOR SELECT
  TO authenticated
  USING (true);

-- UPDATE: All authenticated users can update any job
-- Note: "Service role can update rfp jobs" policy already exists for n8n
-- We add a separate policy for authenticated users
CREATE POLICY "Authenticated users can update all rfp jobs"
  ON rfp_upload_jobs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: All authenticated users can delete any job
CREATE POLICY "Authenticated users can delete all rfp jobs"
  ON rfp_upload_jobs FOR DELETE
  TO authenticated
  USING (true);

-- Grant UPDATE permission (INSERT, SELECT, DELETE already granted)
GRANT UPDATE ON rfp_upload_jobs TO authenticated;

-- =============================================
-- Step 3: Update RLS policies for rfp_items
-- =============================================

-- Drop existing user-specific policies
DROP POLICY IF EXISTS "Users can view own rfp items" ON rfp_items;
DROP POLICY IF EXISTS "Users can update own rfp items" ON rfp_items;

-- Create new policies for all authenticated users
CREATE POLICY "Authenticated users can view all rfp items"
  ON rfp_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update all rfp items"
  ON rfp_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- Step 4: Update RLS policies for rfp_match_suggestions
-- =============================================

-- Drop existing user-specific policies
DROP POLICY IF EXISTS "Users can view own match suggestions" ON rfp_match_suggestions;
DROP POLICY IF EXISTS "Users can update own match suggestions" ON rfp_match_suggestions;
DROP POLICY IF EXISTS "Users can insert manual matches" ON rfp_match_suggestions;
DROP POLICY IF EXISTS "Users can delete manual matches" ON rfp_match_suggestions;

-- Create new policies for all authenticated users
CREATE POLICY "Authenticated users can view all match suggestions"
  ON rfp_match_suggestions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update all match suggestions"
  ON rfp_match_suggestions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- INSERT: All authenticated users can insert manual matches
CREATE POLICY "Authenticated users can insert manual matches"
  ON rfp_match_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- DELETE: All authenticated users can delete manual matches
CREATE POLICY "Authenticated users can delete manual matches"
  ON rfp_match_suggestions FOR DELETE
  TO authenticated
  USING (match_type = 'Manual');

-- =============================================
-- Notes
-- =============================================
-- Service role policies remain unchanged for n8n access:
-- - "Service role can update rfp jobs" (rfp_upload_jobs)
-- - "Service role can manage rfp items" (rfp_items)
-- - "Service role can manage match suggestions" (rfp_match_suggestions)
--
-- The last_edited_by column tracks who made the most recent change
-- to an RFP job. This is updated by Server Actions when accepting/
-- rejecting matches.

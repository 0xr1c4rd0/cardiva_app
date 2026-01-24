-- Fix RFP upload jobs INSERT policy
-- Run this in Supabase Dashboard SQL Editor

-- Drop ALL existing INSERT policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create rfp jobs" ON rfp_upload_jobs;
DROP POLICY IF EXISTS "Authenticated users can insert rfp jobs" ON rfp_upload_jobs;

-- Create a clean INSERT policy
CREATE POLICY "Authenticated users can insert rfp jobs"
  ON rfp_upload_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure INSERT permission is granted
GRANT INSERT ON rfp_upload_jobs TO authenticated;

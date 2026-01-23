-- Migration: Create rfp_upload_jobs table for tracking RFP PDF uploads
-- Run this in Supabase Dashboard SQL Editor

-- Create the rfp_upload_jobs table
CREATE TABLE IF NOT EXISTS rfp_upload_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT,  -- Supabase Storage path
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraint for valid status values
  CONSTRAINT valid_rfp_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Create index for querying by user
CREATE INDEX IF NOT EXISTS idx_rfp_upload_jobs_user_id ON rfp_upload_jobs(user_id);

-- Create index for querying by status
CREATE INDEX IF NOT EXISTS idx_rfp_upload_jobs_status ON rfp_upload_jobs(status);

-- Create index for recent jobs
CREATE INDEX IF NOT EXISTS idx_rfp_upload_jobs_created_at ON rfp_upload_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE rfp_upload_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own jobs
CREATE POLICY "Users can view own rfp jobs"
  ON rfp_upload_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create jobs
CREATE POLICY "Users can create rfp jobs"
  ON rfp_upload_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can update jobs (for n8n)
-- Note: n8n will use service_role key to update job status
CREATE POLICY "Service role can update rfp jobs"
  ON rfp_upload_jobs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_rfp_job_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rfp_job_updated_at
  BEFORE UPDATE ON rfp_upload_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_rfp_job_updated_at();

-- Grant permissions
GRANT SELECT, INSERT ON rfp_upload_jobs TO authenticated;
GRANT ALL ON rfp_upload_jobs TO service_role;

-- Enable Realtime for this table (required for live status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE rfp_upload_jobs;

/*
  MANUAL STEP: Supabase Storage Setup
  ====================================
  After running this migration, manually create the storage bucket:

  1. Go to Storage in Supabase Dashboard
  2. Create a new bucket called "rfp-uploads" (private, not public)
  3. Add RLS policies via the Storage Policies UI:
     - INSERT policy: auth.uid()::text = (storage.foldername(name))[1]
     - SELECT policy: auth.uid()::text = (storage.foldername(name))[1]
*/

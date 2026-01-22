-- Migration: Create inventory_upload_jobs table for tracking CSV uploads
-- Run this in Supabase Dashboard SQL Editor

-- Create the inventory_upload_jobs table
CREATE TABLE IF NOT EXISTS inventory_upload_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  row_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  processed_rows INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraint for valid status values
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'partial'))
);

-- Create index for querying by user
CREATE INDEX IF NOT EXISTS idx_inventory_upload_jobs_user_id ON inventory_upload_jobs(user_id);

-- Create index for querying by status
CREATE INDEX IF NOT EXISTS idx_inventory_upload_jobs_status ON inventory_upload_jobs(status);

-- Create index for recent jobs
CREATE INDEX IF NOT EXISTS idx_inventory_upload_jobs_created_at ON inventory_upload_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE inventory_upload_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own jobs
CREATE POLICY "Users can view own upload jobs"
  ON inventory_upload_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create jobs
CREATE POLICY "Users can create upload jobs"
  ON inventory_upload_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can update jobs (for n8n)
-- Note: n8n will use service_role key to update job status
CREATE POLICY "Service role can update jobs"
  ON inventory_upload_jobs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_inventory_job_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_job_updated_at
  BEFORE UPDATE ON inventory_upload_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_job_updated_at();

-- Grant permissions
GRANT SELECT, INSERT ON inventory_upload_jobs TO authenticated;
GRANT ALL ON inventory_upload_jobs TO service_role;

-- Enable Realtime for this table (required for live status updates)
-- This adds the table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_upload_jobs;

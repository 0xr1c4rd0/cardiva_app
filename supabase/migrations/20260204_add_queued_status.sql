-- Migration: Add 'queued' status to rfp_upload_jobs
-- This enables server-side queue persistence where files are stored immediately
-- before being processed by n8n

-- Drop existing constraint
ALTER TABLE rfp_upload_jobs
DROP CONSTRAINT IF EXISTS valid_rfp_status;

-- Add new constraint with 'queued' status
ALTER TABLE rfp_upload_jobs
ADD CONSTRAINT valid_rfp_status
CHECK (status IN ('queued', 'pending', 'processing', 'completed', 'failed'));

-- Update index to include queued status for efficient restore queries
DROP INDEX IF EXISTS idx_rfp_upload_jobs_restore_query;
CREATE INDEX idx_rfp_upload_jobs_restore_query
ON rfp_upload_jobs(status, created_at DESC)
WHERE status IN ('queued', 'pending', 'processing');

COMMENT ON COLUMN rfp_upload_jobs.status IS
'Job status: queued (file uploaded, waiting turn), pending (n8n triggered), processing (n8n working), completed, failed';

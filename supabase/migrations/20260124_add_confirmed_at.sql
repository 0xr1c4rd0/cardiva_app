-- Add confirmed_at column for 3-state KPI model
-- Por Rever: has pending items to decide
-- Revistos: all items addressed, confirmed_at IS NULL
-- Confirmados: confirmed_at IS NOT NULL

ALTER TABLE rfp_upload_jobs
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Index for efficient filtering by confirmation status
CREATE INDEX IF NOT EXISTS idx_rfp_upload_jobs_confirmed_at
ON rfp_upload_jobs(confirmed_at)
WHERE confirmed_at IS NOT NULL;

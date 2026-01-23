-- Migration: Add INSERT and DELETE policies for manual match management
-- This allows authenticated users to insert and delete manual matches for their own RFP items

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can insert manual matches" ON rfp_match_suggestions;
DROP POLICY IF EXISTS "Users can delete manual matches" ON rfp_match_suggestions;

-- Users can insert match suggestions for their own items (for manual correction)
CREATE POLICY "Users can insert manual matches"
  ON rfp_match_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (
    rfp_item_id IN (
      SELECT id FROM rfp_items WHERE job_id IN (
        SELECT id FROM rfp_upload_jobs WHERE user_id = auth.uid()
      )
    )
  );

-- Users can delete manual match suggestions for their own items (to undo manual selection)
CREATE POLICY "Users can delete manual matches"
  ON rfp_match_suggestions FOR DELETE
  TO authenticated
  USING (
    match_type = 'Manual' AND
    rfp_item_id IN (
      SELECT id FROM rfp_items WHERE job_id IN (
        SELECT id FROM rfp_upload_jobs WHERE user_id = auth.uid()
      )
    )
  );

-- Grant INSERT and DELETE permissions to authenticated users
GRANT INSERT, DELETE ON rfp_match_suggestions TO authenticated;

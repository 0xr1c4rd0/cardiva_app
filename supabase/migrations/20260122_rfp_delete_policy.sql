-- Migration: Add DELETE policy for rfp_upload_jobs
-- Allows users to delete their own RFP jobs

-- Policy: Users can delete their own jobs
CREATE POLICY "Users can delete own rfp jobs"
  ON rfp_upload_jobs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant DELETE permission to authenticated users
GRANT DELETE ON rfp_upload_jobs TO authenticated;

-- Also add DELETE policy for rfp-uploads storage bucket
-- NOTE: This needs to be done manually in Supabase Dashboard > Storage > Policies
-- Add a DELETE policy with condition: auth.uid()::text = (storage.foldername(name))[1]

/*
  MANUAL STEP: Storage DELETE Policy
  ===================================
  Go to Supabase Dashboard > Storage > rfp-uploads bucket > Policies

  Add a new policy:
  - Name: "Users can delete own files"
  - Allowed operation: DELETE
  - Policy definition: auth.uid()::text = (storage.foldername(name))[1]

  This ensures users can only delete files in their own user_id folder.
*/

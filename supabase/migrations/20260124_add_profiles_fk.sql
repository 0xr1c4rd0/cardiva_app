-- Add foreign key constraints from rfp_upload_jobs to profiles
-- Required for Supabase PostgREST join syntax to work

-- Note: profiles.id references auth.users.id (1:1 relationship)
-- rfp_upload_jobs.user_id already references auth.users.id
-- We need to add a FK to profiles for the join syntax to work

-- Add FK from user_id to profiles (for uploader join)
ALTER TABLE rfp_upload_jobs
DROP CONSTRAINT IF EXISTS rfp_upload_jobs_user_id_profiles_fkey;

ALTER TABLE rfp_upload_jobs
ADD CONSTRAINT rfp_upload_jobs_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add FK from last_edited_by to profiles (for editor join)
ALTER TABLE rfp_upload_jobs
DROP CONSTRAINT IF EXISTS rfp_upload_jobs_last_edited_by_profiles_fkey;

ALTER TABLE rfp_upload_jobs
ADD CONSTRAINT rfp_upload_jobs_last_edited_by_profiles_fkey
FOREIGN KEY (last_edited_by) REFERENCES profiles(id) ON DELETE SET NULL;

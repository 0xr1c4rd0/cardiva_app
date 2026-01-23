---
created: 2026-01-23T10:34
title: Make all RFPs visible to all users
area: database
priority: high
files:
  - src/app/(dashboard)/rfps/page.tsx
  - src/app/(dashboard)/rfps/[id]/matches/page.tsx
  - supabase/migrations/
---

## Problem

Currently, RFPs are filtered by `user_id` so each user only sees their own uploads. The requirement is for ALL users to see ALL RFPs uploaded by any user.

## Solution

### Query Changes
- Remove `.eq('user_id', user.id)` filter from RFP queries
- This affects:
  - RFP list page (main listing)
  - Match review page (job ownership check)
  - Any RFP-related server actions

### RLS Policy Changes
- Update Supabase Row Level Security policies
- Change from: `auth.uid() = user_id`
- Change to: `auth.role() = 'authenticated'` (any logged-in user can view)

### Affected Tables
- `rfp_upload_jobs` - main job records
- `rfp_items` - individual items in each RFP
- `rfp_match_suggestions` - match suggestions per item

### Security Considerations
- All authenticated users can READ all RFPs
- Should only the uploader be able to:
  - Accept/reject matches? (or any user?)
  - Delete/cancel jobs? (probably only uploader or admin)
- Consider adding `uploaded_by` display (see todo #4)

## Migration

```sql
-- Update RLS policies for rfp_upload_jobs
DROP POLICY IF EXISTS "Users can view own jobs" ON rfp_upload_jobs;
CREATE POLICY "Authenticated users can view all jobs" ON rfp_upload_jobs
  FOR SELECT TO authenticated
  USING (true);

-- Similar for rfp_items and rfp_match_suggestions
```

---
created: 2026-01-23T10:33
title: Show uploader email on RFP list
area: ui
priority: medium
files:
  - src/app/(dashboard)/rfps/page.tsx
  - src/app/(dashboard)/rfps/components/rfp-job-card.tsx
  - supabase/migrations/
---

## Problem

Users cannot see who uploaded each RFP document. The uploader's email should be displayed next to the upload timestamp.

## Solution

### Database
- `rfp_upload_jobs` already has `user_id` foreign key
- Need to join with `auth.users` or `profiles` table to get email

### UI Changes
- Add email display to the right of the upload timestamp
- Format: `há 2 horas • user@example.com`
- Or: `2026-01-23 10:30 • user@example.com`

### Query Changes
- Modify the RFP jobs query to include user email
- Either:
  a. Join with profiles table (if email stored there)
  b. Use Supabase auth admin API to fetch user details
  c. Store email directly in `rfp_upload_jobs` table (denormalized)

## Considerations

- Privacy: Is showing email to all users acceptable? (see todo #5)
- Truncation: Long emails may need truncation with tooltip
- Avatar: Could also show user initials/avatar for visual distinction

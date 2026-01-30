# Phase 5: RFP Upload - Verification

## Success Criteria Verification

| Criteria | Status | Evidence |
|----------|--------|----------|
| 1. User can upload PDF file via drag-and-drop or file picker | ✅ PASS | `pdf-dropzone.tsx` component with react-dropzone, accepts `application/pdf` |
| 2. Upload creates job record in Supabase with pending status | ✅ PASS | `actions.ts:triggerRFPUpload` inserts into `rfp_upload_jobs` table |
| 3. n8n webhook is triggered with job_id (fire-and-forget pattern) | ✅ PASS | `rfp-webhook.ts` sends FormData to `N8N_RFP_WEBHOOK_URL` |
| 4. Uploaded PDF is stored in Supabase Storage for history | ✅ PASS | `actions.ts` uploads to `rfp-uploads` bucket with path `{user_id}/{job_id}/{filename}` |

## Files Created

### Components
- `src/app/(dashboard)/rfps/page.tsx` - Main RFP page
- `src/app/(dashboard)/rfps/actions.ts` - Server actions for upload
- `src/app/(dashboard)/rfps/components/pdf-dropzone.tsx` - PDF file dropzone
- `src/app/(dashboard)/rfps/components/rfp-upload-dialog.tsx` - Upload modal
- `src/app/(dashboard)/rfps/components/rfp-upload-button.tsx` - Button with loading state
- `src/app/(dashboard)/rfps/components/rfp-jobs-list.tsx` - Recent uploads list

### Hooks
- `src/hooks/use-rfp-upload-status.ts` - Supabase Realtime subscription for job status

### N8N Integration
- `src/lib/n8n/rfp-webhook.ts` - Fire-and-forget webhook trigger

### Database
- `supabase/migrations/20260122_rfp_upload_jobs.sql` - Table, RLS policies, Realtime

### Configuration
- `.env.local.example` - Added `N8N_RFP_WEBHOOK_URL` variable

## Manual Setup Required

### 1. Run Database Migration
Execute `supabase/migrations/20260122_rfp_upload_jobs.sql` in Supabase SQL Editor.

### 2. Create Supabase Storage Bucket
1. Go to Storage in Supabase Dashboard
2. Create bucket `rfp-uploads` (private)
3. Add RLS policies:
   - INSERT: `(auth.uid()::text = (storage.foldername(name))[1])`
   - SELECT: `(auth.uid()::text = (storage.foldername(name))[1])`

### 3. Configure Environment Variable
Add to `.env.local`:
```
N8N_RFP_WEBHOOK_URL=https://your-n8n-instance.com/webhook/rfp
```

### 4. Create n8n Workflow
Create a new n8n workflow with:
- Webhook trigger (POST, responds immediately)
- PDF parsing/extraction logic
- Supabase update for job status

## Build Status
✅ Build successful - No TypeScript errors

---
*Verified: 2026-01-22*

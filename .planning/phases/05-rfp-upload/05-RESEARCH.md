# Phase 5: RFP Upload - Research

## Overview

Phase 5 enables users to upload RFP PDF files and trigger the AI matching workflow via n8n.

## Requirements Analysis

From ROADMAP.md:
- RFP-01: User can upload PDF file via drag-and-drop or file picker
- RFP-02: Upload creates job record in Supabase with pending status
- RFP-06: n8n webhook is triggered with job_id (fire-and-forget pattern)

Additional:
- Uploaded PDF is stored in Supabase Storage for history

## Existing Patterns to Follow

### CSV Upload Pattern (Phase 4)
- `csv-dropzone.tsx`: Drag-and-drop file component using react-dropzone
- `csv-upload-dialog.tsx`: Modal dialog for upload with validation
- `csv-upload-button.tsx`: Button with loading state using Realtime subscription
- `use-upload-status.ts`: Hook for Supabase Realtime job tracking
- `actions.ts`: Server action creating job record and triggering webhook
- `webhook.ts`: Fire-and-forget FormData submission to n8n

### Key Differences for RFP
1. File type: PDF instead of CSV
2. No client-side validation (n8n/AI does processing)
3. File stored in Supabase Storage (not just sent to n8n)
4. Different webhook URL (N8N_RFP_WEBHOOK_URL)

## Technical Approach

### Database Schema
```sql
CREATE TABLE rfp_upload_jobs (
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
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);
```

### Supabase Storage
- Bucket: `rfp-uploads`
- Path pattern: `{user_id}/{job_id}/{filename}`
- RLS: Users can only access their own files

### Webhook Payload
```typescript
{
  jobId: string
  attachment_0: File  // PDF file
  fileName: string
  userId: string
  filePath: string  // Storage path for n8n to reference
}
```

## Implementation Order

1. Database migration for rfp_upload_jobs
2. Supabase Storage bucket setup (manual in dashboard)
3. PDF dropzone component
4. RFP upload dialog and button
5. useRfpUploadStatus hook
6. Server actions for upload
7. n8n webhook trigger for RFP
8. RFP page with upload UI

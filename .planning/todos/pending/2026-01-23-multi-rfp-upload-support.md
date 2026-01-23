---
created: 2026-01-23T10:32
title: Support multiple concurrent RFP uploads
area: ui
priority: high
files:
  - src/app/(dashboard)/rfps/components/rfp-upload-button.tsx
  - src/app/(dashboard)/rfps/components/rfp-processing-status.tsx
  - src/app/(dashboard)/rfps/[id]/upload/actions.ts
---

## Problem

Currently, the upload button is disabled while an RFP is processing, preventing users from uploading additional documents. Users need to:

1. Upload multiple RFPs sequentially (one finishes processing, upload another)
2. Bulk upload multiple RFPs in a single file selection

## Solution

### Upload Button Changes
- Remove disabled state during processing
- Allow file selection even when other uploads are in progress
- Support multi-file selection in the file input (`multiple` attribute)

### Progress Animation Changes
- Show up to 3 RFP progress indicators stacked vertically
- Each shows: filename + time-based progress bar
- If > 3 RFPs processing: show "e mais N documento(s) em espera"
- Progress bars should be independent (each tracks its own job)

### Webhook Trigger Changes
- For bulk upload (multiple files selected at once):
  - Trigger n8n webhook for each file
  - Add 2-3 second delay between each webhook call
  - This prevents overwhelming the backend
- For sequential uploads:
  - Normal immediate webhook trigger

### State Management
- Track multiple `rfp_upload_jobs` simultaneously
- Supabase Realtime subscription should handle multiple jobs
- Consider using job priority/queue position

## UI Mockup

```
┌─────────────────────────────────────────┐
│ 📄 documento1.xlsx                      │
│ [████████░░░░░░░░░░] Processando...     │
├─────────────────────────────────────────┤
│ 📄 documento2.xlsx                      │
│ [████░░░░░░░░░░░░░░] Em espera...       │
├─────────────────────────────────────────┤
│ 📄 documento3.xlsx                      │
│ [██░░░░░░░░░░░░░░░░] Em espera...       │
├─────────────────────────────────────────┤
│ e mais 2 documento(s) em espera         │
└─────────────────────────────────────────┘
```

## Technical Considerations

- Max concurrent jobs per user? (consider rate limiting)
- Job queue ordering (FIFO)
- Error handling for individual failures in bulk upload
- Cancel individual job capability?

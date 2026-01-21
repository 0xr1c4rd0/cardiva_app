---
phase: 4
plan: 2
subsystem: inventory
tags: [n8n, webhook, export, xlsx, csv, fire-and-forget]
requires: [04-01]
provides: [webhook-integration, export-functionality, upload-jobs-table]
affects: [04-03]
tech-stack:
  added: [xlsx, file-saver, @types/file-saver]
  patterns: [fire-and-forget-webhook, server-actions, export-utilities]
key-files:
  created:
    - supabase/migrations/20260121_inventory_upload_jobs.sql
    - src/lib/n8n/webhook.ts
    - src/lib/csv/export.ts
    - src/app/(dashboard)/inventory/actions.ts
    - src/app/(dashboard)/inventory/components/export-button.tsx
  modified:
    - package.json
    - package-lock.json
decisions:
  - fire-and-forget: Webhook triggers but does not await response; n8n updates job status
  - job-tracking: Upload jobs stored in database for status tracking
  - admin-only-upload: Only admin role can trigger inventory uploads
metrics:
  duration: 7min
  completed: 2026-01-21
---

# Phase 4 Plan 2: n8n Webhook Integration Summary

**One-liner:** Fire-and-forget n8n webhook for CSV processing with upload job tracking and Excel/CSV export functionality

## Artifacts Created

### Database Migration
| File | Purpose | Key Feature |
|------|---------|-------------|
| `20260121_inventory_upload_jobs.sql` | Track upload processing | Status, row count, error tracking with RLS |

### n8n Integration
| File | Purpose | Key Feature |
|------|---------|-------------|
| `src/lib/n8n/webhook.ts` | Webhook client | Fire-and-forget pattern |
| `src/app/(dashboard)/inventory/actions.ts` | Server action | Creates job record, triggers webhook |

### Export Utilities
| File | Purpose | Key Feature |
|------|---------|-------------|
| `src/lib/csv/export.ts` | Export functions | Auto-sized columns, Excel/CSV formats |
| `export-button.tsx` | Export dropdown | Format selection with toast feedback |

## Decisions Made

### 1. Fire-and-Forget Webhook Pattern
**Context:** n8n processes CSV asynchronously, should not block user
**Decision:** Trigger webhook without awaiting response; n8n updates job status when complete
**Rationale:** Better UX - user sees immediate feedback, processing continues in background

### 2. Job Tracking Table
**Context:** Need to track upload processing status
**Decision:** Create `inventory_upload_jobs` table with status enum (pending, processing, completed, failed, partial)
**Rationale:** Enables status display and error tracking per upload

### 3. Admin-Only Upload Permission
**Context:** Inventory uploads are sensitive operations
**Decision:** Check `getUserRole() === 'admin'` before allowing upload
**Rationale:** Follows existing RBAC pattern from Phase 2

### 4. Client-Side Export
**Context:** Export needs to generate files for download
**Decision:** Use xlsx library for generation, file-saver for download trigger
**Rationale:** No server-side file generation needed; browser handles completely

## Dependencies Added

| Package | Version | Purpose |
|---------|---------|---------|
| xlsx | ^0.18.5 | Excel/CSV generation |
| file-saver | ^2.0.5 | Browser file download |
| @types/file-saver | dev | TypeScript types |

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 6dbaeba | feat | Add inventory_upload_jobs table migration |
| addfa5a | feat | Add n8n webhook integration and upload action |
| ae4336a | feat | Add Excel/CSV export functionality |

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Instructions

### 1. Run Migration in Supabase Dashboard

Go to Supabase Dashboard > SQL Editor and run the contents of:
```
supabase/migrations/20260121_inventory_upload_jobs.sql
```

### 2. Configure Environment Variables

Add to `.env.local`:
```bash
# n8n Webhook Configuration
N8N_INVENTORY_WEBHOOK_URL=https://your-n8n-instance.com/webhook/inventory-upload
N8N_WEBHOOK_SECRET=your-optional-webhook-secret  # Optional
```

### 3. Configure n8n Workflow

Your n8n workflow should:
1. Receive POST webhook with JSON body containing:
   - `jobId`: UUID of the upload job
   - `csvContent`: String content of the CSV file
   - `fileName`: Original filename
   - `userId`: UUID of the uploading user
   - `rowCount`: Number of data rows
   - `timestamp`: ISO timestamp

2. Process the CSV and insert into `artigos` table

3. Update `inventory_upload_jobs` table with:
   - `status`: 'completed' or 'failed' or 'partial'
   - `processed_rows`: Number of rows successfully processed
   - `error_message`: Any error details
   - `completed_at`: Completion timestamp

Use service_role key in n8n for Supabase updates.

## Next Phase Readiness

**Ready for 04-03:** Yes

**Integration points:**
- `triggerInventoryUpload` server action ready for use
- `ExportButton` component ready to add to inventory page
- Job status stored in `inventory_upload_jobs` for realtime subscription

**Prerequisites for 04-03:**
- Migration must be run before testing
- n8n webhook URL must be configured
- Integrate CSVUploadButton with server action
- Add realtime subscription for job status updates

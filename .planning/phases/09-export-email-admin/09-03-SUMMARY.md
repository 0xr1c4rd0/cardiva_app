# Phase 9 Plan 03: ExportEmailDialog Summary

## One-liner
ExportEmailDialog with 4 adaptive recipient modes (no-defaults, locked, add-only, replaceable) based on admin app_settings

## Execution Details

**Duration:** 6 minutes
**Completed:** 2026-01-25
**Status:** Complete

## Commits

| Commit | Description | Files |
|--------|-------------|-------|
| 13a9e41 | Add AppSettings types and getEmailRecipientMode | src/types/app-settings.ts |
| dee9588 | Create ExportEmailDialog with adaptive recipient modes | export-email-dialog.tsx, export-actions.ts |
| 5160b7b | Integrate ExportEmailDialog into ConfirmationSummary | confirmation-summary.tsx |

## Files Modified

**Created:**
- `src/types/app-settings.ts` - AppSettings interface, EmailRecipientMode type, getEmailRecipientMode function
- `src/app/(dashboard)/rfps/components/export-email-dialog.tsx` - Complete email dialog component

**Modified:**
- `src/app/(dashboard)/rfps/[id]/matches/export-actions.ts` - Removed user_id filter (per 10.1-04 all users access all jobs)
- `src/app/(dashboard)/rfps/components/confirmation-summary.tsx` - Integrated ExportEmailDialog

## Implementation Details

### Task 1: AppSettings Types
Created TypeScript types for the app_settings table:
- `AppSettings` interface matching database schema
- `EmailRecipientMode` type union for 4 behavior modes
- `getEmailRecipientMode()` function that derives mode from settings

### Task 2: ExportEmailDialog Component
Built complete email dialog with:
- Fetches app_settings on dialog open (uses Supabase client)
- Loading state while fetching settings
- 4 behavior modes:
  - **no-defaults**: Empty input, user adds 1-10 emails
  - **locked**: Read-only chips only, no input
  - **add-only**: Locked default chips + input for additional
  - **replaceable**: Removable default chips + input
- Default emails shown as `secondary` badge variant
- Additional user emails shown as `outline` badge variant
- Max 10 emails total enforcement
- Email validation (must contain @)
- Duplicate prevention
- Export mode selection (matched only vs all products)
- Summary stats display (matches vs no-match count)
- Sends via sendExportEmail server action

### Task 3: Integration
- Imported ExportEmailDialog into ConfirmationSummary
- Replaced placeholder with actual component
- Passes items and jobId props

### Deviation: export-actions.ts Fix
Fixed the sendExportEmail server action to remove the user_id filter that was leftover from before phase 10.1-04 (multi-user RFP access). Now all authenticated users can send exports for any job, consistent with the RLS policies.

## Verification Results

- [x] TypeScript compiles without errors
- [x] Build succeeds
- [x] AppSettings type matches app_settings table schema
- [x] getEmailRecipientMode returns correct mode based on settings
- [x] ExportEmailDialog fetches settings on open
- [x] All 4 behavior modes supported
- [x] Email chips render correctly (secondary for defaults, outline for additional)
- [x] Max 10 emails enforced
- [x] Integration complete in ConfirmationSummary

## Dependencies Satisfied

- 09-01: app_settings table and export_column_config migration (provides settings schema)
- 09-02: Export dropdown split (provides emailDialogOpen state in ConfirmationSummary)

## Notes for Future

- The sendExportEmail server action sends comma-separated emails; n8n webhook must handle multiple recipients
- Email dialog resets additional emails when closed but preserves defaults from settings
- If app_settings fetch fails, mode defaults to 'no-defaults' (empty recipients)

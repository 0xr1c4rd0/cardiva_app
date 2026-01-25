---
phase: 09-export-email-admin
plan: 05
subsystem: admin
tags: [admin, settings, email, export, inventory, configuration]
dependency-graph:
  requires: ["09-01"]
  provides: ["admin-settings-page", "email-config-ui", "export-fields-config", "inventory-fields-config"]
  affects: ["users-wanting-to-configure-app"]
tech-stack:
  added: ["@radix-ui/react-collapsible"]
  patterns: ["collapsible-sections", "admin-config-ui"]
key-files:
  created:
    - src/app/(dashboard)/admin/settings/page.tsx
    - src/app/(dashboard)/admin/settings/actions.ts
    - src/app/(dashboard)/admin/settings/email-settings-section.tsx
    - src/app/(dashboard)/admin/settings/export-fields-section.tsx
    - src/app/(dashboard)/admin/settings/inventory-fields-section.tsx
    - src/components/ui/collapsible.tsx
  modified:
    - src/components/layout/app-sidebar.tsx
decisions:
  - title: "Collapsible sections for cleaner UI"
    rationale: "Three configuration sections can be overwhelming - collapsible allows focus"
  - title: "Email and Export sections start open, Inventory starts closed"
    rationale: "Email and export are more frequently used, inventory is less common"
  - title: "Sync button for export columns"
    rationale: "Allows admins to refresh column list after schema changes"
metrics:
  duration: 8 min
  completed: 2026-01-25
---

# Phase 09 Plan 05: Admin Settings Page Summary

Admin settings page with email configuration, export fields, and inventory fields management.

## One-liner

Admin settings page at /admin/settings with three collapsible sections for email recipients, export column config, and inventory column config.

## What Was Built

### Server Actions (actions.ts)
- `updateEmailSettings`: Updates app_settings table with email config
- `updateExportColumnConfig`: Batch updates export_column_config rows
- `updateInventoryColumnConfig`: Batch updates inventory_column_config rows
- `syncExportColumns`: Calls sync_export_columns() RPC to refresh column list

### EmailSettingsSection Component
- Collapsible card with email icon
- Default recipients shown as removable badges
- Input field to add new emails with validation
- Toggle switches for:
  - `email_user_can_edit`: Allow users to modify recipients
  - `email_defaults_replaceable`: Allow removing default recipients
- Save button with loading state

### ExportFieldsSection Component
- Collapsible card with spreadsheet icon
- Two tables for rfp_items and rfp_match_suggestions columns
- Each row shows:
  - Column name (readonly, monospace)
  - Display name (editable input)
  - Visible toggle (switch)
  - Display order (number input)
- Sync Columns button to refresh from database schema
- Save button with loading state

### InventoryFieldsSection Component
- Collapsible card with package icon (starts collapsed)
- Single table for inventory_column_config columns
- Same row structure as export fields
- Save button with loading state

### Admin Settings Page
- Server component at /admin/settings
- Fetches all three config tables
- Renders all three section components with initial data
- Page title "Definicoes" with description

### Sidebar Update
- Added "Definicoes" link to admin section
- Points to /admin/settings
- Uses existing Settings icon

## Commits

| Hash | Description |
|------|-------------|
| 3d83257 | Server actions for admin settings |
| 0bd864e | EmailSettingsSection component |
| 3a750bb | ExportFieldsSection component |
| 3309a95 | InventoryFieldsSection component |
| 0ecdb8a | Admin settings page with three sections |
| 4c7f2c6 | Sidebar Definicoes link |

## Deviations from Plan

### Added Collapsible Component
- **Reason**: Component was not present in shadcn/ui installation
- **Action**: Added via `npx shadcn@latest add collapsible`
- **Impact**: Added @radix-ui/react-collapsible dependency

## Dependencies Added

- `@radix-ui/react-collapsible`: For collapsible section UI

## Files Created

1. `src/app/(dashboard)/admin/settings/actions.ts` - Server actions
2. `src/app/(dashboard)/admin/settings/email-settings-section.tsx` - Email config UI
3. `src/app/(dashboard)/admin/settings/export-fields-section.tsx` - Export fields UI
4. `src/app/(dashboard)/admin/settings/inventory-fields-section.tsx` - Inventory fields UI
5. `src/app/(dashboard)/admin/settings/page.tsx` - Main settings page
6. `src/components/ui/collapsible.tsx` - Collapsible UI component

## Files Modified

1. `src/components/layout/app-sidebar.tsx` - Added settings link to admin section

## Verification Results

- [x] TypeScript compiles without errors
- [x] All files created in correct locations
- [x] Server actions exported correctly
- [x] Sidebar shows Definicoes link in admin section
- [x] All sections use Collapsible component

## Next Steps

- Run database migrations (09-01) if not already done
- Test save functionality with real database
- Visual verification of page layout and interactions

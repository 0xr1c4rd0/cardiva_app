---
phase: 09-export-email-admin
plan: 01
subsystem: database
tags: [migrations, admin-settings, export-config, rls]
completed: 2026-01-25
duration: 5min

dependency-graph:
  requires: []
  provides:
    - app_settings table with email configuration
    - export_column_config table with sync function
  affects:
    - 09-03 (ExportEmailDialog)
    - 09-04 (Export field configuration)
    - 09-05 (Admin settings page)

tech-stack:
  added: []
  patterns:
    - Single-row pattern for app settings (CHECK constraint)
    - Auto-discovery function for column configuration
    - UNIQUE constraint on composite key (source_table, column_name)

key-files:
  created:
    - supabase/migrations/20260125_app_settings.sql
    - supabase/migrations/20260125_export_column_config.sql
  modified: []

decisions:
  - id: 09-01-01
    area: database
    choice: "Single-row pattern with CHECK (id = 1) for app_settings"
    rationale: "Ensures only one settings row exists, simplifies queries (no WHERE clause needed)"
  - id: 09-01-02
    area: database
    choice: "sync_export_columns() iterates ARRAY['rfp_items', 'rfp_match_suggestions']"
    rationale: "Auto-discovers columns from both tables, reusable after schema changes"
  - id: 09-01-03
    area: security
    choice: "UPDATE-only policy for app_settings (no INSERT/DELETE)"
    rationale: "Single row inserted during migration, prevents accidental deletion"
---

# Phase 09 Plan 01: Database Migrations Summary

**One-liner:** Two SQL migrations for app_settings (single-row email config) and export_column_config (field selection with auto-discovery)

## Task Completion

| Task | Name | Status | Commit | Files |
|------|------|--------|--------|-------|
| 1 | Create app_settings migration | Done | 69916af | 20260125_app_settings.sql |
| 2 | Create export_column_config migration | Done | e4a79a6 | 20260125_export_column_config.sql |

## What Was Built

### app_settings Table
- Single-row pattern enforced via `CHECK (id = 1)` constraint
- Email configuration columns:
  - `email_default_recipients TEXT[]` - Default email addresses for export
  - `email_user_can_edit BOOLEAN` - Whether users can modify recipients
  - `email_defaults_replaceable BOOLEAN` - Whether defaults can be replaced entirely
- RLS policies:
  - SELECT: All authenticated users
  - UPDATE: Admin only (no INSERT/DELETE to protect single row)
- `updated_at` trigger and `updated_by` tracking

### export_column_config Table
- Stores column visibility and display configuration for RFP exports
- Columns:
  - `source_table` - 'rfp_items' or 'rfp_match_suggestions'
  - `column_name` - Actual database column name
  - `display_name` - Excel header text
  - `visible` - Include in export?
  - `display_order` - Column order in export
  - `column_type` - text/number/currency/date for formatting
- UNIQUE constraint on `(source_table, column_name)`
- RLS policies:
  - SELECT: All authenticated users
  - ALL: Admin only

### sync_export_columns() Function
- Auto-discovers columns from rfp_items and rfp_match_suggestions
- Converts snake_case to Title Case for display names
- Auto-detects column types from database schema
- Hides system columns by default (id, created_at, updated_at, embedding)
- Uses `ON CONFLICT DO NOTHING` for idempotent execution

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

After this plan completes, the user must:

1. **Run migrations in Supabase Dashboard**
   - Go to Supabase Dashboard -> SQL Editor
   - Run `supabase/migrations/20260125_app_settings.sql`
   - Run `supabase/migrations/20260125_export_column_config.sql`

2. **Verify tables created**
   ```sql
   SELECT * FROM app_settings;
   SELECT * FROM export_column_config ORDER BY source_table, display_order;
   ```

## Next Phase Readiness

**Ready for:**
- 09-03: ExportEmailDialog can query app_settings for defaults
- 09-04: Export field configuration can use export_column_config
- 09-05: Admin settings page can update both tables

**Blockers:** None - migrations are ready for execution.

## Verification Evidence

```
# Both migration files exist
ls supabase/migrations/20260125_*.sql
20260125_app_settings.sql
20260125_export_column_config.sql

# Single-row pattern
grep "CHECK (id = 1)" supabase/migrations/20260125_app_settings.sql
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),

# UNIQUE constraint
grep "UNIQUE" supabase/migrations/20260125_export_column_config.sql
  UNIQUE(source_table, column_name)

# RLS enabled
grep "ENABLE ROW LEVEL SECURITY" supabase/migrations/*.sql
20260125_app_settings.sql:ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
20260125_export_column_config.sql:ALTER TABLE public.export_column_config ENABLE ROW LEVEL SECURITY;

# Admin-only write policies
grep "auth.jwt() ->> 'user_role'" supabase/migrations/20260125_*.sql
(auth.jwt() ->> 'user_role') = 'admin' [multiple occurrences]
```

## Commits

1. `69916af` - feat(09-01): add app_settings table with single-row pattern
2. `e4a79a6` - feat(09-01): add export_column_config table with sync function

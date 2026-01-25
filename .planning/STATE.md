# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2025-01-21)

**Core value:** Users can upload an RFP, see suggested product matches, accept/reject interactively, and export confirmed matches
**Current focus:** Phase 9 - Export, Email & Admin (Ready to plan)

## Current Position

Phase: 9 (Export, Email & Admin)
Plan: 0 of 6 in current phase
Status: Ready to plan
Last activity: 2026-01-25 - ROADMAP updated with expanded Phase 9 scope

Progress: [=========---] 80%

## Performance Metrics

**Velocity:**
- Total plans completed: 19
- Average duration: 7.8 min
- Total execution time: 2.5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3 | 42min | 14min |
| 02-authentication | 3 | 32min | 11min |
| 03-inventory-view | 2 | 10min | 5min |
| 04-inventory-management | 3 | 24min | 8min |
| 06-processing-status | 1 | 6min | 6min |
| 07-match-review | 2 | 10min | 5min |
| 10.1-rfp-upload-polish | 5 | 28min | 6min |

**Recent Trend:**
- Last 5 plans: 10.1-01 (4min), 10.1-02 (5min), 10.1-03 (4min), 10.1-04 (9min), 10.1-05 (6min)
- Trend: Phase 10.1 polish plans executing efficiently

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 10 phases derived from 47 requirements with comprehensive depth
- [Roadmap]: n8n remains backend, triggered via fire-and-forget webhooks
- [Roadmap]: Supabase Realtime for status updates (no polling)
- [Phase 1]: 3 plans in 2 waves - scaffold (wave 1), design system + layout (wave 2)
- [Phase 1]: Tailwind v4 @theme directive for design tokens (not tailwind.config.js)
- [Phase 1]: OKLCH color format for shadcn/ui compatibility
- [01-01]: Kept Geist font configuration from Next.js defaults
- [01-01]: cn() utility pattern established for Tailwind class merging
- [01-02]: Dark sidebar by default (--sidebar variables use gray-900)
- [01-02]: New York shadcn/ui style selected for cleaner aesthetics
- [01-03]: @supabase/ssr patterns for SSR-compatible clients
- [01-03]: Sidebar state persists via cookie (sidebar_state) for SSR hydration
- [01-03]: Dashboard route group handles root path (/)
- [02-01]: useActionState for simpler form handling vs react-hook-form
- [02-01]: 876000h ban_duration as pending approval state (100 years)
- [02-01]: Manual SQL execution via Dashboard for v1 simplicity
- [02-01]: Disable email confirmation for simpler approval flow
- [02-01]: Custom Access Token Hook injects role into JWT for RBAC
- [02-02]: Banned user detection via error.message string check
- [02-02]: Defense in depth - getUser() validation in both middleware and layout
- [02-02]: User initials from email for avatar fallback display
- [02-02]: Server component UserMenu accesses auth state directly
- [02-03]: JWT role extraction via token payload parsing for RBAC
- [02-03]: Email confirmation route with verifyOtp for password reset
- [02-03]: Admin actions via client components wrapping server actions
- [02-03]: Sidebar async server component for role-based rendering
- [03-01]: TanStack Table with manualPagination for server-side control
- [03-01]: nuqs with { shallow: false } for server re-render on URL change
- [03-01]: Artigo type matches artigos table schema
- [03-02]: 300ms debounce on search input via useDebouncedCallback
- [03-02]: manualSorting in TanStack Table for server-side sorting
- [03-02]: Supabase .or() with .ilike() for multi-field search
- [03-02]: Category filter populated from distinct values in database
- [04-01]: UTF-8/ISO-8859-1 encoding fallback for Portuguese CSV files
- [04-01]: Zod passthrough schema for dynamic column structure
- [04-01]: Error/warning separation in CSV validation
- [04-02]: Fire-and-forget webhook pattern for n8n integration
- [04-02]: Job tracking table for upload status persistence
- [04-02]: Admin-only permission for inventory uploads
- [04-03]: PermissionGate receives userRole from server component
- [04-03]: CSVUploadButton imports action directly
- [04-03]: Export for all users, Upload for admin only
- [06-01]: Progress capped at 95% to indicate ongoing work
- [06-01]: 4-minute midpoint for progress estimation (3-5 min range)
- [06-01]: Indeterminate animation for pending status
- [06-01]: Toast duration: Infinity for processing state
- [07-01]: Types in src/types/rfp.ts for reusability across phases
- [07-01]: Server Actions over API routes for simpler cache invalidation
- [07-01]: Nested Supabase select query to avoid N+1 problem
- [07-01]: Client-side sort for similarity_score (Supabase limits nested ordering)
- [07-02]: useTransition for Server Action pending state (React 18+ pattern)
- [07-02]: Opacity-based visual distinction (70%) for reviewed items
- [07-02]: Three-column grid for match data: codigo_spms, artigo, descricao
- [07-02]: Collapsed summary shows accepted match info inline
- [10.1-01]: nuqs v2+ requires startTransition with shallow: false for server re-render
- [10.1-01]: useTransition provides isPending instead of manual isNavigating state
- [10.1-04]: All authenticated users can view/edit/delete any RFP (team collaboration)
- [10.1-04]: INSERT policy still requires user_id = auth.uid() (uploader tracking)
- [10.1-04]: Toast notifications only for user's own uploads (avoid spam)
- [10.1-04]: Realtime channel rfp_jobs_all instead of rfp_jobs_${user.id}
- [10.1-03]: Sequential processing with 2.5s delay prevents n8n overload
- [10.1-03]: Upload button never disabled - users can always queue more files
- [10.1-03]: Max 3 visible progress bars to avoid UI clutter
- [10.1-03]: Dialog closes immediately after queueing, no wait for completion
- [10.1-04]: updateLastEditedBy helper function for tracking changes
- [10.1-02]: 3-state KPI model: Por Rever (pending decisions), Revistos (addressed), Confirmados (confirmed_at set)
- [10.1-02]: Confirmation is explicit user action before export readiness
- [10.1-02]: Removed user_id filter from KPI queries for multi-user visibility
- [10.1-05]: Use email only for user display (profiles table has no full_name column)
- [10.1-05]: formatUserEmail helper: email -> readable name (joao.silva@example.com -> Joao Silva)
- [10.1-05]: Inline button styling for sort headers (matching SortableHeader pattern)

### Pending Todos

Phase 10.1 (RFP Upload Polish) complete - all 7 todos resolved:

| Priority | Title | Area | Status |
|----------|-------|------|--------|
| critical | Fix match review table sorting not applying | ui | DONE (10.1-01) |
| high | Fix "Por Rever" KPI calculation | ui | DONE (10.1-02) |
| high | Rename "Concluídos" to "Concursos Revistos" KPI | ui | DONE (10.1-02) |
| high | Support multiple concurrent RFP uploads | ui | DONE (10.1-03) |
| high | Make all RFPs visible to all users | database | DONE (10.1-04) |
| medium | Show uploader email on RFP list | ui | DONE (10.1-05) |
| medium | Align inventory table design with matches table | ui | DONE (10.1-05) |

See `.planning/todos/pending/` for full details.

### Blockers/Concerns

- User needs to configure .env.local with Supabase credentials (see 01-03-SUMMARY.md)
- User must set SUPABASE_SERVICE_ROLE_KEY for admin operations (see 02-01-SUMMARY.md)
- User must set NEXT_PUBLIC_SITE_URL for password reset emails (see 02-03-SUMMARY.md)
- User must run SQL migration in Supabase Dashboard (see supabase/migrations/20260121_profiles_and_auth_hook.sql)
- User must enable Custom Access Token Hook in Supabase Dashboard
- User must disable email confirmation in Supabase Dashboard
- User must update password reset email template in Supabase Dashboard (see 02-03-SUMMARY.md)
- Admin users must be created manually by updating role in profiles table
- User must run inventory_upload_jobs migration (see supabase/migrations/20260121_inventory_upload_jobs.sql)
- User must configure N8N_INVENTORY_WEBHOOK_URL in .env.local
- User must run rfp_match_results migration (see supabase/migrations/20260122_rfp_match_results.sql)
- User must run multi-user RFP access migration (see supabase/migrations/20260124_multi_user_rfp_access.sql)
- User must run confirmed_at migration (see supabase/migrations/20260124_add_confirmed_at.sql)

## Session Continuity

Last session: 2026-01-25
Stopped at: ROADMAP updated with expanded Phase 9 scope (design complete)
Resume file: docs/plans/2026-01-25-phase9-export-email-admin-design.md

## Phase 1 Plans

| Plan | Wave | Objective | Status |
|------|------|-----------|--------|
| 01-01 | 1 | Project scaffold (Next.js 16, dependencies, folders) | Complete |
| 01-02 | 2 | Design system (Tailwind v4 tokens, shadcn/ui) | Complete |
| 01-03 | 2 | Supabase client + dashboard layout with sidebar | Complete |

**Wave execution:**
- Wave 1: 01-01 (independent, no dependencies) - COMPLETE
- Wave 2: 01-02, 01-03 (depend on 01-01, can run in parallel) - COMPLETE

**Phase 1 complete.**

## Phase 2 Plans

| Plan | Wave | Objective | Status |
|------|------|-----------|--------|
| 02-01 | 1 | Registration with auto-ban approval workflow | Complete |
| 02-02 | 2 | Login flow with approval check | Complete |
| 02-03 | 3 | Password reset + admin user management | Complete |

**Wave execution:**
- Wave 1: 02-01 - COMPLETE
- Wave 2: 02-02 - COMPLETE
- Wave 3: 02-03 - COMPLETE

**Phase 2 complete.** All authentication requirements (AUTH-01 through AUTH-09) satisfied.

## Phase 3 Plans

| Plan | Wave | Objective | Status |
|------|------|-----------|--------|
| 03-01 | 1 | Inventory page with TanStack Table and pagination | Complete |
| 03-02 | 2 | Search, sort, and filter functionality | Complete |

**Wave execution:**
- Wave 1: 03-01 - COMPLETE
- Wave 2: 03-02 - COMPLETE

**Phase 3 complete.** All inventory view requirements (INV-01 through INV-05, UI-04, UI-06) satisfied.

## Phase 4 Plans

| Plan | Wave | Objective | Status |
|------|------|-----------|--------|
| 04-01 | 1 | CSV upload component with client-side parsing and validation | Complete |
| 04-02 | 2 | n8n webhook integration for CSV processing | Complete |
| 04-03 | 3 | Permission integration and UI assembly | Complete |

**Wave execution:**
- Wave 1: 04-01 - COMPLETE
- Wave 2: 04-02 - COMPLETE
- Wave 3: 04-03 - COMPLETE

**Phase 4 complete.** All inventory management requirements (INV-06 through INV-10) satisfied:
- CSV upload with validation
- n8n webhook integration for background processing
- Admin-only upload with user export
- Job tracking and status persistence

## Phase 6 Plans

| Plan | Wave | Objective | Status |
|------|------|-----------|--------|
| 06-01 | 1 | Processing status UI with progress and notifications | Complete |

**Wave execution:**
- Wave 1: 06-01 - COMPLETE

**Phase 6 complete.** Processing status UI requirements satisfied:
- Time-based progress indicator with 95% cap
- Prominent processing status card
- Real-time job list updates via Supabase Realtime
- Enhanced toast notifications with action buttons

## Phase 7 Plans

| Plan | Wave | Objective | Status |
|------|------|-----------|--------|
| 07-01 | 1 | Types, Server Actions, and page data fetching | Complete |
| 07-02 | 2 | Interactive match review components | Complete |

**Wave execution:**
- Wave 1: 07-01 - COMPLETE
- Wave 2: 07-02 - COMPLETE

**Phase 7 complete.** All match review requirements (MATCH-01 through MATCH-05, MATCH-08) satisfied:
- TypeScript types for RFP items and match suggestions
- Server Actions for accept/reject with cache invalidation
- ConfidenceBar, MatchSuggestionRow, RFPItemCard components
- Full accept/reject workflow with visual feedback and collapse behavior

## Phase 10.1 Plans

| Plan | Wave | Objective | Status |
|------|------|-----------|--------|
| 10.1-01 | 1 | Fix match review table sorting | Complete |
| 10.1-02 | 1 | Fix KPI calculations | Complete |
| 10.1-03 | 1 | Support multiple concurrent RFP uploads | Complete |
| 10.1-04 | 1 | Make all RFPs visible to all users | Complete |
| 10.1-05 | 2 | Show uploader email and align inventory table | Complete |

**Wave execution:**
- Wave 1: 10.1-01, 10.1-02, 10.1-03, 10.1-04 - COMPLETE
- Wave 2: 10.1-05 - COMPLETE

**Phase 10.1 complete.** All polish todos resolved:
- Match review table sorting fixed
- KPI calculations corrected
- Multiple concurrent RFP uploads supported
- Multi-user RFP access enabled
- Uploader/editor display on RFP list
- Inventory table styling aligned with match-review-table

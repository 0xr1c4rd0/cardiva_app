# Roadmap: Cardiva RFP Matching App

## Overview

This roadmap transforms the Cardiva RFP Matching App from concept to functional v1 across 10 phases. The journey begins with establishing the project foundation and design system, progresses through authentication and inventory management, then delivers the core RFP upload and matching workflow. Final phases add export capabilities, history tracking, and polish. Each phase delivers an independently verifiable capability, with the critical path being: Foundation -> Auth -> Inventory -> RFP Processing -> Match Review -> Export.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Project scaffold, Supabase setup, design system
- [x] **Phase 2: Authentication** - User registration, login, session management, RBAC
- [x] **Phase 3: Inventory View** - Product listing with pagination, sorting, search, filter
- [x] **Phase 4: Inventory Management** - CSV upload, validation, export, permissions
- [x] **Phase 5: RFP Upload** - PDF upload, webhook trigger, file storage
- [x] **Phase 6: Processing Status** - Real-time status updates, notifications
- [x] **Phase 7: Match Review** - Display results, accept/reject individual matches
- [x] **Phase 8: Bulk Operations** - Manual correction, confirmation step (scope modified)
- [ ] **Phase 9: Export, Email & Admin** - Excel export, email send, admin configuration (expanded scope)
- [ ] **Phase 10: History & Polish** - RFP history, search, re-download, final polish
- [x] **Phase 10.1: RFP Upload Polish** - INSERTED: Multi-upload, multi-user, KPI fixes, sorting fix

## Phase Details

### Phase 1: Foundation
**Goal**: Establish project scaffold with design system and Supabase integration ready for feature development
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, UI-02, UI-03, UI-07
**Success Criteria** (what must be TRUE):
  1. Next.js 16 app runs locally with App Router configured
  2. Gusto-inspired design tokens (teal primary, coral accents) are applied globally
  3. Left sidebar navigation renders with icons and navigation structure
  4. Application is responsive on desktop (1024px+) with proper layout
  5. Supabase client is configured and can connect to database
**Plans**: 3 plans in 2 waves

Plans:
- [x] 01-01-PLAN.md — Project scaffold with Next.js 16, dependencies, folder structure
- [x] 01-02-PLAN.md — Design system tokens (Tailwind v4 @theme) and shadcn/ui components
- [x] 01-03-PLAN.md — Supabase client setup and dashboard layout with sidebar

### Phase 2: Authentication
**Goal**: Users can securely access accounts with role-based permissions and manual approval workflow
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09
**Success Criteria** (what must be TRUE):
  1. User can register with email/password and account is created in disabled state
  2. User can log in with email/password after admin approval
  3. User session persists across browser refresh and navigation
  4. User can log out from any page in the application
  5. User can reset password via email link
  6. Admin users can access admin-only features; regular users cannot
**Plans**: 3 plans in 3 waves

Plans:
- [x] 02-01-PLAN.md — Supabase Auth setup, profiles table, registration with auto-ban
- [x] 02-02-PLAN.md — Login, session persistence, route protection, logout
- [x] 02-03-PLAN.md — Password reset flow, RBAC utilities, admin user management

### Phase 3: Inventory View
**Goal**: Users can browse and search the 20k+ product inventory efficiently
**Depends on**: Phase 2
**Requirements**: INV-01, INV-02, INV-03, INV-04, INV-05, UI-04, UI-06
**Success Criteria** (what must be TRUE):
  1. User can view product listing from artigos table on inventory page
  2. Product listing paginates smoothly with 20k+ items (no performance issues)
  3. User can sort products by clicking column headers
  4. User can search products by name, code, or attributes with results updating
  5. User can filter products by category/attributes
  6. Loading states display during data fetches; empty states show when no results
**Plans**: 2 plans in 2 waves

Plans:
- [x] 03-01-PLAN.md — Inventory page with TanStack Table and server-side pagination
- [x] 03-02-PLAN.md — Search, sort, and filter functionality with URL state

### Phase 4: Inventory Management
**Goal**: Authorized users can update inventory via CSV upload with validation
**Depends on**: Phase 3
**Requirements**: INV-06, INV-07, INV-08, INV-09, INV-10
**Success Criteria** (what must be TRUE):
  1. User can upload CSV file via drag-and-drop or file picker
  2. CSV validation runs and displays errors before import proceeds
  3. CSV upload triggers n8n workflow for processing
  4. User can export inventory to CSV/Excel format
  5. Only users with inventory permission can access upload/modify features
**Plans**: 3 plans in 3 waves

Plans:
- [x] 04-01-PLAN.md — CSV upload component with drag-drop, parsing, and validation
- [x] 04-02-PLAN.md — n8n webhook integration, job tracking, and export functionality
- [x] 04-03-PLAN.md — Permission-based access control and inventory page integration

### Phase 5: RFP Upload
**Goal**: Users can upload RFP PDFs and trigger the matching workflow
**Depends on**: Phase 4
**Requirements**: RFP-01, RFP-02, RFP-06
**Success Criteria** (what must be TRUE):
  1. User can upload PDF file via drag-and-drop or file picker
  2. Upload creates job record in Supabase with pending status
  3. n8n webhook is triggered with job_id (fire-and-forget pattern)
  4. Uploaded PDF is stored in Supabase Storage for history
**Plans**: 3 plans in 1 wave

Plans:
- [x] 05-01: RFP upload page with PDF dropzone
- [x] 05-02: Job creation and n8n webhook trigger
- [x] 05-03: Supabase Storage integration for PDFs

### Phase 6: Processing Status
**Goal**: Users can track RFP processing status in real-time during the 3-5 minute wait
**Depends on**: Phase 5
**Requirements**: RFP-03, RFP-04, RFP-05, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. Processing status (pending, processing, complete, error) displays in UI
  2. Progress indicator shows during 3-5 minute processing wait
  3. User receives toast notification when processing completes
  4. Status updates arrive via Supabase Realtime (no polling)
  5. User can navigate away and return to see current status
**Plans**: 1 plan in 1 wave

Plans:
- [x] 06-01-PLAN.md — Processing status card, real-time job list updates, enhanced toast notifications

### Phase 7: Match Review
**Goal**: Users can view extracted RFP items with suggested matches and make accept/reject decisions
**Depends on**: Phase 6
**Requirements**: MATCH-01, MATCH-02, MATCH-03, MATCH-04, MATCH-05, MATCH-08
**Success Criteria** (what must be TRUE):
  1. Match results page displays all extracted RFP items
  2. Each RFP item shows list of potential inventory matches
  3. Confidence score displays visually for each match suggestion
  4. User can accept a suggested match for an item
  5. User can reject a suggested match for an item
  6. Review status (pending, accepted, rejected) is tracked and displayed per item
**Plans**: 2 plans in 2 waves

Plans:
- [x] 07-01-PLAN.md — Types, match review page with data fetching, Server Actions for accept/reject
- [x] 07-02-PLAN.md — Interactive components: ConfidenceBar, MatchSuggestionRow, RFPItemCard with collapse behavior

### Phase 8: Bulk Operations (Modified Scope)
**Goal**: Users can manually correct wrong matches and must confirm all selections before export
**Depends on**: Phase 7
**Requirements**: MATCH-07, MATCH-09 (MATCH-06 bulk select removed from scope)
**Success Criteria** (what must be TRUE):
  1. ~~User can select multiple items and accept/reject all at once~~ (REMOVED - simplified workflow)
  2. User can manually search and select a different match for any item
  3. Confirmation step requires user to review all selections before proceeding
  4. User cannot proceed to export until all items have a decision
**Plans**: 2 plans in 2 waves

Plans:
- [x] 08-01-PLAN.md — Server Actions for inventory search and manual match setting
- [x] 08-02-PLAN.md — ManualMatchDialog, ConfirmationSummary, and page integration

### Phase 9: Export, Email & Admin (Expanded Scope)
**Goal**: Users can export/email matches; admins can configure email recipients, export fields, inventory fields, and manage users
**Depends on**: Phase 8
**Requirements**: EXP-01, EXP-02, EXP-03, EXP-04, EXP-05, plus new admin features
**Success Criteria** (what must be TRUE):
  1. User can download match results as Excel (.xlsx) file via separate dialog
  2. User can send match results via email via separate dialog
  3. Email recipients configurable by admin (preset, editable, replaceable modes)
  4. Export fields configurable by admin (select columns, display names, order)
  5. Inventory display fields configurable by admin
  6. Admin can change user roles (user <-> admin)
  7. Admin can delete users (except self)
  8. Export dropdown replaces single button in confirmation summary
**Plans**: 6 plans in 2 waves
**Design**: See `docs/plans/2026-01-25-phase9-export-email-admin-design.md`

Plans:
- [ ] 09-01-PLAN.md — Database migrations: app_settings, export_column_config, sync functions (Wave 1)
- [ ] 09-02-PLAN.md — Split ExportDialog into dropdown + ExportDownloadDialog (Wave 1)
- [ ] 09-03-PLAN.md — ExportEmailDialog with recipient configuration (Wave 2, depends on 09-01, 09-02)
- [ ] 09-04-PLAN.md — Export field configuration: update rfp-export.ts to use DB config (Wave 2, depends on 09-01)
- [ ] 09-05-PLAN.md — Admin settings page: email + export fields + inventory fields sections (Wave 2, depends on 09-01)
- [ ] 09-06-PLAN.md — Admin users enhancements: role dropdown + delete button (Wave 1)

### Phase 10: History & Polish
**Goal**: Users can access past RFPs and the application feels polished and production-ready
**Depends on**: Phase 9
**Requirements**: HIST-01, HIST-02, HIST-03, HIST-04, UI-04, UI-05, UI-06
**Success Criteria** (what must be TRUE):
  1. User can view list of all past RFP submissions with status
  2. User can view match history for any past RFP
  3. User can search/filter past RFPs by name or date
  4. User can re-download previous exports
  5. All pages have consistent loading states and empty states
  6. Toast notifications work consistently across all actions
**Plans**: TBD

Plans:
- [ ] 10-01: RFP history page with search and filter
- [ ] 10-02: Match history view and re-download
- [ ] 10-03: Final UI polish and consistency pass

### Phase 10.1: RFP Upload Polish (INSERTED)
**Goal**: Fix critical bugs, enable multi-user collaboration, and enhance RFP upload with multi-file support
**Depends on**: Phase 7 (can run before Phase 8/9/10)
**Requirements**: Derived from user feedback and bug reports
**Success Criteria** (what must be TRUE):
  1. Match review table sorting works correctly (clicking headers refreshes data)
  2. KPIs show 3 states: "Por Rever", "Revistos", "Confirmados"
  3. User can upload up to 10 RFPs concurrently with individual progress tracking
  4. All users can see, edit, and delete all RFPs (multi-user visibility)
  5. Uploader and last editor displayed on each RFP
  6. Changes sync in real-time across all users
  7. Inventory table matches review table design
**Plans**: 5 plans in 2 waves

Plans:
- [x] 10.1-01-PLAN.md — Fix match review table sorting (add startTransition to nuqs)
- [x] 10.1-02-PLAN.md — KPI calculations and 3-state model with confirmation workflow
- [x] 10.1-03-PLAN.md — Multi-upload support with progress UI and queue management
- [x] 10.1-04-PLAN.md — Multi-user permissions and real-time sync (RLS updates)
- [x] 10.1-05-PLAN.md — Uploader/editor display and table design alignment

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> ... -> 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2025-01-21 |
| 2. Authentication | 3/3 | Complete | 2026-01-21 |
| 3. Inventory View | 2/2 | Complete | 2026-01-21 |
| 4. Inventory Management | 3/3 | Complete | 2026-01-21 |
| 5. RFP Upload | 3/3 | Complete | 2026-01-22 |
| 6. Processing Status | 1/1 | Complete | 2026-01-22 |
| 7. Match Review | 2/2 | Complete | 2026-01-22 |
| 8. Bulk Operations | 2/2 | Complete | 2026-01-23 |
| 9. Export, Email & Admin | 0/6 | Planned | - |
| 10. History & Polish | 0/3 | Not started | - |
| 10.1 RFP Upload Polish | 5/5 | Complete | 2026-01-24 |

---
*Created: 2025-01-21*
*Last updated: 2026-01-25 — Phase 9 plans created (6 plans in 2 waves)*

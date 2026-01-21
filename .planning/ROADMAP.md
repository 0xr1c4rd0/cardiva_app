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
- [ ] **Phase 3: Inventory View** - Product listing with pagination, sorting, search, filter
- [ ] **Phase 4: Inventory Management** - CSV upload, validation, export, permissions
- [ ] **Phase 5: RFP Upload** - PDF upload, webhook trigger, file storage
- [ ] **Phase 6: Processing Status** - Real-time status updates, notifications
- [ ] **Phase 7: Match Review** - Display results, accept/reject individual matches
- [ ] **Phase 8: Bulk Operations** - Bulk accept/reject, manual correction, confirmation
- [ ] **Phase 9: Export & Email** - Excel export, email send, preview, configuration
- [ ] **Phase 10: History & Polish** - RFP history, search, re-download, final polish

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
**Plans**: TBD

Plans:
- [ ] 03-01: Inventory page with TanStack Table and pagination
- [ ] 03-02: Search, sort, and filter functionality

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
**Plans**: TBD

Plans:
- [ ] 04-01: CSV upload component with validation
- [ ] 04-02: n8n webhook integration and export functionality
- [ ] 04-03: Permission-based access control for inventory actions

### Phase 5: RFP Upload
**Goal**: Users can upload RFP PDFs and trigger the matching workflow
**Depends on**: Phase 4
**Requirements**: RFP-01, RFP-02, RFP-06
**Success Criteria** (what must be TRUE):
  1. User can upload PDF file via drag-and-drop or file picker
  2. Upload creates job record in Supabase with pending status
  3. n8n webhook is triggered with job_id (fire-and-forget pattern)
  4. Uploaded PDF is stored in Supabase Storage for history
**Plans**: TBD

Plans:
- [ ] 05-01: RFP upload page with PDF dropzone
- [ ] 05-02: Job creation and n8n webhook trigger
- [ ] 05-03: Supabase Storage integration for PDFs

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
**Plans**: TBD

Plans:
- [ ] 06-01: Processing status UI and progress indicator
- [ ] 06-02: Supabase Realtime subscription for status updates
- [ ] 06-03: Toast notifications for completion/error

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
**Plans**: TBD

Plans:
- [ ] 07-01: Match results page layout and RFP item display
- [ ] 07-02: Match suggestions with confidence indicators
- [ ] 07-03: Accept/reject actions with status tracking

### Phase 8: Bulk Operations
**Goal**: Users can efficiently review many matches with bulk actions and make manual corrections
**Depends on**: Phase 7
**Requirements**: MATCH-06, MATCH-07, MATCH-09
**Success Criteria** (what must be TRUE):
  1. User can select multiple items and accept/reject all at once
  2. User can manually search and select a different match for any item
  3. Confirmation step requires user to review all selections before proceeding
  4. User cannot proceed to export until all items have a decision
**Plans**: TBD

Plans:
- [ ] 08-01: Multi-select and bulk accept/reject UI
- [ ] 08-02: Manual match correction with inventory search
- [ ] 08-03: Confirmation step before export

### Phase 9: Export & Email
**Goal**: Users can export confirmed matches to Excel and send via email
**Depends on**: Phase 8
**Requirements**: EXP-01, EXP-02, EXP-03, EXP-04, EXP-05
**Success Criteria** (what must be TRUE):
  1. User can download match results as Excel (.xlsx) file
  2. User can send match results via email
  3. Export preview shows data before download or send
  4. User can configure export to include confirmed matches only or all items
  5. Export/email buttons only enabled after confirmation step is complete
**Plans**: TBD

Plans:
- [ ] 09-01: Excel export with ExcelJS
- [ ] 09-02: Email send functionality
- [ ] 09-03: Export preview and configuration options

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

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> ... -> 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2025-01-21 |
| 2. Authentication | 3/3 | Complete | 2026-01-21 |
| 3. Inventory View | 0/2 | Not started | - |
| 4. Inventory Management | 0/3 | Not started | - |
| 5. RFP Upload | 0/3 | Not started | - |
| 6. Processing Status | 0/3 | Not started | - |
| 7. Match Review | 0/3 | Not started | - |
| 8. Bulk Operations | 0/3 | Not started | - |
| 9. Export & Email | 0/3 | Not started | - |
| 10. History & Polish | 0/3 | Not started | - |

---
*Created: 2025-01-21*
*Last updated: 2026-01-21*

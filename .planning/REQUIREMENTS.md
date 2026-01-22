# Requirements: Cardiva RFP Matching App

**Defined:** 2025-01-21
**Core Value:** Users can upload an RFP, see suggested product matches, accept/reject interactively, and export confirmed matches

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: User can register with email and password
- [ ] **AUTH-02**: New user account is created in disabled state
- [ ] **AUTH-03**: Admin can approve/reject pending users in Supabase
- [ ] **AUTH-04**: User can log in with email and password
- [ ] **AUTH-05**: User session persists across browser refresh
- [ ] **AUTH-06**: User can log out from any page
- [ ] **AUTH-07**: User can reset password via email link
- [ ] **AUTH-08**: System supports user and admin roles (RBAC)
- [ ] **AUTH-09**: Permissions can be set at profile level or email level

### Inventory Management

- [ ] **INV-01**: User can view product listing from artigos table
- [ ] **INV-02**: Product listing is paginated (handles 20k+ items)
- [ ] **INV-03**: Product listing is sortable by columns
- [ ] **INV-04**: User can search products by name, code, or attributes
- [ ] **INV-05**: User can filter products by category/attributes
- [ ] **INV-06**: User can upload CSV file to update inventory
- [ ] **INV-07**: CSV upload validates data and shows errors before import
- [ ] **INV-08**: CSV upload triggers n8n workflow for processing
- [ ] **INV-09**: User can export inventory to CSV/Excel
- [ ] **INV-10**: Only users with permission can upload/modify inventory

### RFP Processing

- [ ] **RFP-01**: User can upload PDF file as RFP
- [ ] **RFP-02**: Upload triggers n8n webhook for extraction/matching
- [x] **RFP-03**: Processing status is shown in UI (pending, processing, complete, error)
- [x] **RFP-04**: User receives notification when processing completes
- [x] **RFP-05**: Background processing indicator visible during 3-5 min wait
- [ ] **RFP-06**: Uploaded RFP files are stored for history

### Match Review

- [x] **MATCH-01**: Match results display extracted RFP items
- [x] **MATCH-02**: Each RFP item shows potential inventory matches
- [x] **MATCH-03**: Matches display confidence score/indicator
- [x] **MATCH-04**: User can accept a suggested match
- [x] **MATCH-05**: User can reject a suggested match
- [ ] **MATCH-06**: User can bulk accept/reject multiple items
- [ ] **MATCH-07**: User can edit/correct a wrong match manually
- [x] **MATCH-08**: Review status tracked per item (pending, accepted, rejected)
- [ ] **MATCH-09**: User must confirm all selections before export

### Export & Communication

- [ ] **EXP-01**: User can export match results to Excel (.xlsx)
- [ ] **EXP-02**: User can send match results via email
- [ ] **EXP-03**: Export preview shows data before download/send
- [ ] **EXP-04**: Export data is configurable (confirmed matches only vs all)
- [ ] **EXP-05**: Export/email only available after confirmation step

### History

- [ ] **HIST-01**: User can view list of all past RFP submissions
- [ ] **HIST-02**: User can view match history for any past RFP
- [ ] **HIST-03**: User can search/filter past RFPs by name, date
- [ ] **HIST-04**: User can re-download previous exports

### UI/UX

- [x] **UI-01**: Gusto-inspired design aesthetic (teal primary, coral accents, white backgrounds)
- [x] **UI-02**: Left sidebar navigation with icons
- [x] **UI-03**: Responsive layout for desktop (mobile-responsive is nice-to-have)
- [x] **UI-04**: Progress indicators and loading states
- [x] **UI-05**: Toast notifications for actions and background processes
- [ ] **UI-06**: Empty states with helpful messaging
- [x] **UI-07**: Clean typography with clear hierarchy

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Security

- **SEC-01**: Two-factor authentication
- **SEC-02**: Account lockout after N failed login attempts
- **SEC-03**: Complete audit trail (FDA 21 CFR Part 11 compliance)

### Advanced Matching

- **ADV-01**: ML-based match improvement from accept/reject decisions
- **ADV-02**: Template learning for recurring RFP formats
- **ADV-03**: Multi-format support (Word, Excel, images)

### Analytics

- **ANA-01**: Match rate analytics dashboard
- **ANA-02**: Processing time metrics
- **ANA-03**: Inventory gap analysis

### Workflow

- **WF-01**: Assignment workflow (assign RFPs to specific users)
- **WF-02**: Comments on matches
- **WF-03**: Custom export templates
- **WF-04**: Email templates

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Inline single-product editing | Bulk CSV is sufficient for v1; adds UI complexity |
| Real-time collaboration | Shared visibility covers the need; live cursors overkill |
| Mobile native app | Web-responsive sufficient for B2B workflow app |
| AI response generation | Different product category; focus on matching |
| ERP/inventory management features | Scope creep; this is RFP matching, not inventory system |
| Direct integrations (SAP, Oracle, CRM) | Enterprise feature; CSV export covers the need |
| Customizable dashboards | One good default is better than infinite customization |
| White-labeling | Adds complexity; not needed for single client |
| Offline mode | Web-only is fine for B2B SaaS |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| AUTH-06 | Phase 2 | Pending |
| AUTH-07 | Phase 2 | Pending |
| AUTH-08 | Phase 2 | Pending |
| AUTH-09 | Phase 2 | Pending |
| INV-01 | Phase 3 | Pending |
| INV-02 | Phase 3 | Pending |
| INV-03 | Phase 3 | Pending |
| INV-04 | Phase 3 | Pending |
| INV-05 | Phase 3 | Pending |
| INV-06 | Phase 4 | Pending |
| INV-07 | Phase 4 | Pending |
| INV-08 | Phase 4 | Pending |
| INV-09 | Phase 4 | Pending |
| INV-10 | Phase 4 | Pending |
| RFP-01 | Phase 5 | Pending |
| RFP-02 | Phase 5 | Pending |
| RFP-03 | Phase 6 | Complete |
| RFP-04 | Phase 6 | Complete |
| RFP-05 | Phase 6 | Complete |
| RFP-06 | Phase 5 | Pending |
| MATCH-01 | Phase 7 | Complete |
| MATCH-02 | Phase 7 | Complete |
| MATCH-03 | Phase 7 | Complete |
| MATCH-04 | Phase 7 | Complete |
| MATCH-05 | Phase 7 | Complete |
| MATCH-06 | Phase 8 | Pending |
| MATCH-07 | Phase 8 | Pending |
| MATCH-08 | Phase 7 | Complete |
| MATCH-09 | Phase 8 | Pending |
| EXP-01 | Phase 9 | Pending |
| EXP-02 | Phase 9 | Pending |
| EXP-03 | Phase 9 | Pending |
| EXP-04 | Phase 9 | Pending |
| EXP-05 | Phase 9 | Pending |
| HIST-01 | Phase 10 | Pending |
| HIST-02 | Phase 10 | Pending |
| HIST-03 | Phase 10 | Pending |
| HIST-04 | Phase 10 | Pending |
| UI-01 | Phase 1 | Complete |
| UI-02 | Phase 1 | Complete |
| UI-03 | Phase 1 | Complete |
| UI-04 | Phase 3, 6, 10 | Complete |
| UI-05 | Phase 6, 10 | Complete |
| UI-06 | Phase 3, 10 | Pending |
| UI-07 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0

---
*Requirements defined: 2025-01-21*
*Last updated: 2026-01-22 after Phase 7 completion*

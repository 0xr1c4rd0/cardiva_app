# Cardiva RFP Matching App

## What This Is

A web application for a pharmaceutical company that provides a user-friendly interface for matching government RFP (Request for Proposal) product lists against the company's 20k+ product inventory. The app wraps an existing n8n workflow that handles PDF extraction, OCR, and semantic matching via embeddings, replacing the current email-based "black box" system with an interactive dashboard.

## Core Value

Users can upload an RFP, see suggested product matches with confidence scores, accept/reject each match interactively, and export only confirmed matches — turning a manual hours-long process into a guided 10-minute workflow.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User authentication via Supabase (email/password)
- [ ] New user registration creates disabled account requiring manual approval
- [ ] Permission system at profile level (user, admin) and email-level overrides
- [ ] Inventory page showing products from `artigos` table
- [ ] Bulk CSV upload for inventory updates
- [ ] Permission-controlled inventory editing (restrict who can update)
- [ ] RFP upload page accepting PDF files
- [ ] Background processing with visual indicator (3-5 min processing time)
- [ ] Notification when RFP processing completes
- [ ] Match results view showing each RFP item with potential matches
- [ ] Accept/reject interface for each suggested match
- [ ] Confirmation step before export/email
- [ ] Export to Excel with configurable data (matches only vs all)
- [ ] Send results via email
- [ ] RFP history with searchable past matches
- [ ] Minimal SaaS UI with pharmaceutical color palette

### Out of Scope

- Inline single-product editing — bulk CSV only for v1
- Role-based dashboards (everyone sees everything for now)
- Real-time collaboration features
- Mobile-native app — web responsive is sufficient
- Rebuilding n8n logic in the app — n8n remains the backend
- Post-match decision workflow (go/no-go on RFP bids)

## Context

**Existing Infrastructure:**
- n8n workflow ("Cardiva - Extract and compare") handles:
  - Email trigger for CSV (inventory) and PDF (RFP) files
  - PDF extraction with Mistral OCR for image-based documents
  - Product extraction via Gemini LLM
  - Semantic matching via OpenAI embeddings + Supabase pgvector
  - Google Sheets output + email response
- Supabase database with:
  - `artigos` table (~20k products)
  - Vector store table with embeddings
  - Postgres trigger for embedding updates on inventory changes

**Integration Points:**
- n8n webhooks for triggering extraction/matching
- Supabase for auth, inventory data, and match history
- Existing Google Sheets template for export format

**Business Context:**
- Current process is fully manual: users compare RFP products against inventory by hand
- Product names in RFPs rarely match company naming conventions
- Semantic search solves the matching problem; app solves the UX problem
- Higher perceived value justifies premium pricing for the solution

## Constraints

- **Backend**: n8n workflow must remain the processing engine; app triggers via webhooks
- **Database**: Supabase (existing `artigos` table structure, existing vector store)
- **Auth**: Supabase Auth with manual approval workflow
- **Processing Time**: 3-5 minutes for RFP extraction/matching; must handle async gracefully
- **Users**: Multiple concurrent users with shared visibility

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| n8n as backend | Workflow already built and working; rebuild would be wasteful | — Pending |
| Supabase Auth | Already using Supabase for data; unified platform | — Pending |
| Bulk CSV only for inventory | Simpler v1; inline editing adds complexity | — Pending |
| Shared visibility (no user isolation) | Client requirement for v1; permission system ready for future | — Pending |

---
*Last updated: 2025-01-21 after initialization*

# Research Summary

**Project:** Cardiva App - Pharmaceutical RFP Matching SaaS
**Synthesized:** 2026-01-21
**Overall Confidence:** HIGH

---

## Stack Recommendation

The recommended stack is optimized for a B2B SaaS application requiring real-time status updates during long-running async processing (3-5 minutes). Next.js 16 with App Router provides the foundation with React Server Components reducing bundle size for enterprise dashboards. Supabase serves as the unified backend handling authentication, PostgreSQL database, file storage, and critically, the real-time notification layer that coordinates between the frontend and n8n workflow engine. The key architectural insight is that Supabase acts as the coordination layer - n8n writes status updates to the database, and the frontend subscribes via Supabase Realtime rather than polling n8n directly.

**Key technologies:**
- Frontend: Next.js 16 (React 19, Turbopack, App Router)
- UI: shadcn/ui + Tailwind CSS v4 (pharmaceutical blue/green palette)
- State: Zustand v5 (client) + TanStack Query v5 (server state with supabase-cache-helpers)
- Data: @supabase/supabase-js 2.90.1 + @supabase/ssr 0.8.0
- Export: ExcelJS 4.4.0 (professional formatting for pharma reports)

---

## Table Stakes Features

Features users expect - missing these makes the product feel incomplete:

**Authentication & Authorization:**
- Email/password login with session management
- Role-based access control (Admin vs Standard user)
- Manual user approval workflow (critical for B2B pharma)
- Password reset and account lockout

**Inventory Management:**
- Product listing with pagination and sorting
- Search and filter (essential at 20K item scale)
- CSV/Excel bulk upload with validation
- CSV/Excel export
- Basic CRUD operations

**Document Processing:**
- PDF upload and OCR/text extraction
- Document preview and storage
- Upload status indication (processing states)
- Basic error handling with clear messages

**Match Review Workflow:**
- Match results display with confidence indicators
- Accept/reject per item (single and bulk)
- Edit matched items for correction
- Review status tracking

**Data Output:**
- Export to Excel (.xlsx)
- Email send functionality
- Export preview before download/send

**History & Audit:**
- RFP history list and match history per RFP
- Basic activity log
- Re-download past exports

---

## Differentiators

Features that create competitive advantage beyond table stakes:

**Intelligent Matching:**
- Fuzzy product matching (handle "Widget Model 7" vs "W-7 Widget")
- Multi-column matching (name + dosage + strength + manufacturer)
- Suggested alternatives when no exact match found
- ML-based improvement from accept/reject decisions (v2+)

**Advanced Document Processing:**
- Table extraction from PDFs
- Template learning for recurring RFP formats (70-90% time reduction)
- Batch document processing

**Workflow Optimization:**
- Assignment workflow for team distribution
- Notification system (email/in-app alerts)
- Comments on matches for knowledge capture

**Analytics & Compliance:**
- Match rate analytics
- Complete audit trail (FDA 21 CFR Part 11 path)
- Inventory gap analysis

---

## Architecture Overview

The architecture implements a **decoupled async processing pattern** with three main components. The frontend handles user interaction and displays real-time status updates. Supabase serves as the central data hub providing authentication, database storage with Row Level Security for multi-tenant isolation, file storage, and real-time subscriptions. n8n operates as an external workflow engine triggered via fire-and-forget webhooks that performs the 3-5 minute AI/ML matching processing.

**Components:**
- Frontend -> Supabase (auth, database CRUD, realtime subscriptions)
- Frontend -> n8n (webhook trigger only, fire-and-forget with immediate 200 OK)
- n8n -> Supabase (job status updates, match results via service_role key)

**Key Data Flow:**
1. User submits RFP -> Frontend creates job record in Supabase (status: pending)
2. Frontend triggers n8n webhook with job_id (fire-and-forget, does NOT wait)
3. n8n updates job status to "processing" in Supabase
4. Frontend subscribes to Supabase Realtime on the job row
5. n8n processes (3-5 min), writes results, updates status to "completed"
6. Frontend receives realtime notification, fetches and displays results

**Critical Tables:**
- `artigos` - Pharmaceutical inventory items
- `processing_jobs` - Job queue with status tracking (pending/processing/completed/failed)
- `match_results` - RFP-to-artigo matches
- `profiles` - User profiles with `is_approved` flag for manual approval workflow

---

## Critical Pitfalls

The top pitfalls requiring attention, with one-liner prevention strategies:

| Pitfall | Phase | Prevention |
|---------|-------|------------|
| **RLS Disabled** - Tables without Row Level Security expose all data | Phase 1 | Enable RLS immediately when creating tables, create policies before app code |
| **Webhook Timeout** - 3-5 min processing exceeds 100s timeout | Phase 2 | Use async acknowledgment: n8n responds immediately, updates status via Supabase |
| **No Idempotency** - Duplicate webhook calls create duplicate jobs | Phase 2 | Generate client-side idempotency keys, check before processing |
| **Storage Policies Wrong Table** - Policies on buckets instead of objects | Phase 2 | Create policies on `storage.objects` table, not `storage.buckets` |
| **Approval Bypass** - Unapproved users access data via RLS gap | Phase 1 | All RLS policies must check `profiles.is_approved = true` |
| **Realtime Memory Leaks** - Subscriptions not cleaned up in React | Phase 3 | Always return cleanup function from useEffect calling `channel.unsubscribe()` |

---

## Build Order

Recommended phase sequence based on component dependencies and risk mitigation:

1. **Foundation (Supabase Setup)** - Database schema with RLS-first design, auth configuration, profiles table with approval workflow. All other features depend on this layer.

2. **Inventory Core** - Artigos CRUD, bulk CSV upload with validation, search/filter. Cannot match without product data.

3. **Processing Integration** - Job submission UI, fire-and-forget webhook trigger, n8n minimal workflow that receives and updates status, realtime subscriptions. Establishes async pattern before adding complexity.

4. **Document Processing** - PDF upload to Supabase Storage, OCR/extraction integration, document preview. Prerequisite for matching.

5. **Matching Engine** - Core AI/ML matching algorithm in n8n, progress updates during processing, result writing to match_results table.

6. **Review Workflow** - Match results display, accept/reject per item, bulk operations, edit matched items.

7. **Output & History** - Excel export with professional formatting, email send, history views, activity logging.

8. **Polish & Scale** - Concurrent access handling, performance optimization, analytics dashboard, error recovery flows.

---

## Key Decisions Made

Architectural decisions established through research:

- **Supabase as Coordination Layer:** n8n writes status to Supabase, frontend subscribes via Realtime. User can close browser and return later; single source of truth.

- **Fire-and-Forget Webhooks:** Frontend triggers n8n without waiting for response. Processing takes 3-5 minutes which exceeds HTTP timeout limits.

- **Service Role Key for n8n:** Backend operations use service_role (bypasses RLS) because n8n needs to update any user's job. Never expose in frontend.

- **RLS-First Database Design:** Enable Row Level Security on every table from day one. All policies must check approval status for multi-tenant isolation.

- **Job Status Table Pattern:** Dedicated `processing_jobs` table with status enum (pending/processing/completed/failed), progress percentage, and error_message for comprehensive tracking.

- **TanStack Query + supabase-cache-helpers:** Industry standard for server-state with automatic cache invalidation for PostgREST queries.

- **Zustand for Client State:** Simple hook-based global state without Redux boilerplate. Perfect for SaaS dashboards.

- **ExcelJS over SheetJS:** Better styling control for pharmaceutical-grade reports, despite older package.

- **Avoid Feature Creep:** No ERP, no e-commerce, no AI chatbot, no mobile app. Focus on RFP matching excellence.

---

*Synthesized from: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md*

# Architecture

**Analysis Date:** 2026-01-25

## Pattern Overview

**Overall:** Client-Server Architecture with External Processing Orchestration

**Key Characteristics:**
- Next.js 16 App Router with Server/Client Component separation
- Supabase backend provides auth, database, realtime, and storage
- n8n external workflows handle heavy processing (PDF extraction, OCR, AI matching)
- Fire-and-forget webhook pattern offloads intensive operations
- Realtime subscriptions enable multi-user collaboration and live updates

## Layers

**Presentation Layer (Client Components):**
- Purpose: Interactive UI elements and client-side state management
- Location: `src/app/**/components/`, `src/components/`
- Contains: React Client Components with `"use client"` directive, form handlers, interactive widgets
- Depends on: Browser-side Supabase client, React hooks, Zustand stores, Context providers
- Used by: Server Components wrap and hydrate these components

**Application Layer (Server Components & Actions):**
- Purpose: Data fetching, authentication checks, server-side rendering
- Location: `src/app/**/page.tsx`, `src/app/**/layout.tsx`, `src/app/**/actions.ts`
- Contains: Server Components, Server Actions (`"use server"`), route handlers
- Depends on: Server-side Supabase client, database queries, external webhooks
- Used by: Client Components call Server Actions, Pages render Server Components

**Data Access Layer:**
- Purpose: Database operations and external service integration
- Location: `src/lib/supabase/`, `src/lib/n8n/`, `src/lib/csv/`, `src/lib/export/`
- Contains: Supabase client factories, webhook triggers, CSV parsers, data transformers
- Depends on: Supabase SDK, environment variables, external n8n webhooks
- Used by: Server Actions, API routes, Server Components

**State Management Layer:**
- Purpose: Client-side state coordination and realtime updates
- Location: `src/contexts/`
- Contains: React Context providers (RFPUploadStatusContext), Zustand stores
- Depends on: Browser Supabase client, Realtime subscriptions
- Used by: Client Components consume context via hooks

**External Processing Layer (n8n):**
- Purpose: Heavy computational tasks (PDF parsing, OCR, AI matching)
- Location: External n8n workflows (not in codebase)
- Contains: Workflow orchestration, AI semantic search, batch processing
- Depends on: Webhooks from app, Supabase database (service role), AI models
- Used by: Server Actions trigger via `triggerRFPWebhook`, results written to DB

## Data Flow

**RFP Upload and Processing Flow:**

1. User uploads PDF → Client Component (`RFPUploadCard`) collects file
2. Form submission triggers Server Action → `triggerRFPUpload(formData)` in `src/app/(dashboard)/rfps/actions.ts`
3. Server Action creates `rfp_upload_jobs` row with `pending` status
4. PDF uploaded to Supabase Storage bucket `rfp-uploads`
5. Server Action fires webhook → `triggerRFPWebhook()` sends FormData to n8n (fire-and-forget)
6. n8n workflow processes PDF (3-5 min):
   - Extracts text and line items
   - Runs AI semantic matching against inventory
   - Inserts `rfp_items` and `rfp_match_suggestions` to database
   - Updates job status to `completed`
7. Supabase Realtime broadcasts job update → All clients receive via subscription
8. Context provider updates → UI reflects new status, KPIs refresh

**Authentication Flow:**

1. User navigates to dashboard → Next.js renders `(dashboard)/layout.tsx`
2. Server Component creates Supabase client → `createClient()` from `src/lib/supabase/server.ts`
3. Auth check → `supabase.auth.getUser()` validates session cookie
4. Approval check → Query `profiles.approved_at` for current user
5. Redirect logic:
   - No user → `/login`
   - User not approved → `/pending-approval`
   - User approved → Render dashboard layout with sidebar

**Match Review Flow:**

1. User opens match page → `rfps/[id]/matches/page.tsx` Server Component loads
2. Fetch RFP items with nested suggestions → Complex Supabase query with explicit FK
3. Auto-accept exact matches → `autoAcceptExactMatches()` updates 100% similarity items
4. Server-side sorting/filtering → Apply URL params (search, sort, status)
5. Client-side refinement → Additional filtering for status and search on matched products
6. Render MatchReviewContent → Client Component with initial data
7. User accepts/rejects → Server Action updates `rfp_items.review_status` and `rfp_match_suggestions.status`
8. Optimistic update → UI responds immediately, revalidates from server

**State Management:**

- **Server State:** React Server Components fetch data on each request (dynamic rendering)
- **Client State:** Zustand stores (minimal usage), React Context (upload queue, realtime subscriptions)
- **URL State:** Nuqs library syncs URL params with client state (pagination, filters, sorting)
- **Realtime State:** Supabase Realtime broadcasts DB changes to all connected clients

## Key Abstractions

**Supabase Client Factory Pattern:**
- Purpose: Isolate server vs client Supabase initialization
- Examples: `src/lib/supabase/server.ts` (async, cookie-based), `src/lib/supabase/client.ts` (singleton, browser-only)
- Pattern: Factory functions create configured clients for different environments

**Server Action Pattern:**
- Purpose: Type-safe server-side mutations with Next.js integration
- Examples: `src/app/(dashboard)/rfps/actions.ts`, `src/app/(dashboard)/inventory/actions.ts`
- Pattern: `"use server"` directive, FormData inputs, revalidatePath after mutations

**Fire-and-Forget Webhook Pattern:**
- Purpose: Offload long-running tasks to external processors without blocking requests
- Examples: `src/lib/n8n/rfp-webhook.ts`, `src/lib/n8n/export-webhook.ts`
- Pattern: Trigger webhook with `.catch()` error handling, don't await response, Realtime updates completion

**Route Group Pattern:**
- Purpose: Organize routes with shared layouts without affecting URL structure
- Examples: `(auth)/` (no sidebar), `(dashboard)/` (auth-gated with sidebar)
- Pattern: Parentheses in directory names create layout boundaries

**Realtime Subscription Pattern:**
- Purpose: Multi-user collaboration with live updates
- Examples: `src/contexts/rfp-upload-status-context.tsx` subscribes to `rfp_upload_jobs` changes
- Pattern: Channel setup with postgres_changes events, cleanup on unmount, callback handlers update local state

## Entry Points

**Application Root:**
- Location: `src/app/layout.tsx`
- Triggers: All requests
- Responsibilities: Font loading, global providers (NuqsAdapter, Toaster), HTML structure

**Authentication Routes:**
- Location: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- Triggers: Public access, unauthenticated users
- Responsibilities: Form rendering, Server Actions for auth operations

**Dashboard Root:**
- Location: `src/app/(dashboard)/layout.tsx`
- Triggers: Protected routes requiring auth
- Responsibilities: Auth validation, approval check, sidebar layout, session management

**Main Dashboard:**
- Location: `src/app/(dashboard)/page.tsx`
- Triggers: Authenticated users navigate to `/`
- Responsibilities: Dashboard home view (currently minimal)

**RFP Listing:**
- Location: `src/app/(dashboard)/rfps/page.tsx`
- Triggers: Navigate to `/rfps`
- Responsibilities: Display RFP jobs table, upload interface, KPI stats

**Match Review:**
- Location: `src/app/(dashboard)/rfps/[id]/matches/page.tsx`
- Triggers: Navigate to `/rfps/{jobId}/matches`
- Responsibilities: Load items with suggestions, server-side filtering/sorting, client-side refinement

**Inventory Management:**
- Location: `src/app/(dashboard)/inventory/page.tsx`
- Triggers: Navigate to `/inventory`
- Responsibilities: Product catalog view, CSV upload, export functionality

**API Routes:**
- Location: `src/app/api/health/route.ts`, `src/app/api/debug/schema/route.ts`
- Triggers: Direct HTTP requests
- Responsibilities: Health checks, debugging endpoints

## Error Handling

**Strategy:** Multi-layered error handling with user-friendly messages

**Patterns:**
- Server Actions return `{ success: boolean; error?: string }` shape for client consumption
- Try-catch blocks in critical paths with console.error logging
- Validation errors caught early (Zod schemas, file type checks, size limits)
- Database errors logged with full context, generic messages shown to users
- Fire-and-forget webhooks log errors but don't throw (job status reflects failures)
- Supabase RLS policies prevent unauthorized access (returns empty data, not errors)
- Client Components use toast notifications (Sonner) for user feedback
- Next.js error boundaries catch rendering errors (not currently customized)

## Cross-Cutting Concerns

**Logging:** Console.log for development, structured logging with context (job IDs, user IDs, errors)

**Validation:**
- Zod schemas for CSV parsing (`src/lib/csv/validation.ts`)
- File type/size checks in Server Actions
- Database constraints enforce data integrity
- RLS policies validate row-level access

**Authentication:**
- Supabase Auth handles sessions via HTTP-only cookies
- Server Components check `auth.getUser()` on every request
- Dashboard layout redirects unauthenticated users
- Approval system adds secondary authorization layer (`profiles.approved_at`)

---

*Architecture analysis: 2026-01-25*

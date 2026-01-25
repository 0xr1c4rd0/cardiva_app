# External Integrations

**Analysis Date:** 2026-01-25

## APIs & External Services

**n8n Workflow Automation:**
- Purpose: Heavy-lifting backend processing (PDF extraction, OCR, AI matching)
- Integration Pattern: Fire-and-forget webhooks via `fetch()`
- Three webhook endpoints:
  - RFP Processing (`N8N_RFP_WEBHOOK_URL`) - Handles PDF uploads, extracts line items, generates AI matches
  - Inventory Updates (`N8N_INVENTORY_WEBHOOK_URL`) - Processes CSV inventory uploads
  - Export Email (`N8N_EXPORT_EMAIL_WEBHOOK_URL`) - Sends Excel exports via email
- Authentication: Optional `X-Webhook-Secret` header (`N8N_WEBHOOK_SECRET` env var)
- Request Format:
  - RFP/Inventory: `multipart/form-data` with binary file + metadata
  - Export: `application/json` with base64-encoded Excel file
- Response Pattern: Immediate 200 response, async processing (3-5 min for RFPs)
- Implementation: `src/lib/n8n/webhook.ts`, `src/lib/n8n/rfp-webhook.ts`, `src/lib/n8n/export-webhook.ts`

## Data Storage

**Databases:**
- Supabase Postgres
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client: `@supabase/supabase-js` v2.91.0 with `@supabase/ssr` v0.8.0
  - Server Client: `src/lib/supabase/server.ts` (async, cookie-based auth)
  - Browser Client: `src/lib/supabase/client.ts` (singleton pattern)
  - Admin Client: `src/lib/supabase/admin.ts` (service role operations)
  - Key Tables:
    - `profiles` - User profiles with approval workflow (`approved_at` field)
    - `artigos` - Product inventory (~20k items)
    - `rfp_upload_jobs` - Job tracking (status: pending/processing/completed/failed)
    - `rfp_items` - Extracted line items from RFP PDFs
    - `rfp_match_suggestions` - AI-generated matches with confidence scores (0.0000-1.0000)

**File Storage:**
- Supabase Storage
  - Bucket: RFP PDFs stored at upload time
  - Location: `src/app/(dashboard)/rfps/actions.ts` (upload logic with filename sanitization)
  - Pattern: Store PDF → trigger n8n → n8n processes from storage path

**Caching:**
- None (relies on Next.js built-in caching and React Query)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: Email/password authentication
  - Session Management: Cookie-based via `@supabase/ssr`
  - Protected Routes: Dashboard layout checks auth server-side in `src/app/(dashboard)/layout.tsx`
  - Auth Routes:
    - `src/app/(auth)/login/actions.ts` - Login server action
    - `src/app/(auth)/register/actions.ts` - Registration server action
    - `src/app/(auth)/reset-password/actions.ts` - Password reset
    - `src/app/(auth)/update-password/actions.ts` - Password update
    - `src/app/auth/confirm/route.ts` - Email confirmation callback
  - Approval Flow: Registration creates account → Admin approves via `approved_at` field → User gets dashboard access
  - Utilities: `src/lib/auth/utils.ts`

## Monitoring & Observability

**Error Tracking:**
- None (console logging only)

**Logs:**
- Console logging in server actions and webhook handlers
- n8n webhook errors logged but not thrown (fire-and-forget pattern)

## CI/CD & Deployment

**Hosting:**
- Designed for Vercel (Next.js native platform)

**CI Pipeline:**
- Playwright tests configured with GitHub Actions support (`process.env.CI` checks)
- No explicit CI configuration file in repository

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- `N8N_RFP_WEBHOOK_URL` - RFP processing webhook (server-side)
- `N8N_INVENTORY_WEBHOOK_URL` - Inventory update webhook (server-side)
- `N8N_EXPORT_EMAIL_WEBHOOK_URL` - Export email webhook (server-side)
- `N8N_WEBHOOK_SECRET` - Optional webhook authentication (server-side)

**Secrets location:**
- `.env.local` for local development (gitignored)
- Vercel environment variables for production

## Webhooks & Callbacks

**Incoming:**
- `src/app/auth/confirm/route.ts` - Supabase email confirmation callback
- `src/app/api/health/route.ts` - Health check endpoint

**Outgoing:**
- n8n RFP webhook - Triggers PDF processing workflow
- n8n Inventory webhook - Triggers CSV processing workflow
- n8n Export webhook - Triggers email sending workflow

## Real-time Features

**Supabase Realtime:**
- Purpose: Live status updates for background jobs
- Channels:
  - `rfp_jobs_all` - RFP upload job status changes (broadcast to all users)
    - Implementation: `src/contexts/rfp-upload-status-context.tsx`
    - Pattern: Subscribe to `rfp_upload_jobs` table changes
  - `inventory_upload_jobs_changes` - Inventory upload status changes
    - Implementation: `src/hooks/use-upload-status.ts`
    - Pattern: Subscribe to table changes for real-time progress updates
- Use Case: Auto-refresh UI when n8n completes processing (3-5 min async workflows)

## Third-Party UI Libraries

**shadcn/ui:**
- Not a traditional dependency - copied components into `src/components/ui/`
- Based on Radix UI primitives + Tailwind CSS
- Configuration: `components.json` (New York style, neutral base color)
- Icon Library: Lucide React
- 25 UI components in `src/components/ui/`

---

*Integration audit: 2026-01-25*

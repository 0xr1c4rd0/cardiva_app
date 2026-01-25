# Codebase Concerns

**Analysis Date:** 2026-01-25

## Tech Debt

### Exposed Credentials in Repository

- Issue: `.env.local` file committed to repository with production credentials (Supabase URL and anon key)
- Files: `.env.local`
- Impact: Security vulnerability - public exposure of Supabase endpoint and anonymous API key in git history
- Fix approach: Remove file from repository, add to `.gitignore`, rotate Supabase anon key, use `.env.example` for template only

### Type Safety Shortcuts

- Issue: Multiple instances of `any` and `as unknown` type assertions bypass TypeScript's type safety
- Files:
  - `src/lib/supabase/types.ts` - `Artigo = Record<string, any>` (inventory schema is completely untyped)
  - `src/contexts/rfp-upload-status-context.tsx` - `as unknown as { new: RFPUploadJob }` (Realtime payload type coercion)
  - `src/app/auth/confirm/route.ts` - `type: type as any` (email confirmation type)
  - `src/app/(auth)/update-password/actions.ts` - `prevState: any, e: any`
  - `src/app/(auth)/register/actions.ts` - `prevState: any`
  - `src/app/(auth)/login/actions.ts` - `prevState: unknown`
  - `src/app/(auth)/reset-password/actions.ts` - `prevState: any`
  - `src/components/ui/sortable-header.tsx` - `onSort: (column: any) => void`
- Impact: Loss of type safety leads to potential runtime errors, harder refactoring, reduced IDE autocomplete
- Fix approach: Generate proper Supabase types using `supabase gen types typescript`, define proper interfaces for action prevState, create typed Realtime payload interfaces

### Excessive Console Logging in Production Code

- Issue: 57 `console.log`/`console.error`/`console.warn` statements throughout codebase (18 files)
- Files:
  - `src/app/(dashboard)/rfps/[id]/matches/actions.ts` (23 occurrences - most verbose)
  - `src/contexts/rfp-upload-status-context.tsx`
  - `src/lib/n8n/webhook.ts`, `src/lib/n8n/rfp-webhook.ts`, `src/lib/n8n/export-webhook.ts`
  - Various component and action files
- Impact: Performance overhead in production, exposed implementation details in browser console, no structured logging for monitoring
- Fix approach: Implement proper logging abstraction (pino/winston), add environment-based log levels, remove debug logs from client components, use server-side structured logging

### Large Component Files

- Issue: Several components exceed 500+ lines indicating high complexity
- Files:
  - `src/app/(dashboard)/rfps/components/match-review-table.tsx` (781 lines)
  - `src/components/ui/sidebar.tsx` (726 lines)
  - `src/app/(dashboard)/rfps/[id]/matches/actions.ts` (653 lines)
  - `src/app/(dashboard)/rfps/components/rfp-jobs-list.tsx` (561 lines)
  - `src/contexts/rfp-upload-status-context.tsx` (422 lines)
- Impact: Harder to maintain, test, and reason about; increased cognitive load; merge conflicts more likely
- Fix approach: Extract subcomponents, separate business logic from UI, split action files by domain (accept/reject/manual), move sorting/filtering logic to hooks

### No Unit Test Coverage

- Issue: Zero unit tests found in source directory (only Playwright E2E tests exist)
- Files: No `*.test.ts` or `*.spec.ts` files in `src/` directory
- Impact: High risk of regressions, difficult to refactor confidently, business logic not independently validated
- Fix approach: Add Vitest/Jest configuration, write tests for critical business logic (matching logic, export formatting, CSV validation), test hooks and utilities first

## Known Bugs

### Race Condition in Queue Processing

- Symptoms: Upload queue processing uses `isProcessingQueueRef` flag but releases lock before upload completes
- Files: `src/contexts/rfp-upload-status-context.tsx` (lines 240-270)
- Trigger: Multiple rapid file uploads may cause concurrent processing despite MAX_PARALLEL_UPLOADS limit
- Workaround: Current stagger delay (2s) reduces probability but doesn't eliminate race
- Fix approach: Use proper async queue with concurrency control (p-queue library), or move queue to server-side with job management

### Incomplete Client-Side Filter Synchronization

- Symptoms: Local filtering in `match-review-table.tsx` and `rfp-jobs-list.tsx` may desync from server state
- Files:
  - `src/app/(dashboard)/rfps/components/match-review-table.tsx` (lines 86-107, 217-268)
  - `src/app/(dashboard)/rfps/components/rfp-jobs-list.tsx` (lines 287-343, 411-427)
- Trigger: Rapid filter changes while server data is updating, or page refresh mid-filter
- Current mitigation: `useEffect` hooks attempt to resync on prop changes
- Fix approach: Use single source of truth (server state only), or implement proper optimistic UI with revert capability

### Stale Data After Delete Operations

- Symptoms: KPI stats and pagination counts may show stale data after RFP deletion
- Files:
  - `src/app/(dashboard)/rfps/components/rfp-jobs-list.tsx` (lines 387-400)
  - `src/app/(dashboard)/rfps/components/delete-rfp-dialog.tsx`
- Trigger: Delete operation triggers local state update and `triggerKPIRefresh()` but KPI component may not re-fetch
- Current mitigation: `refreshTrigger` counter increments, but component must observe it correctly
- Fix approach: Use React Query mutations with proper cache invalidation, or use Supabase Realtime for delete broadcasts

## Security Considerations

### Credentials Exposure

- Risk: Supabase credentials committed to version control (see Tech Debt section above)
- Files: `.env.local`
- Current mitigation: None - credentials are publicly visible in repository
- Recommendations: Immediate key rotation, audit access logs, implement secret scanning in CI/CD

### n8n Webhook Security

- Risk: Webhook endpoints lack authentication verification
- Files:
  - `src/lib/n8n/rfp-webhook.ts`
  - `src/lib/n8n/webhook.ts`
  - `src/lib/n8n/export-webhook.ts`
- Impact: Anyone with webhook URL can trigger processing or receive sensitive export data
- Current mitigation: `N8N_WEBHOOK_SECRET` environment variable exists but implementation unclear
- Recommendations: Verify webhook signatures, implement request signing, add rate limiting, use HTTPS-only endpoints

### Row-Level Security (RLS) Evolution

- Risk: Multiple migration files show RLS policy iterations indicating security model complexity
- Files:
  - `supabase/migrations/20260121_fix_profiles_rls.sql`
  - `supabase/migrations/20260122_rfp_delete_policy.sql`
  - `supabase/migrations/20260122_rfp_manual_match_insert_policy.sql`
  - `supabase/migrations/20260124_multi_user_rfp_access.sql`
  - `supabase/migrations/20260124_fix_insert_policy.sql`
- Impact: Complex policy history suggests potential gaps or overly permissive access
- Recommendations: Comprehensive security audit of all RLS policies, document access control model, add automated policy tests

### Unauthenticated n8n Callback Path

- Risk: n8n workflows update database directly without going through authenticated Next.js API routes
- Files: External n8n workflow (not in codebase), updates `rfp_upload_jobs`, `rfp_items`, `rfp_match_suggestions` tables
- Impact: Bypasses application-level authorization, relies solely on database RLS policies
- Recommendations: Implement webhook authentication, consider API routes as intermediary, add audit logging for external updates

## Performance Bottlenecks

### Large Table Rendering Without Virtualization

- Problem: Match review table renders all paginated items without virtual scrolling
- Files: `src/app/(dashboard)/rfps/components/match-review-table.tsx` (781 lines)
- Cause: Full DOM rendering of 25-100 table rows with complex nested components per row
- Impact: Slow initial render on large RFPs (100+ items), janky scrolling, high memory usage
- Improvement path: Implement virtual scrolling (react-virtual/tanstack-virtual), reduce component nesting, memoize row components

### CSV Parsing Synchronous Blocking

- Problem: CSV parsing happens synchronously on main thread using PapaParse
- Files:
  - `src/lib/csv/parser.ts` (lines 15-45)
  - `src/app/(dashboard)/inventory/actions.ts`
- Cause: Large inventory CSV files (20k+ rows) block UI during parsing
- Impact: Browser freezes during inventory upload, poor UX for large files
- Improvement path: Use Web Workers for CSV parsing, implement streaming parser, add progress indicators

### Client-Side Sorting and Filtering on Large Datasets

- Problem: Client-side sort/filter operations on potentially large result sets
- Files:
  - `src/app/(dashboard)/rfps/components/match-review-table.tsx` (lines 126-157, 160-215)
  - `src/app/(dashboard)/rfps/components/rfp-jobs-list.tsx` (lines 296-314, 411-457)
- Cause: Instant feedback UX pattern requires client-side operations before server refetch
- Impact: Performance degrades with >500 items, memory pressure, duplicate processing (client + server)
- Improvement path: Server-side only operations with optimistic UI spinners, or implement proper cursor-based pagination

### N8N Processing Dependency

- Problem: Critical business logic (PDF extraction, AI matching) happens in external n8n workflow (3-5 minute black box)
- Files: External n8n workflow, triggered from `src/app/(dashboard)/rfps/actions.ts`
- Cause: Fire-and-forget webhook pattern with no progress updates, timeout handling unclear
- Impact: No intermediate progress, failed jobs may hang indefinitely, no retry mechanism visible
- Improvement path: Implement job progress webhooks, add timeout detection, consider moving AI matching to Next.js backend for better observability

## Fragile Areas

### Realtime Subscription Management

- Files:
  - `src/contexts/rfp-upload-status-context.tsx` (lines 308-376)
  - `src/hooks/use-upload-status.ts`
- Why fragile: Complex channel lifecycle with multiple concurrent subscriptions, manual cleanup required, payload type coercion
- Safe modification: Always test subscription setup/teardown, verify cleanup in useEffect returns, ensure `isMounted` guards prevent state updates after unmount
- Test coverage: None - Realtime subscriptions difficult to test, race conditions possible

### Nuqs URL State Synchronization

- Files:
  - `src/app/(dashboard)/rfps/components/match-review-table.tsx` (lines 110-123)
  - `src/app/(dashboard)/rfps/components/rfp-jobs-list.tsx` (lines 273-286)
- Why fragile: Complex interaction between URL params, server state, client state, and optimistic updates via `startTransition`
- Safe modification: Always use `startTransition` wrapper, maintain both `initialState` from server and local state, test pagination edge cases
- Test coverage: E2E tests exist but may not cover all state sync scenarios

### Multi-Stage Animation State Machines

- Files:
  - `src/app/(dashboard)/rfps/components/rfp-processing-card.tsx` (lines 72-133)
  - `src/app/(dashboard)/rfps/components/rfp-jobs-list.tsx` (lines 152-170)
- Why fragile: Complex state transitions (`normal → collapsing → removed`), timing-dependent, relies on `transitionEnd` events
- Safe modification: Never skip animation phases, always call `onAnimationComplete` callback, test rapid state changes
- Test coverage: Visual regression testing needed, timeout edge cases untested

### CSV Encoding Fallback Logic

- Files: `src/lib/csv/parser.ts` (lines 15-45)
- Why fragile: UTF-8 parse → detect encoding error → retry with ISO-8859-1 (Portuguese characters)
- Safe modification: Always preserve fallback chain, test with actual Portuguese CSVs, verify both encodings work
- Test coverage: No tests for encoding detection, relies on PapaParse error detection

## Scaling Limits

### Client-Side State Management Ceiling

- Current capacity: ~100 concurrent RFP items per page, ~1000 total inventory items displayed
- Limit: Browser memory constraints (each item ~2KB in memory), React re-render performance
- Scaling path: Implement cursor-based pagination, reduce client state footprint, use server-side aggregations for KPIs

### Supabase Realtime Connection Pooling

- Current capacity: 3-10 concurrent users per deployment (Realtime channel connections)
- Limit: Supabase free tier connection limits, broadcast message rate limits
- Scaling path: Upgrade Supabase plan, implement connection pooling, consider polling fallback for non-critical updates

### N8N Workflow Throughput

- Current capacity: Unknown - external service, appears to process uploads sequentially
- Limit: N8N server capacity, AI API rate limits (matching algorithm), PDF extraction timeouts
- Scaling path: Migrate critical workflows to Next.js API routes, implement queue system with concurrency control, add Redis for job state

### File Storage Growth

- Current capacity: Supabase Storage for uploaded PDFs (no cleanup policy visible)
- Limit: Storage quota, no expiration or archival strategy
- Scaling path: Implement file retention policy, compress old PDFs, move to S3 for long-term storage

## Dependencies at Risk

### React 19 Bleeding Edge

- Risk: React 19.2.3 is very recent (released January 2025), ecosystem compatibility uncertain
- Impact: Third-party libraries may have compatibility issues, React Query/TanStack patterns may change
- Migration plan: Monitor React 19 stability, test all interactive features thoroughly, have React 18 rollback plan

### Next.js 16 App Router

- Risk: Next.js 16.1.4 with App Router is cutting edge, patterns still evolving
- Impact: Breaking changes possible, caching behavior complex, Server Actions patterns may shift
- Migration plan: Pin versions strictly, follow Next.js upgrade guides carefully, test caching behavior after upgrades

### Zod v4 Alpha

- Risk: Zod 4.3.5 is marked as v4 which is not stable release
- Impact: Breaking schema validation changes, error message format changes
- Migration plan: Consider downgrading to Zod v3 stable, or accept beta risk and monitor releases

### Tailwind CSS 4 Beta

- Risk: Tailwind CSS 4 is in beta (breaking changes likely)
- Impact: Class names may break, PostCSS integration changes
- Migration plan: Lock to specific beta version, test all UI components after updates, have Tailwind v3 rollback

## Missing Critical Features

### No Undo/Revision History

- Problem: Users cannot undo match selections or restore previous states
- Blocks: Workflow recovery from mistakes, audit trail for match decisions
- Priority: Medium - workaround is manual re-selection, but UX pain point

### No Bulk Match Operations

- Problem: Users must accept/reject matches one by one (no select-all or bulk actions)
- Blocks: Efficient review of large RFPs (100+ items), keyboard-driven workflows
- Priority: High - major UX bottleneck for power users

### No Export Progress Indication

- Problem: Excel export happens synchronously with no progress feedback for large datasets
- Blocks: UX for exports >1000 rows (browser appears frozen)
- Priority: Medium - affects UX but works functionally

### No Offline Support or Error Recovery

- Problem: Network failures during upload/processing leave jobs in inconsistent state
- Blocks: Reliable operation in unstable network environments
- Priority: Medium - Realtime subscription handles reconnection but upload retry logic missing

## Test Coverage Gaps

### Zero Unit Tests for Business Logic

- What's not tested: CSV validation, export formatting, match scoring, status calculations
- Files: All `src/lib/**/*.ts` utility files untested
- Risk: Core business logic can break unnoticed during refactoring
- Priority: High - implement tests for `src/lib/csv/validation.ts`, `src/lib/export/rfp-export.ts`, matching utilities

### No Integration Tests for Server Actions

- What's not tested: Database mutations, RLS policy enforcement, concurrent access
- Files: All `src/app/**/actions.ts` files (5 files with server actions)
- Risk: Data corruption, race conditions, authorization bypass undetected
- Priority: Critical - add tests for `acceptMatch`, `rejectMatch`, `triggerRFPUpload` actions

### Incomplete E2E Coverage for Upload Flow

- What's not tested: Multi-file upload queue, n8n webhook callback simulation, Realtime subscription behavior
- Files: `tests/phase-*.spec.ts` (Playwright tests exist but gaps remain)
- Risk: Upload queue race conditions, processing timeout failures not caught
- Priority: High - add E2E tests for concurrent uploads, processing failures, status transitions

### No Visual Regression Testing

- What's not tested: Animation states, responsive layouts, complex table rendering
- Files: All component files with animations and conditional rendering
- Risk: UI breaks unnoticed, especially during library upgrades
- Priority: Medium - implement Percy/Chromatic for key user flows

---

*Concerns audit: 2026-01-25*

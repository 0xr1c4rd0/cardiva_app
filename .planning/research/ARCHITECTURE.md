# Architecture Research

**Domain:** Pharmaceutical RFP matching SaaS application
**Researched:** 2026-01-21
**Confidence:** HIGH (patterns verified across multiple authoritative sources)

## Executive Summary

This architecture implements a **decoupled async processing pattern** where:
- Frontend handles user interaction and real-time status display
- Supabase serves as the central data hub, auth provider, and real-time notification layer
- n8n operates as an external workflow engine triggered via webhooks

The key insight: **Supabase acts as the coordination layer** between frontend and n8n. Rather than the frontend polling n8n directly, n8n writes status updates to Supabase, and the frontend subscribes to those changes via Supabase Realtime.

---

## Components

### Frontend (Web Application)

**Recommended Stack:** Next.js with React (or Vue/Nuxt as alternative)

**Rationale:** Next.js is the most popular choice for Supabase integration with official templates, SSR support for auth, and excellent TypeScript support. The `npx create-next-app -e with-supabase` template provides pre-configured auth flow.

**Responsibilities:**
- User authentication flow (login, signup, session management)
- RFP submission interface (file upload or form input)
- Processing status display with real-time updates
- Match results visualization
- Inventory (artigos) management interface
- Match history viewing

**Talks to:**
- Supabase Auth (authentication)
- Supabase Database (CRUD operations, status queries)
- Supabase Realtime (status change subscriptions)
- n8n webhook endpoint (processing trigger only)

**Does NOT talk to:**
- n8n for status checks (goes through Supabase instead)

---

### Supabase (Backend-as-a-Service)

**Role:** Central data hub, authentication provider, and real-time notification layer

**Responsibilities:**
- User authentication and session management
- Database storage (artigos, processing jobs, match results)
- Row Level Security (RLS) for multi-tenant data isolation
- Real-time subscriptions for status updates
- File storage (if RFP documents need to be stored)

**Tables (Recommended Schema):**

| Table | Purpose |
|-------|---------|
| `artigos` | Pharmaceutical inventory items |
| `processing_jobs` | Job queue with status tracking |
| `match_results` | RFP-to-artigo matches |
| `match_history` | Historical record of all processing runs |

**Key Table: `processing_jobs`**

```sql
CREATE TABLE processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  rfp_data JSONB,                -- Input RFP content
  progress INTEGER DEFAULT 0,    -- 0-100 percentage
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result_summary JSONB           -- Quick stats (match count, etc.)
);
```

**Status Values:**
- `pending` - Job created, waiting for n8n to pick up
- `processing` - n8n actively working
- `completed` - Results available
- `failed` - Error occurred, check error_message

---

### n8n (Workflow Engine)

**Role:** Asynchronous background processor for long-running RFP matching

**Responsibilities:**
- Receive RFP processing requests via webhook
- Execute AI/ML matching logic (3-5 minute processing time)
- Update job status in Supabase during processing
- Write match results to Supabase upon completion
- Handle errors gracefully with status updates

**Triggered by:** HTTP webhook from frontend

**Returns results via:** Direct writes to Supabase database (NOT callback to frontend)

**Workflow Structure:**
```
1. Webhook Trigger (receive job_id + rfp_data)
2. Update job status to 'processing' in Supabase
3. Fetch artigos from Supabase
4. Execute matching algorithm (AI/ML processing)
5. Periodically update progress percentage (optional)
6. Write match_results to Supabase
7. Update job status to 'completed' or 'failed'
```

**Authentication:** Use Supabase service_role key (bypasses RLS for backend operations)

---

## Data Flow

### RFP Processing Flow (Primary Use Case)

```
User                Frontend              Supabase              n8n
  |                    |                     |                   |
  |--[1] Submit RFP--->|                     |                   |
  |                    |--[2] Create job---->|                   |
  |                    |<--[3] job_id--------|                   |
  |                    |--[4] Trigger webhook------------------>|
  |                    |   (job_id + rfp_data)                  |
  |                    |                     |<--[5] Update-------|
  |                    |                     |   status=processing|
  |<--[6] Show---------|                     |                   |
  |   "Processing"     |                     |                   |
  |                    |--[7] Subscribe to-->|                   |
  |                    |   job status changes|                   |
  |                    |                     |   [8] Process...  |
  |                    |                     |   (3-5 minutes)   |
  |                    |                     |<--[9] Write-------|
  |                    |                     |   match_results   |
  |                    |                     |<--[10] Update-----|
  |                    |                     |   status=completed|
  |                    |<--[11] Realtime-----|                   |
  |                    |   notification      |                   |
  |<--[12] Show--------|                     |                   |
  |   "Complete"       |                     |                   |
  |                    |--[13] Fetch-------->|                   |
  |                    |   match_results     |                   |
  |<--[14] Display-----|                     |                   |
  |   results          |                     |                   |
```

**Key Points:**
1. Frontend does NOT wait for n8n response (fire-and-forget webhook)
2. Status updates flow through Supabase, not directly from n8n
3. Realtime subscription notifies frontend when job completes
4. User can close browser and return later (state persists in Supabase)

---

### Inventory Update Flow

```
User                Frontend              Supabase
  |                    |                     |
  |--[1] Add/Edit----->|                     |
  |   artigo           |                     |
  |                    |--[2] INSERT/UPDATE->|
  |                    |<--[3] Confirmation--|
  |<--[4] Show success-|                     |
```

This flow is synchronous - no n8n involvement for basic CRUD.

---

### Authentication Flow

```
User                Frontend              Supabase Auth
  |                    |                     |
  |--[1] Login-------->|                     |
  |                    |--[2] signInWith---->|
  |                    |<--[3] Session/JWT---|
  |<--[4] Redirect-----|                     |
  |   to dashboard     |                     |
```

---

## Integration Patterns

### Frontend <-> Supabase

**Pattern:** Direct client SDK integration

**Implementation:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Auth
await supabase.auth.signInWithPassword({ email, password })

// CRUD
const { data } = await supabase.from('artigos').select('*')

// Realtime subscription for job status
supabase
  .channel(`job:${jobId}`)
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'processing_jobs', filter: `id=eq.${jobId}` },
    (payload) => setJobStatus(payload.new.status)
  )
  .subscribe()
```

**Security:** Use anon key on frontend (respects RLS). Never expose service_role key.

---

### Frontend -> n8n (Webhook Trigger)

**Pattern:** Fire-and-forget HTTP POST

**Implementation:**
```typescript
// After creating job in Supabase, trigger n8n
const triggerProcessing = async (jobId: string, rfpData: object) => {
  // Don't await - fire and forget
  fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_id: jobId, rfp_data: rfpData })
  }).catch(console.error) // Log but don't block
}
```

**Important:**
- Return immediately after triggering
- Do NOT wait for n8n response (will timeout after 3-5 min processing)
- n8n webhook should respond immediately with 200 OK (use "Respond Immediately" mode)

---

### n8n <-> Supabase

**Pattern:** Service-level database access

**Implementation in n8n:**
1. Use Supabase node with service_role credentials
2. Operations:
   - UPDATE processing_jobs SET status = 'processing'
   - SELECT * FROM artigos
   - INSERT INTO match_results
   - UPDATE processing_jobs SET status = 'completed'

**Credential Setup:**
- Create Supabase credentials in n8n using:
  - Project URL
  - Service role key (NOT anon key)

**Security Warning:** Service role key bypasses RLS. Use carefully and only for backend operations.

---

### Realtime Notification Pattern

**Recommended Approach:** Use Supabase Realtime Postgres Changes

**Topic Naming Convention:**
```
job:{user_id}:status    - User's job updates
user:{user_id}:notifications - General notifications
```

**Best Practices from Research:**
1. Use granular, user-specific channels (not global)
2. Clean up subscriptions on component unmount
3. Handle reconnection scenarios
4. Consider using `realtime.broadcast_changes()` with database triggers for scale

**Alternative (Better for Scale):** Database trigger + Broadcast
```sql
CREATE TRIGGER on_job_status_change
AFTER UPDATE ON processing_jobs
FOR EACH ROW
EXECUTE FUNCTION realtime.broadcast_changes();
```

---

## Concurrency Considerations

### Multiple Concurrent Users

**Challenge:** Multiple users submitting RFPs simultaneously

**Solution:**
1. Each job has unique ID and user_id
2. RLS policies ensure users only see their own jobs
3. n8n processes jobs independently (each webhook creates separate execution)
4. Supabase handles concurrent writes natively

**RLS Policy Example:**
```sql
CREATE POLICY "Users can only see own jobs"
ON processing_jobs FOR ALL
USING (auth.uid() = user_id);
```

### n8n Execution Limits

**Consideration:** n8n has execution limits based on plan
- Self-hosted: Configure max concurrent executions
- Cloud: Check plan limits

**Recommendation:** For production scale, consider:
- Job queue in Supabase for rate limiting
- n8n queue mode for controlled processing
- Monitor execution times and failures

---

## Error Handling Patterns

### Frontend Error States

```typescript
type JobStatus = 'pending' | 'processing' | 'completed' | 'failed'

// Display appropriate UI based on status
switch (job.status) {
  case 'failed':
    return <ErrorDisplay message={job.error_message} onRetry={retryJob} />
}
```

### n8n Error Handling

```
Workflow:
1. Try processing
2. On error:
   - Update job status to 'failed'
   - Store error message in error_message column
   - Log for debugging
```

### Webhook Trigger Failures

**If n8n webhook fails:**
1. Frontend shows job as 'pending' (no update received)
2. Implement retry logic or manual retry button
3. Consider health check endpoint on n8n

---

## Build Order

Recommended sequence based on component dependencies:

### Phase 1: Foundation (Supabase Setup)
**Build:** Database schema, RLS policies, authentication
**Why first:** Everything else depends on the data layer
**Deliverables:**
- Tables: artigos, processing_jobs, match_results
- RLS policies for multi-tenant security
- Auth configuration

### Phase 2: Core Frontend
**Build:** Basic Next.js app with Supabase auth and artigos CRUD
**Depends on:** Phase 1 (needs auth and database)
**Deliverables:**
- Auth flow (login, signup, session)
- Artigos management (list, add, edit, delete)
- Basic navigation structure

### Phase 3: n8n Workflow (Minimal)
**Build:** Webhook receiver that writes to Supabase
**Depends on:** Phase 1 (needs database access)
**Deliverables:**
- Webhook trigger node
- Supabase connection with service_role
- Minimal workflow: receive -> update status -> return

### Phase 4: Processing Integration
**Build:** Full processing flow with realtime updates
**Depends on:** Phases 1, 2, 3
**Deliverables:**
- Job submission UI
- Webhook trigger from frontend
- Realtime status subscription
- Status display components

### Phase 5: Core Processing Logic
**Build:** Actual RFP matching algorithm in n8n
**Depends on:** Phase 4 (integration working)
**Deliverables:**
- AI/ML matching workflow
- Progress updates during processing
- Result writing to match_results

### Phase 6: Results & Polish
**Build:** Match results display, history, UX polish
**Depends on:** Phase 5 (need results to display)
**Deliverables:**
- Match results visualization
- Match history views
- Error handling and retry flows
- Performance optimization

---

## Architecture Decision Records

### ADR-1: Why Supabase as Coordination Layer (not direct n8n callbacks)

**Decision:** n8n writes status to Supabase; frontend subscribes to Supabase

**Alternatives Considered:**
1. n8n callback webhook to frontend - Rejected: Frontend may be closed, no server
2. Frontend polls n8n execution status - Rejected: Complex, requires n8n API access
3. Frontend polls Supabase - Possible but Realtime is better

**Rationale:**
- User can close browser and return later
- Single source of truth (Supabase)
- Realtime subscriptions more efficient than polling
- Simpler security model (no n8n API exposure)

### ADR-2: Fire-and-Forget Webhook Pattern

**Decision:** Frontend triggers webhook without waiting for response

**Rationale:**
- Processing takes 3-5 minutes (HTTP timeout issues)
- Browser timeout limits (~60 seconds)
- Better UX with immediate feedback + async updates

### ADR-3: Service Role Key for n8n

**Decision:** n8n uses service_role key (bypasses RLS)

**Rationale:**
- n8n needs to update any user's job (not just authenticated user)
- RLS doesn't apply to backend services
- Security maintained by keeping key secret in n8n

**Mitigation:** Never expose service_role in frontend code

---

## Sources

### Supabase + n8n Integration
- [n8n Supabase Node Documentation](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.supabase/)
- [Supabase n8n Integration Page](https://supabase.com/partners/integrations/n8n)
- [n8n Supabase Integrations](https://n8n.io/integrations/supabase/)

### Async Processing Patterns
- [Microsoft Azure Async Request-Reply Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/async-request-reply)
- [AWS Architecture Blog: Managing Async Workflows](https://aws.amazon.com/blogs/architecture/managing-asynchronous-workflows-with-a-rest-api/)
- [Polling vs Webhooks Comparison](https://unified.to/blog/polling_vs_webhooks_when_to_use_one_over_the_other)

### Supabase Realtime
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Subscribing to Database Changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes)
- [Real-time Notifications with Supabase and Next.js](https://makerkit.dev/blog/tutorials/real-time-notifications-supabase-nextjs)

### n8n Long-Running Workflows
- [n8n Webhook Node Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [n8n Community: Async Webhooks for Long-Running Workflows](https://community.n8n.io/t/async-webhooks-around-a-long-running-workflow/134237)
- [n8n Respond to Webhook Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/)

### Supabase Job Queue Patterns
- [Supabase Queues Blog Post](https://supabase.com/blog/supabase-queues)
- [Processing Large Jobs with Edge Functions and Queues](https://supabase.com/blog/processing-large-jobs-with-edge-functions)
- [Background Jobs with Supabase Tables](https://www.jigz.dev/blogs/how-i-solved-background-jobs-using-supabase-tables-and-edge-functions)

### Frontend Integration
- [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Best Frontend for Supabase 2026 Comparison](https://www.weweb.io/blog/best-frontend-for-supabase)
- [Supabase React Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

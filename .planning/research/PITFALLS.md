# Pitfalls Research: Pharmaceutical RFP Matching App

**Domain:** SaaS web app with Supabase + n8n async workflow integration
**Researched:** 2026-01-21
**Confidence:** HIGH (verified with official docs and multiple sources)

---

## Critical Pitfalls

These mistakes cause security breaches, data loss, or require significant rewrites.

### 1. RLS Disabled During Development, Forgotten Before Launch

**What goes wrong:** Row Level Security is disabled by default on Supabase tables. Developers skip RLS during prototyping for convenience, then forget to enable it before production. Result: complete data exposure where any authenticated user can access all data.

**Warning signs:**
- Tables created without `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- No policies defined on tables containing sensitive data
- Using `service_role` key in client-side code "because RLS was being annoying"
- Testing only works with service_role, not anon/authenticated keys

**Prevention:**
1. Enable RLS immediately when creating tables, even in development
2. Create at least one policy per table before writing application code
3. Use Supabase CLI to test RLS policies locally before deployment
4. Add RLS policy review to your deployment checklist
5. Never use `service_role` key in client-side code

**Phase to address:** Phase 1 (Foundation) - establish RLS-first database design from day one

**Sources:** [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security), [ProsperaSoft RLS Misconfigurations](https://prosperasoft.com/blog/database/supabase/supabase-rls-issues/)

---

### 2. Webhook Timeout Kills Long-Running n8n Workflows

**What goes wrong:** Your RFP processing takes 3-5 minutes, but webhooks have strict timeout requirements. n8n Cloud enforces a 100-second timeout via Cloudflare. If the webhook doesn't respond in time, the request fails with 524 status, and the caller thinks the job failed even though it's still running.

**Warning signs:**
- Sporadic "job failed" errors for processing that actually completed
- Inconsistent success rates that correlate with processing complexity
- Users retrying jobs that create duplicate processing
- Timeouts appearing in logs without corresponding actual failures

**Prevention:**
1. **Implement async acknowledgment pattern:**
   - Webhook receives request, creates job record, returns 200 immediately with job ID
   - Processing happens asynchronously in n8n
   - Second endpoint for status polling or webhook callback when complete
2. Design n8n workflow with immediate response: use "Respond to Webhook" node early
3. Store job state in Supabase `jobs` table with status tracking
4. Set client-side expectations: show "processing" state, don't wait for response

**Phase to address:** Phase 2 (Core Features) - must be architected correctly from the start of async processing implementation

**Sources:** [n8n Webhook Common Issues](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/common-issues/), [Hookdeck Async Processing](https://hookdeck.com/webhooks/guides/why-implement-asynchronous-processing-webhooks)

---

### 3. No Idempotency in Webhook Handlers

**What goes wrong:** User clicks "Process RFP" twice, or n8n retries a failed step internally, or network hiccup causes duplicate webhook delivery. Without idempotency, you process the same RFP multiple times, create duplicate job records, or corrupt data.

**Warning signs:**
- Duplicate job entries in database for same RFP
- Users complaining about "double processing"
- Inconsistent inventory counts after processing
- Retry mechanisms causing cascading duplicates

**Prevention:**
1. Generate unique idempotency keys on the client (UUID or hash of request content)
2. Store idempotency keys in database with TTL
3. Check for existing key before processing; return cached result if found
4. Design database operations as upserts where possible
5. Use database transactions for multi-step operations

**Phase to address:** Phase 2 (Core Features) - implement with initial webhook integration

**Sources:** [Hookdeck Async Processing](https://hookdeck.com/webhooks/guides/why-you-should-stop-processing-your-webhooks-synchronously)

---

### 4. Storage Bucket Policies Misconfigured

**What goes wrong:** You need to handle CSV inventory uploads and PDF RFP files. Supabase Storage requires RLS policies on `storage.objects` table (not `storage.buckets`). Developers create policies on the wrong table, or forget that public buckets still need INSERT/UPDATE/DELETE policies.

**Warning signs:**
- File uploads work with service_role but fail with authenticated users
- "Permission denied" errors despite bucket being "public"
- Policies exist on `storage.buckets` instead of `storage.objects`
- File listing works but uploads fail (or vice versa)

**Prevention:**
1. Always create policies on `storage.objects` table, not `storage.buckets`
2. Public buckets only allow SELECT by default; add INSERT/UPDATE/DELETE policies explicitly
3. Include proper USING and WITH CHECK clauses in policies
4. Test with authenticated user tokens, not service_role
5. Debug with: `SELECT auth.uid(), auth.role();` and `SELECT * FROM storage.buckets WHERE id = 'your-bucket';`

**Phase to address:** Phase 2 (Core Features) - when implementing file upload functionality

**Sources:** [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control), [Supabase Storage Troubleshooting](https://supabase.com/docs/guides/storage/troubleshooting)

---

### 5. Manual Approval Workflow Allows Unapproved Users to Access Data

**What goes wrong:** User signs up, gets added to auth.users, but hasn't been approved yet. Without proper RLS policies checking approval status, the unapproved user can access the app and data. The approval field exists but isn't enforced.

**Warning signs:**
- Users can log in immediately after signup (expected), but can also access protected resources (bug)
- Approval status stored in profiles table but not checked in RLS policies
- Frontend-only approval checks (easily bypassed)
- Admin can "approve" users but nothing actually changes their access

**Prevention:**
1. Create `profiles` table with `is_approved` boolean, default false
2. All RLS policies must include `AND profiles.is_approved = true` check
3. Create trigger to auto-create profile row on user signup
4. Use database function to check approval status in policies
5. Test explicitly: create user, don't approve, verify they cannot access data

**Phase to address:** Phase 1 (Foundation) - core to authentication architecture

**Sources:** [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data), [FlutterFlow Community Discussion](https://community.flutterflow.io/ask-the-community/post/how-to-create-a-user-profile-approval-workflow-for-new-user-creation-in-tHlOjWQPmC5X8v2)

---

## Medium-Risk Pitfalls

These cause significant debugging time, performance issues, or technical debt.

### 6. n8n Webhook URL Misconfiguration Behind Reverse Proxy

**What goes wrong:** Self-hosted n8n behind nginx/traefik generates incorrect webhook URLs like `http://localhost:5678/webhook/abc123` instead of your public domain. External services can't reach the webhook, but testing from the same server works fine.

**Warning signs:**
- Webhooks work in n8n test mode but fail from Supabase/external services
- Webhook URLs contain `localhost` or internal IPs
- "URL unreachable" errors from webhook callers
- Works locally, fails in production

**Prevention:**
1. Set `WEBHOOK_URL` environment variable to your public URL
2. Set `N8N_PROXY_HOPS` if behind multiple reverse proxies
3. Configure SSL termination properly
4. Test webhooks from external source, not from the same server
5. Use production URLs from the start (test vs production webhook URLs in n8n)

**Phase to address:** Phase 2 (Core Features) - during n8n integration setup

**Sources:** [n8n Webhook Troubleshooting](https://blog.tamertemel.net/2025/09/25/fixing-n8n-webhook-problems-the-complete-troubleshooting-guide-for-self-hosted-instances/)

---

### 7. No Job Status Tracking for Long-Running Processes

**What goes wrong:** User submits RFP for processing, sees a spinner, waits 3-5 minutes with no feedback. They don't know if it's working, stuck, or failed. They refresh the page, losing their place. They submit again, creating duplicate jobs.

**Warning signs:**
- Users asking "is it still processing?"
- Support tickets about "stuck" processing that was actually working
- Duplicate job submissions
- No way to check historical job status

**Prevention:**
1. Create `jobs` table with: id, user_id, status (pending/processing/completed/failed), created_at, updated_at, error_message, result_url
2. Return job_id immediately when processing starts
3. Update status from n8n workflow at key checkpoints
4. Provide polling endpoint or use Supabase Realtime for status updates
5. Show progress indicators with time estimates
6. Allow users to view job history

**Phase to address:** Phase 2 (Core Features) - design with initial async processing

**Sources:** [Zuplo Async Operations](https://zuplo.com/learning-center/asynchronous-operations-in-rest-apis-managing-long-running-tasks)

---

### 8. Supabase Realtime Subscription Memory Leaks

**What goes wrong:** You use Supabase Realtime to push job status updates to the client. In React, subscriptions in useEffect without proper cleanup create memory leaks. React Strict Mode causes double-subscription issues. Channels aren't properly removed, accumulating connections.

**Warning signs:**
- "Channel already subscribed" errors
- Memory usage growing over time
- Realtime updates work initially, then stop after ~30 minutes
- Console errors about duplicate subscriptions
- Updates received multiple times

**Prevention:**
1. Always return cleanup function from useEffect that calls `channel.unsubscribe()`
2. Use unique channel names per subscription
3. Track subscription state to prevent double-subscription
4. Handle React Strict Mode by checking if already subscribed
5. Consider using Broadcast instead of Postgres Changes for scalability
6. Implement reconnection logic with exponential backoff

**Phase to address:** Phase 3 (Polish) - when implementing real-time status updates

**Sources:** [Supabase Realtime Troubleshooting](https://supabase.com/docs/guides/realtime/troubleshooting), [Medium: Production-ready Supabase Realtime](https://medium.com/@dipiash/supabase-realtime-postgres-changes-in-node-js-2666009230b0)

---

### 9. n8n Workflow Failures Without Alerting or Recovery

**What goes wrong:** n8n workflow fails at 2 AM due to transient API error. No one knows until users complain the next day. Failed jobs sit in limbo with no retry mechanism. Error details are lost.

**Warning signs:**
- Discovering failed workflows hours or days later
- No visibility into workflow health
- Manual intervention required to retry failed jobs
- Losing error context when workflows fail

**Prevention:**
1. Create dedicated Error Workflow using Error Trigger node
2. Send alerts (Slack, email) when workflows fail
3. Log errors to Supabase for historical analysis
4. Enable per-node retry with exponential backoff for API calls
5. Implement circuit breaker pattern for flaky external services
6. Create auto-retry workflow that periodically retries failed executions
7. Store execution IDs in jobs table for debugging

**Phase to address:** Phase 2 (Core Features) - implement with initial workflow creation

**Sources:** [n8n Error Handling Docs](https://docs.n8n.io/flow-logic/error-handling/), [Advanced n8n Error Handling](https://www.wednesday.is/writing-articles/advanced-n8n-error-handling-and-recovery-strategies)

---

### 10. Session/JWT Expiration Breaks Long Processing Jobs

**What goes wrong:** User starts 5-minute processing job. Their JWT expires mid-processing (default 1 hour, but if they were already 55 minutes into session...). When they poll for status, they get auth errors. Or worse: the n8n callback to Supabase fails because it was using a user-scoped token that expired.

**Warning signs:**
- Random auth errors during job status polling
- Jobs complete in n8n but status updates fail
- Users need to re-login mid-workflow
- Intermittent failures correlating with session age

**Prevention:**
1. Use service_role key for n8n callbacks to Supabase (server-to-server, not user-scoped)
2. Implement proper token refresh on client before starting long operations
3. Job status polling should handle 401 gracefully (refresh token, retry)
4. Don't store user JWT in n8n workflow; use service_role for backend operations
5. Set reasonable JWT expiration (1 hour default is fine for most cases)

**Phase to address:** Phase 2 (Core Features) - during auth integration with n8n

**Sources:** [Supabase Sessions Docs](https://supabase.com/docs/guides/auth/sessions)

---

### 11. Multi-User Concurrent Access Race Conditions

**What goes wrong:** Two users process the same inventory simultaneously. Both read current stock, both calculate new values, both write - last write wins, first user's changes lost. Or: user A starts editing an RFP, user B submits it while A is still working.

**Warning signs:**
- "My changes disappeared" reports
- Inventory counts don't match expected values
- Duplicate or missing records after concurrent operations
- Inconsistent state after parallel operations

**Prevention:**
1. Use database-level locking for critical operations (SELECT FOR UPDATE)
2. Implement optimistic concurrency with version numbers
3. Use transactions for multi-step operations
4. Show "currently being edited by X" indicators
5. For inventory: use atomic increment/decrement operations, not read-modify-write
6. Consider job queue for serializing critical operations

**Phase to address:** Phase 3 (Polish) - as concurrent usage increases

**Sources:** [InstaTunnel Multi-Tenant Leakage](https://instatunnel.my/blog/multi-tenant-leakage-when-row-level-security-fails-in-saas)

---

## Common Mistakes

Quick-reference list of frequent errors and how to avoid them.

### Database & Schema

- **Making schema changes in Supabase UI instead of migrations**: Use `supabase db push` and version your migrations in git. Supabase no longer allows table definition exports, making migration away difficult.

- **Dumping everything in public schema**: Organize tables into logical schemas as project grows.

- **Missing indexes on columns used in RLS policies**: Any column filtered in policies should be indexed. Use `EXPLAIN ANALYZE` to verify.

- **Complex RLS policies with multiple joins**: Policies that join tables on every row create overhead. Keep policies simple, pre-compute access where possible.

### Authentication

- **Using `user_metadata` in RLS policies**: User metadata can be modified by end users; don't rely on it for security decisions.

- **Forgetting that `auth.uid()` returns NULL for unauthenticated requests**: Explicitly check for authentication in policies.

- **Deleting users from auth.users doesn't sign them out**: JWT remains valid until expiration. Force logout requires additional handling.

- **Not testing RLS with actual user tokens**: Always test with authenticated users, not service_role.

### File Uploads

- **16MB payload limit on webhooks**: n8n webhooks have 16MB limit by default. For large files, upload directly to Supabase Storage and pass URL to n8n.

- **Not validating file types server-side**: Frontend validation is easily bypassed. Validate MIME types and extensions on backend.

- **Storing sensitive files in public buckets**: Use private buckets with proper policies for RFP documents.

### Async Processing

- **Processing webhook payload synchronously**: Return 200/202 immediately, process asynchronously. Don't make the caller wait.

- **No dead letter queue for failed jobs**: Failed jobs should go to DLQ for investigation, not disappear.

- **No reconciliation mechanism**: Implement periodic jobs to verify all submitted work was processed.

---

## Supabase-Specific Gotchas

| Gotcha | Impact | Solution |
|--------|--------|----------|
| Views bypass RLS by default | Data exposure | Add `security_invoker = true` (Postgres 15+) |
| RLS enabled but no policies = deny all | App broken | Always create at least one policy |
| Connection pooler changed ports (Feb 2025) | Connection failures | Use port 5432 for Session Mode, 6543 for Transaction Mode only |
| `getClaims()` doesn't verify session validity | Security | Use `getUser()` to confirm valid session |
| Realtime broadcasts every change by default | Performance | Enable only on necessary tables, disable UPDATE/DELETE if not needed |
| No live chat support even on Enterprise | Slow resolution | Budget extra time for support issues, self-diagnose with docs |
| Refresh token can only be used once | Auth errors | Handle concurrent refresh properly, use `REFRESH_TOKEN_REUSE_INTERVAL` |

**Sources:** [Supabase Best Practices](https://www.leanware.co/insights/supabase-best-practices), [Supabase Security 2025 Retro](https://supabase.com/blog/supabase-security-2025-retro), [GitHub Supabase Security Discussion](https://github.com/orgs/supabase/discussions/38690)

---

## n8n Integration Gotchas

| Gotcha | Impact | Solution |
|--------|--------|----------|
| 100-second Cloudflare timeout on n8n Cloud | Failed long jobs | Use async pattern with status polling |
| Test URL vs Production URL confusion | Works in dev, fails in prod | Use Production URL for deployed integrations |
| Retry on Fail doesn't work with "Continue" error setting | Silent failures | Use separate error output instead of Continue |
| Task runners required (deprecation warning) | Future breakage | Enable task runners proactively |
| Same path/method can only have one active webhook | Conflicts | Use unique paths or deactivate conflicting workflows |
| Webhook IP whitelist fails behind proxy | Connection blocked | Set `N8N_PROXY_HOPS` environment variable |
| Execution data size limits | Lost data | Configure `N8N_PAYLOAD_SIZE_MAX` for self-hosted |

**Sources:** [n8n Webhook Docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/), [n8n Error Handling](https://docs.n8n.io/flow-logic/error-handling/), [n8n Self-Hosted Guide 2025](https://www.tva.sg/complete-n8n-self-hosted-troubleshooting-guide-2025-fixing-execution-data-size-webhook-problems-with-traefik/)

---

## Phase-Specific Risk Summary

| Phase | Highest-Risk Pitfalls | Mitigation Focus |
|-------|----------------------|------------------|
| Phase 1: Foundation | RLS disabled (#1), Approval bypass (#5) | Security-first database design, auth architecture |
| Phase 2: Core Features | Webhook timeout (#2), No idempotency (#3), Storage policies (#4), No job tracking (#7), No error handling (#9), JWT expiration (#10) | Async architecture, proper webhook patterns |
| Phase 3: Polish | Realtime leaks (#8), Race conditions (#11) | Production hardening, concurrent access handling |

---

## Verification Checklist

Before each phase completes:

**Phase 1:**
- [ ] RLS enabled on ALL tables
- [ ] Every table has at least one policy
- [ ] Approval status checked in RLS policies
- [ ] Service role key never in client code
- [ ] Migrations versioned in git

**Phase 2:**
- [ ] Webhooks respond within timeout
- [ ] Job status tracking implemented
- [ ] Idempotency keys in place
- [ ] Storage policies on `storage.objects`
- [ ] Error workflow with alerting
- [ ] n8n uses service_role for Supabase calls

**Phase 3:**
- [ ] Realtime subscriptions properly cleaned up
- [ ] Concurrent access handled
- [ ] Connection pooling configured
- [ ] Monitoring and alerting active

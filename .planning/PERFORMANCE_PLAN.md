# Performance Optimization Plan - Cardiva App

## Executive Summary

Deep analysis identified **25+ performance issues** across React components, database queries, API patterns, and UI rendering. This plan organizes fixes into 4 phases by impact and effort.

**Estimated Impact**: 40-60% improvement in perceived responsiveness after Phase 1-2.

---

## Critical Issues Overview

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| React/Component | 0 | 2 | 4 | 2 |
| Database/Queries | 3 | 4 | 3 | 0 |
| Server Actions | 1 | 1 | 3 | 0 |
| UI Rendering | 0 | 1 | 2 | 3 |
| **Total** | **4** | **8** | **12** | **5** |

---

## Phase 1: Quick Wins (2-3 hours)

High impact, low effort fixes that provide immediate improvement.

### 1.1 Add React.memo to Row Components

**Files:**
- `src/app/(dashboard)/rfps/components/match-review-table.tsx`
- `src/app/(dashboard)/rfps/components/rfp-jobs-list.tsx`
- `src/app/(dashboard)/inventory/components/inventory-table.tsx`

**Issue:** Row components (`ItemRow`, `RFPJobRow`) re-render on every parent state change even when their props haven't changed.

**Fix:**
```typescript
// Before
function ItemRow({ jobId, item, ... }: ItemRowProps) { ... }

// After
const ItemRow = React.memo(function ItemRow({ jobId, item, ... }: ItemRowProps) {
  // ... same logic
})
```

**Impact:** Prevents 25-100 unnecessary re-renders per interaction.

---

### 1.2 Memoize Expensive Computations

**File:** `src/app/(dashboard)/rfps/components/match-review-table.tsx` (Lines 168-224)

**Issue:** `sortItems()` and `filterBySearch()` run on every render without memoization.

**Fix:**
```typescript
// Before
const sorted = sortItems(items, sortBy, sortDir)
const filtered = filterBySearch(sorted, search)

// After
const processedItems = useMemo(() => {
  const sorted = sortItems(items, sortBy, sortDir)
  const filtered = filterBySearch(sorted, search)
  return filterByStatus(filtered, status)
}, [items, sortBy, sortDir, search, status])
```

**Impact:** Eliminates O(n log n) + O(n) computation per render.

---

### 1.3 Memoize Callback Functions

**Files:**
- `src/app/(dashboard)/rfps/components/match-review-table.tsx` (SortableHeader)
- `src/app/(dashboard)/rfps/[id]/matches/components/manual-match-dialog.tsx`

**Issue:** Inline functions in JSX create new references every render.

**Fix:**
```typescript
// Before
<button onClick={() => onSort(column)}>

// After
const handleSort = useCallback(() => onSort(column), [column, onSort])
<button onClick={handleSort}>
```

---

### 1.4 Remove Console Logs from Production

**Files:**
- `src/app/(dashboard)/layout.tsx` (Lines 38-45)
- `src/contexts/rfp-upload-status-context.tsx` (Lines 184-242)

**Fix:** Remove or wrap in `if (process.env.NODE_ENV === 'development')`.

---

### 1.5 Fix CSS Transition Anti-Pattern

**File:** `src/app/(dashboard)/rfps/components/confidence-bar.tsx`

**Issue:** `transition-all` animates all properties causing unnecessary repaints.

**Fix:**
```typescript
// Before
className="h-full bg-primary transition-all duration-300"

// After
className="h-full bg-primary transition-[width] duration-300"
```

---

## Phase 2: Database & Query Optimization (4-6 hours)

Fixes that reduce database load and eliminate query inefficiencies.

### 2.1 Fix N+1 Query in fetchItemWithMatches (CRITICAL)

**File:** `src/app/(dashboard)/rfps/[id]/matches/actions.ts` (Lines 39-56)

**Issue:** Performs separate query for each match suggestion to get `descricao_comercial` from `artigos` table. For 25 items × 5 suggestions = 125 extra queries.

**Fix:** Add join to the initial query:
```typescript
// Before
.select(`
  *,
  rfp_match_suggestions!rfp_match_suggestions_rfp_item_id_fkey (*)
`)

// After
.select(`
  *,
  rfp_match_suggestions!rfp_match_suggestions_rfp_item_id_fkey (
    *,
    artigos!rfp_match_suggestions_artigo_fkey (descricao_comercial)
  )
`)
```

Then remove the N+1 loop entirely.

**Impact:** Reduces 125 queries to 1 query per page load.

---

### 2.2 Batch Updates in autoAcceptExactMatches (CRITICAL)

**File:** `src/app/(dashboard)/rfps/[id]/matches/actions.ts` (Lines 445-477)

**Issue:** Sequential updates for each item with exact match (3 queries × N items).

**Fix Option A - Promise.all:**
```typescript
const updatePromises = items
  .filter(item => hasExactMatch(item))
  .flatMap(item => {
    const exactMatch = getExactMatch(item)
    return [
      supabase.from('rfp_match_suggestions').update({ status: 'accepted' }).eq('id', exactMatch.id),
      supabase.from('rfp_match_suggestions').update({ status: 'rejected' }).eq('rfp_item_id', item.id).neq('id', exactMatch.id),
      supabase.from('rfp_items').update({ review_status: 'accepted', selected_match_id: exactMatch.id }).eq('id', item.id)
    ]
  })

await Promise.all(updatePromises)
```

**Fix Option B - Database RPC (better):**
Create Postgres function `auto_accept_exact_matches(job_id uuid)` that handles all updates in single transaction.

**Impact:** Reduces 300 sequential queries to ~3 parallel batches or 1 RPC call.

---

### 2.3 Add Missing Database Indexes

**Issue:** Queries filtering on foreign keys without indexes cause full table scans.

**Migration file:** `supabase/migrations/YYYYMMDD_add_performance_indexes.sql`

```sql
-- Critical indexes for RFP matching
CREATE INDEX IF NOT EXISTS idx_rfp_items_job_id ON rfp_items(job_id);
CREATE INDEX IF NOT EXISTS idx_rfp_items_review_status ON rfp_items(review_status);
CREATE INDEX IF NOT EXISTS idx_rfp_match_suggestions_rfp_item_id ON rfp_match_suggestions(rfp_item_id);
CREATE INDEX IF NOT EXISTS idx_rfp_match_suggestions_status ON rfp_match_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_artigos_artigo ON artigos(artigo);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_rfp_items_job_status ON rfp_items(job_id, review_status);
CREATE INDEX IF NOT EXISTS idx_rfp_match_suggestions_item_status ON rfp_match_suggestions(rfp_item_id, status);
```

---

### 2.4 Fix Dashboard Stats Loading All Matches

**File:** `src/app/(dashboard)/actions.ts` (Line 78)

**Issue:** Loads entire `rfp_match_suggestions` table (100k+ rows) to calculate acceptance rate.

**Fix:** Add date filter and limit:
```typescript
// Before
supabase.from('rfp_match_suggestions').select('status, created_at')

// After
const sixMonthsAgo = new Date()
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

supabase
  .from('rfp_match_suggestions')
  .select('status, created_at')
  .gte('created_at', sixMonthsAgo.toISOString())
  .limit(10000)
```

Or better: Create database view/function for aggregated stats.

---

### 2.5 Remove Duplicate Data Fetch in Matches Page

**File:** `src/app/(dashboard)/rfps/[id]/matches/page.tsx` (Lines 72-125 vs 200-208)

**Issue:** Fetches paginated items (25) then fetches ALL items again for counting.

**Fix:** Use the `count` from paginated query:
```typescript
// Already have count from:
const { data: items, count } = await query.range(from, to)

// Remove second query that fetches all items
// Use `count` directly for total item count
```

---

### 2.6 Parallelize Query Waterfalls

**Files:**
- `src/app/(dashboard)/inventory/page.tsx` (Lines 32-68)
- `src/app/(dashboard)/rfps/page.tsx` (Lines 188-242)
- `src/app/(dashboard)/rfps/[id]/matches/page.tsx` (Lines 56-127)

**Issue:** Sequential queries that could run in parallel.

**Example fix for matches page:**
```typescript
// Before (sequential)
const { data: job } = await supabase.from('rfp_upload_jobs')...
await autoAcceptExactMatches(jobId)
const { data: items } = await supabase.from('rfp_items')...

// After (parallel where possible)
const [{ data: job }, { data: items }] = await Promise.all([
  supabase.from('rfp_upload_jobs').select(...),
  supabase.from('rfp_items').select(...)
])
// Auto-accept can run after items loaded (or in parallel if independent)
```

---

### 2.7 Reduce SELECT * Usage

**Files:**
- `src/app/(dashboard)/rfps/actions.ts` (Lines 211, 238)
- `src/app/(dashboard)/inventory/actions.ts` (Line 106)
- `src/app/(dashboard)/admin/settings/page.tsx` (Lines 12, 19, 26)

**Issue:** `SELECT *` fetches unnecessary columns.

**Fix:** Specify only needed columns:
```typescript
// Before
.select('*')

// After
.select('id, status, file_name, created_at, completed_at')
```

---

## Phase 3: State Management & Context (3-4 hours)

Optimize React state patterns and context usage.

### 3.1 Split RFP Upload Context

**File:** `src/contexts/rfp-upload-status-context.tsx`

**Issue:** Single context with `uploadQueue`, `activeJob`, `lastCompletedJob`, `refreshTrigger` causes all consumers to re-render on any change.

**Fix:** Split into separate contexts:
```typescript
// Separate contexts
const UploadQueueContext = createContext<UploadQueue>()
const ActiveJobContext = createContext<ActiveJob>()
const RefreshContext = createContext<RefreshTrigger>()

// Components subscribe only to what they need
const { activeJob } = useActiveJob() // Won't re-render on queue changes
```

---

### 3.2 Fix Duplicate State in Match Review

**File:** `src/app/(dashboard)/rfps/components/match-review-content.tsx` (Lines 44-56)

**Issue:** Maintains both `allItems` and `paginatedItems` state separately, updating both on every change.

**Fix:** Single source of truth with derived state:
```typescript
// Before
const [allItems, setAllItems] = useState(items)
const [paginatedItems, setPaginatedItems] = useState(items)

// After
const [allItems, setAllItems] = useState(items)
const paginatedItems = useMemo(
  () => allItems.slice(from, to),
  [allItems, from, to]
)
```

---

### 3.3 Filter Realtime Subscriptions

**File:** `src/hooks/use-upload-status.ts` (Lines 109-129)

**Issue:** Subscribes to ALL job updates, receives updates for all users.

**Fix:**
```typescript
// Before
.on('postgres_changes', {
  event: 'UPDATE',
  schema: 'public',
  table: 'inventory_upload_jobs',
}, ...)

// After
.on('postgres_changes', {
  event: 'UPDATE',
  schema: 'public',
  table: 'inventory_upload_jobs',
  filter: `user_id=eq.${user.id}`,
}, ...)
```

---

## Phase 4: Bundle & Infrastructure (2-3 hours)

Optimize bundle size and caching strategies.

### 4.1 Dynamic Import pdfjs-dist

**Issue:** `pdfjs-dist` (10MB+) loaded on every page.

**Fix:** Already using dynamic import in `pdf-thumbnail.ts`. Verify it's not imported elsewhere statically.

Check: `grep -r "from 'pdfjs-dist'" src/`

---

### 4.2 Dynamic Import Recharts

**File:** `src/app/(dashboard)/components/dashboard-chart.tsx`

**Issue:** Recharts (900KB) loaded for all dashboard pages.

**Fix:**
```typescript
// In dashboard page
const DashboardChart = dynamic(
  () => import('./components/dashboard-chart'),
  { ssr: false, loading: () => <ChartSkeleton /> }
)
```

---

### 4.3 Add Webhook Retry Logic (CRITICAL)

**Files:**
- `src/lib/n8n/rfp-webhook.ts`
- `src/lib/n8n/webhook.ts`
- `src/lib/n8n/export-webhook.ts`

**Issue:** Fire-and-forget webhooks with no retry on failure.

**Fix:**
```typescript
async function triggerWebhookWithRetry(
  url: string,
  payload: FormData,
  maxRetries: number = 3
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: payload,
        signal: AbortSignal.timeout(30000), // 30s timeout
      })

      if (response.ok) return response

      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      if (attempt === maxRetries - 1) throw error

      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
    }
  }
  throw new Error('Max retries exceeded')
}
```

---

### 4.4 Evaluate Caching Strategy

**Issue:** All pages use `force-dynamic`, disabling all caching.

**Files to evaluate:**
- `src/app/(dashboard)/page.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/rfps/page.tsx`
- `src/app/(dashboard)/inventory/page.tsx`

**Consideration:** For auth-required pages, `force-dynamic` is often necessary. However, consider:
- Static generation for help pages, FAQs
- `revalidate: 60` for infrequently changing data
- React Query for client-side caching

---

## Implementation Checklist

### Phase 1 (Day 1)
- [ ] 1.1 Add React.memo to ItemRow, RFPJobRow
- [ ] 1.2 Add useMemo for sortItems/filterBySearch
- [ ] 1.3 Add useCallback for sort handlers
- [ ] 1.4 Remove console.log statements
- [ ] 1.5 Fix transition-all to transition-[width]

### Phase 2 (Day 2-3)
- [ ] 2.1 Fix N+1 query in fetchItemWithMatches
- [ ] 2.2 Batch autoAcceptExactMatches updates
- [ ] 2.3 Create and apply database indexes
- [ ] 2.4 Fix dashboard stats query
- [ ] 2.5 Remove duplicate fetch in matches page
- [ ] 2.6 Parallelize sequential queries
- [ ] 2.7 Replace SELECT * with specific columns

### Phase 3 (Day 4)
- [ ] 3.1 Split RFP upload context
- [ ] 3.2 Fix duplicate state in match review
- [ ] 3.3 Filter realtime subscriptions by user

### Phase 4 (Day 5)
- [ ] 4.1 Verify pdfjs-dist dynamic import
- [ ] 4.2 Dynamic import Recharts
- [ ] 4.3 Add webhook retry logic
- [ ] 4.4 Evaluate caching opportunities

---

## Monitoring & Validation

After each phase, validate improvements:

1. **React DevTools Profiler**
   - Record interactions (sort, filter, paginate)
   - Verify row components don't re-render unnecessarily

2. **Network Tab**
   - Count Supabase queries per page load
   - Verify query parallelization

3. **Supabase Dashboard**
   - Check query execution times
   - Verify indexes are being used (EXPLAIN ANALYZE)

4. **Lighthouse**
   - Run before/after Phase 4
   - Track LCP, TBT improvements

---

## Risk Assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| React.memo | Low | Test that updates still propagate correctly |
| Database indexes | Low | Test on staging first; indexes only help reads |
| Query parallelization | Medium | Ensure no data dependencies between parallel queries |
| Context splitting | Medium | Thorough testing of upload flow |
| Webhook retry | Medium | Test timeout/retry behavior; don't retry user errors |

---

## Expected Outcomes

| Metric | Current | After Phase 1-2 | After All Phases |
|--------|---------|-----------------|------------------|
| Match page load | ~2-3s | ~1-1.5s | ~0.8-1s |
| Sort/filter response | ~300-500ms | ~50-100ms | ~50ms |
| Dashboard stats load | ~1-2s | ~500ms | ~300ms |
| Bundle size (initial) | ~800KB | ~800KB | ~600KB |
| Queries per page | 5-125 | 3-5 | 2-3 |

# Phase 7: Match Review - Research

**Researched:** 2026-01-22
**Domain:** RFP item display, match review UI, accept/reject interactions, optimistic updates
**Confidence:** HIGH

## Summary

Phase 7 implements the match review interface where users view extracted RFP items with AI-suggested inventory matches and make accept/reject decisions. The research reveals that the infrastructure is ready from Phases 5-6:

- **Database schema** exists with `rfp_items` and `rfp_match_suggestions` tables, including RLS policies and Realtime enabled
- **RLS policies** allow users to SELECT and UPDATE their own items/suggestions
- **Data relationships**: Each RFP item has multiple match suggestions, ordered by `similarity_score` DESC and `rank`
- **Navigation link** already exists in toast completion handler pointing to `/rfps/${jobId}/matches`

The primary work for Phase 7 is building:
1. A new dynamic route `/rfps/[id]/matches/page.tsx` for the match review page
2. RFP items list component with nested match suggestions
3. Accept/reject interaction buttons with Server Actions
4. Visual confidence indicator (teal progress bar)
5. Status-based styling (opacity for reviewed items, collapsing behavior)

**Key insight:** The database schema already supports all required features. The `review_status` on `rfp_items` tracks overall item state, while `status` on `rfp_match_suggestions` tracks individual match decisions. The `selected_match_id` FK links accepted matches back to items.

**Primary recommendation:** Build a Server Component page that fetches all items + suggestions in one query using Supabase joins, then render client components for interactivity. Use Server Actions for accept/reject with `revalidatePath` for cache invalidation. Apply CSS transitions for the collapsing/opacity effects.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/ssr | ^0.8.0 | Server-side Supabase client | Already configured for SSR |
| @supabase/supabase-js | ^2.91.0 | Database queries, Realtime | Already used throughout |
| lucide-react | ^0.562.0 | Icons (Check, X, etc.) | Consistent icon system |
| tailwind-merge | ^3.4.0 | Class merging with cn() | Already in use |
| date-fns | ^4.1.0 | Date formatting | Already installed |

### Already Available UI Components
| Component | Location | Purpose |
|-----------|----------|---------|
| Card | @/components/ui/card | Container for RFP items |
| Button | @/components/ui/button | Accept/Reject actions |
| Badge | @/components/ui/badge | Status indicators |
| Skeleton | @/components/ui/skeleton | Loading states |
| Progress | @/components/ui/progress | Confidence bar |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Server Actions | API routes | Server Actions simpler, automatic cache invalidation |
| CSS transitions | Framer Motion | CSS sufficient for opacity/collapse, no new dependency |
| revalidatePath | Realtime | Realtime overkill for user-initiated changes |
| Manual optimistic UI | useOptimistic | useOptimistic adds complexity for simple state |

**No new dependencies required.**

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (dashboard)/
│   └── rfps/
│       ├── page.tsx                        # Jobs list (existing)
│       ├── actions.ts                      # Upload actions (existing)
│       ├── [id]/
│       │   └── matches/
│       │       ├── page.tsx                # NEW: Match review page (Server Component)
│       │       └── actions.ts              # NEW: Accept/reject Server Actions
│       └── components/
│           ├── rfp-jobs-list.tsx           # Existing
│           ├── rfp-item-card.tsx           # NEW: Single RFP item with matches
│           ├── match-suggestion-row.tsx    # NEW: Single match suggestion row
│           └── confidence-bar.tsx          # NEW: Teal progress bar
```

### Pattern 1: Server Component Data Fetching with Joins
**What:** Fetch all items + suggestions in one query using Supabase relations
**When to use:** Initial page load for match review page

**Example:**
```typescript
// Source: Supabase documentation on relations
// app/(dashboard)/rfps/[id]/matches/page.tsx

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MatchReviewPage({ params }: PageProps) {
  const { id: jobId } = await params
  const supabase = await createClient()

  // Verify user owns this job
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch job with validation
  const { data: job, error: jobError } = await supabase
    .from('rfp_upload_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (jobError || !job) {
    notFound()
  }

  // Fetch items with nested match suggestions
  const { data: items, error: itemsError } = await supabase
    .from('rfp_items')
    .select(`
      *,
      rfp_match_suggestions (
        id,
        codigo_spms,
        artigo,
        descricao,
        similarity_score,
        status,
        rank
      )
    `)
    .eq('job_id', jobId)
    .order('lote_pedido', { ascending: true })
    .order('posicao_pedido', { ascending: true })

  if (itemsError) {
    console.error('Failed to fetch items:', itemsError)
    throw new Error('Failed to load match results')
  }

  // Sort match suggestions by similarity_score DESC within each item
  const itemsWithSortedMatches = items?.map(item => ({
    ...item,
    rfp_match_suggestions: (item.rfp_match_suggestions || [])
      .sort((a, b) => b.similarity_score - a.similarity_score)
  }))

  return (
    <MatchReviewClient
      job={job}
      items={itemsWithSortedMatches ?? []}
    />
  )
}
```

### Pattern 2: Server Actions for Accept/Reject
**What:** Server Actions that update database and revalidate cache
**When to use:** User clicks Accept or Reject on a match suggestion

**Example:**
```typescript
// Source: Next.js 15 Server Actions documentation
// app/(dashboard)/rfps/[id]/matches/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptMatch(
  jobId: string,
  rfpItemId: string,
  matchId: string
) {
  const supabase = await createClient()

  // Verify user owns this item (RLS handles this, but explicit check is safer)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Transaction: update match status + item status + reject other matches
  // Step 1: Accept the selected match
  const { error: matchError } = await supabase
    .from('rfp_match_suggestions')
    .update({ status: 'accepted' })
    .eq('id', matchId)

  if (matchError) {
    return { success: false, error: matchError.message }
  }

  // Step 2: Reject all other matches for this item
  const { error: rejectError } = await supabase
    .from('rfp_match_suggestions')
    .update({ status: 'rejected' })
    .eq('rfp_item_id', rfpItemId)
    .neq('id', matchId)

  if (rejectError) {
    console.error('Failed to reject other matches:', rejectError)
    // Non-fatal: continue
  }

  // Step 3: Update the RFP item
  const { error: itemError } = await supabase
    .from('rfp_items')
    .update({
      review_status: 'accepted',
      selected_match_id: matchId
    })
    .eq('id', rfpItemId)

  if (itemError) {
    return { success: false, error: itemError.message }
  }

  revalidatePath(`/rfps/${jobId}/matches`)
  return { success: true }
}

export async function rejectMatch(
  jobId: string,
  rfpItemId: string,
  matchId: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Reject this specific match
  const { error: matchError } = await supabase
    .from('rfp_match_suggestions')
    .update({ status: 'rejected' })
    .eq('id', matchId)

  if (matchError) {
    return { success: false, error: matchError.message }
  }

  // Check if all matches are now rejected
  const { data: remainingMatches } = await supabase
    .from('rfp_match_suggestions')
    .select('id')
    .eq('rfp_item_id', rfpItemId)
    .neq('status', 'rejected')

  // If no pending matches left, mark item as rejected
  if (!remainingMatches || remainingMatches.length === 0) {
    await supabase
      .from('rfp_items')
      .update({
        review_status: 'rejected',
        selected_match_id: null
      })
      .eq('id', rfpItemId)
  }

  revalidatePath(`/rfps/${jobId}/matches`)
  return { success: true }
}
```

### Pattern 3: Client Interaction with useTransition
**What:** Wrap Server Action calls in useTransition for loading states
**When to use:** Accept/Reject button clicks

**Example:**
```typescript
// Source: React 19 useTransition documentation
// components/match-suggestion-row.tsx
'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { acceptMatch, rejectMatch } from '@/app/(dashboard)/rfps/[id]/matches/actions'
import { cn } from '@/lib/utils'

interface MatchSuggestionRowProps {
  jobId: string
  rfpItemId: string
  match: {
    id: string
    codigo_spms: string | null
    artigo: string | null
    descricao: string | null
    similarity_score: number
    status: 'pending' | 'accepted' | 'rejected'
  }
}

export function MatchSuggestionRow({ jobId, rfpItemId, match }: MatchSuggestionRowProps) {
  const [isPending, startTransition] = useTransition()

  const handleAccept = () => {
    startTransition(async () => {
      await acceptMatch(jobId, rfpItemId, match.id)
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      await rejectMatch(jobId, rfpItemId, match.id)
    })
  }

  const isAccepted = match.status === 'accepted'
  const isRejected = match.status === 'rejected'

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-md border transition-all',
        isAccepted && 'bg-primary/5 border-primary/30',
        isRejected && 'opacity-50',
        isPending && 'opacity-70 pointer-events-none'
      )}
    >
      {/* Match data columns */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        <span className="font-mono text-sm">{match.codigo_spms || '-'}</span>
        <span className="text-sm">{match.artigo || '-'}</span>
        <span className="text-sm truncate">{match.descricao || '-'}</span>
      </div>

      {/* Confidence bar */}
      <div className="w-24">
        <ConfidenceBar score={match.similarity_score} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Button
              size="icon-sm"
              variant={isAccepted ? 'default' : 'outline'}
              onClick={handleAccept}
              disabled={isAccepted}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon-sm"
              variant={isRejected ? 'destructive' : 'outline'}
              onClick={handleReject}
              disabled={isRejected}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
```

### Pattern 4: Confidence Bar Component
**What:** Teal-colored progress bar showing match confidence
**When to use:** Display similarity_score visually for each match

**Example:**
```typescript
// Source: CONTEXT.md decision: single teal color, no gradient
// components/confidence-bar.tsx
'use client'

import { cn } from '@/lib/utils'

interface ConfidenceBarProps {
  score: number // 0.0000 to 1.0000
  className?: string
}

export function ConfidenceBar({ score, className }: ConfidenceBarProps) {
  // Score is 0-1, convert to percentage
  const percentage = Math.round(score * 100)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">
        {percentage}%
      </span>
    </div>
  )
}
```

### Pattern 5: Collapsible Reviewed Items
**What:** Reviewed items collapse to show only outcome; pending items stay expanded
**When to use:** After user accepts or rejects matches for an item

**Example:**
```typescript
// Source: CONTEXT.md decision: collapse reviewed, opacity-based distinction
// components/rfp-item-card.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MatchSuggestionRow } from './match-suggestion-row'

interface RFPItemCardProps {
  jobId: string
  item: {
    id: string
    descricao_pedido: string
    lote_pedido: number | null
    posicao_pedido: number | null
    review_status: 'pending' | 'accepted' | 'rejected' | 'manual'
    selected_match_id: string | null
    rfp_match_suggestions: Array<{
      id: string
      codigo_spms: string | null
      artigo: string | null
      descricao: string | null
      similarity_score: number
      status: 'pending' | 'accepted' | 'rejected'
    }>
  }
}

export function RFPItemCard({ jobId, item }: RFPItemCardProps) {
  const isReviewed = item.review_status !== 'pending'
  const [isExpanded, setIsExpanded] = useState(!isReviewed)

  // Find accepted match for collapsed view
  const acceptedMatch = item.rfp_match_suggestions.find(m => m.status === 'accepted')

  return (
    <Card
      className={cn(
        'transition-opacity',
        isReviewed && 'opacity-70'
      )}
    >
      <CardHeader
        className={cn(
          'cursor-pointer',
          isReviewed && 'cursor-pointer hover:bg-muted/50'
        )}
        onClick={() => isReviewed && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {item.lote_pedido && (
              <Badge variant="outline" className="font-mono">
                Lote {item.lote_pedido}
                {item.posicao_pedido && `.${item.posicao_pedido}`}
              </Badge>
            )}
            <CardTitle className="text-base font-medium">
              {item.descricao_pedido}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {item.review_status === 'accepted' && (
              <Badge className="bg-primary/10 text-primary border-primary/30">
                <Check className="h-3 w-3 mr-1" />
                Matched
              </Badge>
            )}
            {item.review_status === 'rejected' && (
              <Badge variant="secondary">
                <X className="h-3 w-3 mr-1" />
                No Match
              </Badge>
            )}
            {isReviewed && (
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            )}
          </div>
        </div>

        {/* Collapsed summary for reviewed items */}
        {isReviewed && !isExpanded && acceptedMatch && (
          <div className="mt-2 text-sm text-muted-foreground">
            Matched to: {acceptedMatch.artigo} - {acceptedMatch.descricao}
          </div>
        )}
      </CardHeader>

      {/* Expandable content */}
      {isExpanded && (
        <CardContent className="space-y-2">
          {item.rfp_match_suggestions.map(match => (
            <MatchSuggestionRow
              key={match.id}
              jobId={jobId}
              rfpItemId={item.id}
              match={match}
            />
          ))}
          {item.rfp_match_suggestions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No match suggestions available
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
}
```

### Anti-Patterns to Avoid

- **Anti-pattern: Fetching items then matches separately**: Use Supabase nested select to get all data in one query. Separate queries cause waterfalls and N+1 problems.

- **Anti-pattern: Client-side state for accept/reject status**: Let the server be the source of truth. Use `revalidatePath` to refetch; don't maintain duplicate state.

- **Anti-pattern: Complex animations for state changes**: CONTEXT.md says "subtle animation/pulse". Use CSS transitions on opacity/transform, not full animation libraries.

- **Anti-pattern: Conditional rendering for loading**: Use `useTransition` with `isPending` to show inline loading state, not replace entire component with skeleton.

- **Anti-pattern: Optimistic updates with manual rollback**: For this use case, the action is fast enough. Use `useTransition` for immediate visual feedback without complex optimistic state management.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confidence visualization | Custom SVG chart | Modified Progress component | Consistent with design system |
| Loading states | Custom loading component | useTransition + opacity | Built into React 19 |
| Data fetching | useEffect + fetch | RSC page.tsx + Supabase | Server Components handle this |
| Cache invalidation | Manual refetch | revalidatePath | Next.js built-in |
| Icon buttons | Custom SVG buttons | Button size="icon-sm" | Already in shadcn/ui |
| Status badges | Custom styled spans | Badge component | Already configured |

**Key insight:** All UI primitives exist. The work is composing them into the match review interface per CONTEXT.md decisions.

## Common Pitfalls

### Pitfall 1: N+1 Query on Items + Matches
**What goes wrong:** Page loads slowly, too many database queries.

**Why it happens:** Fetching items then looping to fetch matches for each.

**How to avoid:**
```typescript
// Use Supabase nested select
const { data: items } = await supabase
  .from('rfp_items')
  .select(`
    *,
    rfp_match_suggestions (*)
  `)
  .eq('job_id', jobId)
```

**Warning signs:** Slow page loads, many queries in Supabase logs.

### Pitfall 2: Server Action Not Revalidating
**What goes wrong:** User accepts match but UI doesn't update.

**Why it happens:** Forgot `revalidatePath` or wrong path.

**How to avoid:**
```typescript
// Always call revalidatePath with exact path
revalidatePath(`/rfps/${jobId}/matches`)
```

**Warning signs:** Need to refresh page to see changes.

### Pitfall 3: RLS Blocking Updates
**What goes wrong:** Accept/reject fails silently or with permission error.

**Why it happens:** RLS policy doesn't allow UPDATE, or using wrong client.

**How to avoid:**
```typescript
// Verify RLS policy exists (it does per migration file)
// Policy: "Users can update own rfp items" and "Users can update own match suggestions"
// Use server client which respects RLS with user session
```

**Warning signs:** `permission denied for table` errors.

### Pitfall 4: Match Sort Order Wrong
**What goes wrong:** Highest confidence match not shown first.

**Why it happens:** Not sorting by similarity_score DESC.

**How to avoid:**
```typescript
// Sort in query or after fetch
const sorted = matches.sort((a, b) => b.similarity_score - a.similarity_score)
```

**Warning signs:** Low-confidence matches appearing before high-confidence.

### Pitfall 5: Item Status Not Updating After All Rejects
**What goes wrong:** All matches rejected but item still shows "pending".

**Why it happens:** Not checking remaining matches after reject.

**How to avoid:**
```typescript
// After rejecting a match, check if any pending matches remain
const { data: remaining } = await supabase
  .from('rfp_match_suggestions')
  .select('id')
  .eq('rfp_item_id', rfpItemId)
  .neq('status', 'rejected')

if (!remaining || remaining.length === 0) {
  // Mark item as rejected
  await supabase
    .from('rfp_items')
    .update({ review_status: 'rejected' })
    .eq('id', rfpItemId)
}
```

**Warning signs:** Item stays pending forever after all matches rejected.

### Pitfall 6: Accessibility Missing on Interactive Elements
**What goes wrong:** Screen readers can't understand action buttons.

**Why it happens:** No aria-labels on icon-only buttons.

**How to avoid:**
```tsx
<Button size="icon-sm" aria-label="Accept this match">
  <Check className="h-4 w-4" />
</Button>
```

**Warning signs:** Accessibility audit failures, user complaints.

## Code Examples

Verified patterns from official sources and existing codebase:

### TypeScript Types for Match Review
```typescript
// Source: Database schema from migration file
// types/rfp.ts

export interface RFPItem {
  id: string
  job_id: string
  lote_pedido: number | null
  posicao_pedido: number | null
  artigo_pedido: string | null
  descricao_pedido: string
  especificacoes_tecnicas: string | null
  quantidade_pedido: number | null
  preco_artigo: number | null
  preco_posicao: number | null
  preco_lote: number | null
  review_status: 'pending' | 'accepted' | 'rejected' | 'manual'
  selected_match_id: string | null
  created_at: string
  updated_at: string
}

export interface MatchSuggestion {
  id: string
  rfp_item_id: string
  codigo_spms: string | null
  artigo: string | null
  descricao: string | null
  unidade_venda: string | null
  quantidade_disponivel: number | null
  preco: number | null
  similarity_score: number
  match_type: string | null
  rank: number
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface RFPItemWithMatches extends RFPItem {
  rfp_match_suggestions: MatchSuggestion[]
}
```

### Complete Page Layout
```typescript
// Source: Existing page patterns + CONTEXT.md decisions
// app/(dashboard)/rfps/[id]/matches/page.tsx

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { RFPItemCard } from '@/app/(dashboard)/rfps/components/rfp-item-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MatchReviewPage({ params }: PageProps) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch job
  const { data: job } = await supabase
    .from('rfp_upload_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (!job) notFound()

  // Fetch items with matches
  const { data: items } = await supabase
    .from('rfp_items')
    .select(`
      *,
      rfp_match_suggestions (*)
    `)
    .eq('job_id', jobId)
    .order('lote_pedido', { ascending: true })
    .order('posicao_pedido', { ascending: true })

  // Sort matches by similarity_score
  const itemsWithSortedMatches = (items ?? []).map(item => ({
    ...item,
    rfp_match_suggestions: (item.rfp_match_suggestions || [])
      .sort((a: MatchSuggestion, b: MatchSuggestion) =>
        b.similarity_score - a.similarity_score
      )
  }))

  // Calculate progress
  const totalItems = itemsWithSortedMatches.length
  const reviewedItems = itemsWithSortedMatches.filter(
    i => i.review_status !== 'pending'
  ).length

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/rfps">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Review Matches</h1>
            <p className="text-muted-foreground">
              {job.file_name} - {reviewedItems} of {totalItems} items reviewed
            </p>
          </div>
        </div>

        {/* Phase 8 will add Continue button here */}
      </div>

      {/* Items list */}
      <div className="space-y-4">
        {itemsWithSortedMatches.map(item => (
          <RFPItemCard
            key={item.id}
            jobId={jobId}
            item={item}
          />
        ))}

        {itemsWithSortedMatches.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No items found for this RFP.
          </div>
        )}
      </div>
    </div>
  )
}
```

### CSS for Subtle Animation on State Change
```css
/* Source: CONTEXT.md decision: subtle animation/pulse on state change */
/* Add to globals.css or component styles */

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.animate-pulse-subtle {
  animation: pulse-subtle 0.3s ease-in-out;
}
```

```typescript
// Usage in MatchSuggestionRow after state change
const [justChanged, setJustChanged] = useState(false)

const handleAccept = () => {
  startTransition(async () => {
    await acceptMatch(jobId, rfpItemId, match.id)
    setJustChanged(true)
    setTimeout(() => setJustChanged(false), 300)
  })
}

// In JSX
<div className={cn(
  'transition-all',
  justChanged && 'animate-pulse-subtle'
)}>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side state management | Server Actions + revalidatePath | Next.js 14+ | Simpler, no state sync issues |
| useEffect for data fetching | React Server Components | Next.js 13+ | No client loading states, instant data |
| Separate API routes | Server Actions | Next.js 14+ | Collocated mutation logic |
| Context for shared state | Server-rendered props | RSC pattern | Less client JS, better performance |

**Deprecated/outdated:**
- **getServerSideProps**: Use async Server Components instead
- **API routes for simple mutations**: Use Server Actions
- **SWR/React Query for server data**: RSC handles this; save React Query for client-only scenarios

## Open Questions

Things that couldn't be fully resolved:

1. **What happens if user re-accepts a different match?**
   - What we know: CONTEXT.md says "Accepting a different match auto-rejects the previously accepted one"
   - What's unclear: Should there be a confirmation dialog?
   - Recommendation: Implement direct switch without confirmation; add if user feedback indicates need

2. **Should the page auto-scroll to first pending item?**
   - What we know: Pending items stay prominent, reviewed items fade
   - What's unclear: With many items, user may need to scroll to find pending ones
   - Recommendation: Implement simple scroll-to-first-pending on mount

3. **Error handling for failed Server Actions**
   - What we know: Actions return `{ success, error }`
   - What's unclear: How to display errors (toast vs inline)
   - Recommendation: Use toast for errors, consistent with Phase 6 patterns

4. **Mobile touch targets**
   - What we know: Accept/Reject buttons are small (icon-sm)
   - What's unclear: Are touch targets sufficient on mobile?
   - Recommendation: Test on mobile; may need to increase button size on small screens

## Sources

### Primary (HIGH confidence)
- Existing codebase: `use-rfp-upload-status.ts`, `inventory-table.tsx`, `rfp-jobs-list.tsx`
- Migration files: `20260122_rfp_match_results.sql` - exact schema
- Phase context: `07-CONTEXT.md` - all UI decisions locked

### Secondary (MEDIUM confidence)
- Next.js 15 documentation on Server Actions and `revalidatePath`
- Supabase documentation on nested selects with foreign key relations
- React 19 documentation on `useTransition`

### Tertiary (LOW confidence)
- None - all patterns verified with primary sources

## Metadata

**Confidence breakdown:**
- Database schema: HIGH - Verified from migration file, already created
- UI components: HIGH - All primitives exist in codebase
- Server Actions pattern: HIGH - Follows Next.js 15 documentation
- Supabase queries: HIGH - Syntax verified against existing codebase
- Animation/transitions: MEDIUM - CSS approach clear, exact timing TBD

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable patterns)

## Existing Code to Leverage

### Already Implemented
1. **Database schema** - `rfp_items` and `rfp_match_suggestions` tables with RLS
2. **Supabase clients** - Server and client versions configured
3. **UI components** - Card, Button, Badge, Progress, Skeleton
4. **Status patterns** - From `rfp-jobs-list.tsx` (icons, badges, status config)
5. **Navigation** - Toast action already links to `/rfps/${jobId}/matches`

### To Create
1. **Route** - `/rfps/[id]/matches/page.tsx`
2. **Server Actions** - `acceptMatch`, `rejectMatch`
3. **Components** - `RFPItemCard`, `MatchSuggestionRow`, `ConfidenceBar`
4. **Types** - `RFPItem`, `MatchSuggestion`, `RFPItemWithMatches`

### No Changes Needed
1. **Database** - Schema supports all requirements
2. **RLS policies** - Already allow user SELECT/UPDATE
3. **Realtime** - Enabled but not needed for user-initiated changes
4. **Global styles** - Existing design tokens sufficient

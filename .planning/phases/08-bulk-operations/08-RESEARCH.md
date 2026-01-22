# Phase 8: Bulk Operations (Modified Scope) - Research

**Researched:** 2026-01-22
**Domain:** Manual match correction, inventory search, confirmation step, export gating
**Confidence:** HIGH

## Summary

Phase 8 has a modified scope that removes bulk accept/reject and multi-select functionality, focusing instead on:
1. **Manual match correction** - User can search inventory to select a different match when AI suggestions are wrong
2. **Confirmation step** - Review all selections before proceeding to export

The research reveals that the existing codebase has all necessary infrastructure:
- **Phase 7** already has accept/reject working with Server Actions and `revalidatePath`
- **Inventory search** pattern exists in `inventory/page.tsx` with searchable columns and debounced input
- **Dialog component** exists for modal interactions
- **Database schema** supports `review_status: 'manual'` for manually corrected matches
- **Types** in `src/types/rfp.ts` already define all needed structures

The primary work for Phase 8 is:
1. Add a "Search Inventory" action to items with no acceptable AI suggestions
2. Create a modal dialog for searching and selecting an inventory item
3. Add a new Server Action for setting a manual match
4. Add a confirmation summary view before export is enabled
5. Gate the Export button until all items have decisions

**Primary recommendation:** Extend the existing `MatchReviewTable` UI with a "Corrigir manualmente" button that opens a Dialog containing inventory search. Create a `setManualMatch` Server Action that creates a new `rfp_match_suggestions` entry from an inventory item. Add a confirmation summary panel that shows review status counts and blocks export until all items are decided.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @radix-ui/react-dialog | ^1.1.15 | Modal for manual match search | Already used for other dialogs |
| use-debounce | ^10.1.0 | Debounced search input | Already used in inventory toolbar |
| @supabase/ssr | ^0.8.0 | Server-side Supabase client | Existing pattern |
| lucide-react | ^0.562.0 | Icons (Search, Check, Edit) | Consistent icon system |

### Already Available UI Components
| Component | Location | Purpose |
|-----------|----------|---------|
| Dialog | @/components/ui/dialog | Modal container for search |
| Input | @/components/ui/input | Search input field |
| Button | @/components/ui/button | Actions and triggers |
| Badge | @/components/ui/badge | Status indicators |
| Table | @/components/ui/table | Inventory search results |
| Skeleton | @/components/ui/skeleton | Loading states |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Dialog modal | Inline expansion | Dialog keeps context cleaner, user focused |
| Supabase direct search | Dedicated API route | Server Actions simpler, consistent with Phase 7 |
| Command (cmdk) | Dialog + Input + Table | Command not installed; Dialog + search is sufficient |

**No new dependencies required.**

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (dashboard)/
│   └── rfps/
│       ├── [id]/
│       │   └── matches/
│       │       ├── page.tsx                # Existing - add confirmation gating
│       │       └── actions.ts              # Extend with setManualMatch, searchInventory
│       └── components/
│           ├── match-review-table.tsx      # Extend with "Corrigir" action
│           ├── manual-match-dialog.tsx     # NEW: Search and select inventory item
│           └── confirmation-summary.tsx    # NEW: Review summary before export
```

### Pattern 1: Manual Match Dialog with Inventory Search
**What:** A modal dialog that searches the `artigos` table and lets user select an item
**When to use:** User clicks "Corrigir manualmente" on an item with no suitable AI suggestions

**Example:**
```typescript
// Source: Existing inventory search pattern + Dialog component
// components/manual-match-dialog.tsx
'use client'

import { useState, useTransition } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Check } from 'lucide-react'
import { searchInventory, setManualMatch } from '../[id]/matches/actions'

interface ManualMatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  rfpItemId: string
  rfpItemDescription: string
}

export function ManualMatchDialog({
  open,
  onOpenChange,
  jobId,
  rfpItemId,
  rfpItemDescription,
}: ManualMatchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<InventoryItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isPending, startTransition] = useTransition()

  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }
    setIsSearching(true)
    const items = await searchInventory(searchQuery)
    setResults(items)
    setIsSearching(false)
  }, 300)

  const handleSelect = (item: InventoryItem) => {
    startTransition(async () => {
      await setManualMatch(jobId, rfpItemId, item)
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Selecionar correspondência manualmente</DialogTitle>
          <DialogDescription className="line-clamp-2">
            Item do concurso: {rfpItemDescription}
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por código, nome ou descrição..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              debouncedSearch(e.target.value)
            }}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto border rounded-md">
          {isSearching ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y">
              {results.map((item) => (
                <InventoryResultItem
                  key={item.id}
                  item={item}
                  onSelect={() => handleSelect(item)}
                  isPending={isPending}
                />
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum resultado encontrado
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Digite pelo menos 2 caracteres para pesquisar
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Pattern 2: Server Action for Inventory Search
**What:** Server Action that queries `artigos` table with text search
**When to use:** User types in the manual match dialog search

**Example:**
```typescript
// Source: Existing inventory/page.tsx search pattern
// app/(dashboard)/rfps/[id]/matches/actions.ts (extend existing file)
'use server'

import { createClient } from '@/lib/supabase/server'

export interface InventorySearchResult {
  id: string
  codigo_spms: string | null
  artigo: string | null
  descricao: string | null
  unidade_venda: string | null
  preco: number | null
}

export async function searchInventory(
  query: string
): Promise<InventorySearchResult[]> {
  if (!query || query.length < 2) return []

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Search artigos table across multiple columns
  // Using ilike for case-insensitive matching
  const { data, error } = await supabase
    .from('artigos')
    .select('id, codigo_spms, artigo, descricao, unidade_venda, preco')
    .or(`codigo_spms.ilike.%${query}%,artigo.ilike.%${query}%,descricao.ilike.%${query}%`)
    .limit(50)

  if (error) {
    console.error('Inventory search error:', error)
    return []
  }

  return data ?? []
}
```

### Pattern 3: Server Action for Setting Manual Match
**What:** Creates a new match suggestion from manually selected inventory item
**When to use:** User selects an inventory item in the manual match dialog

**Example:**
```typescript
// Source: Existing acceptMatch pattern
// app/(dashboard)/rfps/[id]/matches/actions.ts (extend existing file)
'use server'

export async function setManualMatch(
  jobId: string,
  rfpItemId: string,
  inventoryItem: InventorySearchResult
): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Step 1: Create a new match suggestion from inventory item
    const { data: newMatch, error: insertError } = await supabase
      .from('rfp_match_suggestions')
      .insert({
        rfp_item_id: rfpItemId,
        codigo_spms: inventoryItem.codigo_spms,
        artigo: inventoryItem.artigo,
        descricao: inventoryItem.descricao,
        unidade_venda: inventoryItem.unidade_venda,
        preco: inventoryItem.preco,
        similarity_score: 1.0, // Manual = 100% user confidence
        match_type: 'Manual',
        rank: 0, // Top rank for manual selection
        status: 'accepted',
      })
      .select('id')
      .single()

    if (insertError || !newMatch) {
      return { success: false, error: insertError?.message ?? 'Failed to create match' }
    }

    // Step 2: Reject all existing matches for this item
    await supabase
      .from('rfp_match_suggestions')
      .update({ status: 'rejected' })
      .eq('rfp_item_id', rfpItemId)
      .neq('id', newMatch.id)

    // Step 3: Update RFP item status to 'manual'
    const { error: itemError } = await supabase
      .from('rfp_items')
      .update({
        review_status: 'manual',
        selected_match_id: newMatch.id,
      })
      .eq('id', rfpItemId)

    if (itemError) {
      return { success: false, error: itemError.message }
    }

    revalidatePath(`/rfps/${jobId}/matches`)
    return { success: true }
  } catch (error) {
    console.error('setManualMatch error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
```

### Pattern 4: Confirmation Summary Component
**What:** A summary panel showing review progress and gating export
**When to use:** Always visible on match review page, enables Export when all items decided

**Example:**
```typescript
// Source: New component following existing patterns
// components/confirmation-summary.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, AlertCircle, Edit, Download } from 'lucide-react'
import type { RFPItemWithMatches } from '@/types/rfp'

interface ConfirmationSummaryProps {
  items: RFPItemWithMatches[]
  onProceedToExport: () => void
}

export function ConfirmationSummary({
  items,
  onProceedToExport,
}: ConfirmationSummaryProps) {
  const stats = {
    total: items.length,
    accepted: items.filter(i => i.review_status === 'accepted').length,
    rejected: items.filter(i => i.review_status === 'rejected').length,
    manual: items.filter(i => i.review_status === 'manual').length,
    pending: items.filter(i => i.review_status === 'pending').length,
  }

  const allDecided = stats.pending === 0
  const hasMatches = stats.accepted + stats.manual > 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Resumo da Revisao</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status counts */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Selecionados: {stats.accepted}</span>
          </div>
          <div className="flex items-center gap-2">
            <Edit className="h-4 w-4 text-blue-600" />
            <span>Manuais: {stats.manual}</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-gray-500" />
            <span>Sem match: {stats.rejected}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>Pendentes: {stats.pending}</span>
          </div>
        </div>

        {/* Warning if pending items */}
        {stats.pending > 0 && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
            Reveja os {stats.pending} itens pendentes antes de continuar.
          </div>
        )}

        {/* Export button - disabled until all decided */}
        <Button
          onClick={onProceedToExport}
          disabled={!allDecided || !hasMatches}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {allDecided ? 'Confirmar e Exportar' : `${stats.pending} itens por rever`}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Anti-Patterns to Avoid

- **Anti-pattern: Duplicating inventory search logic**: Reuse existing search patterns from `inventory/page.tsx`. The column config and search are already well-established.

- **Anti-pattern: Complex Command/combobox component**: A simple Dialog + Input + scrollable list is sufficient. No need for cmdk library overhead.

- **Anti-pattern: Client-side confirmation state**: Let the server determine "all decided" status from database. The `review_status !== 'pending'` check should be derived from fetched data, not local state.

- **Anti-pattern: Creating duplicate match records**: When setting manual match, insert a new `rfp_match_suggestions` row rather than trying to link directly to `artigos`. This maintains data consistency and audit trail.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debounced search | Custom setTimeout | useDebouncedCallback from use-debounce | Already installed, battle-tested |
| Modal dialog | Custom overlay | Dialog from @radix-ui/react-dialog | Already configured in UI components |
| Search results list | Virtualized list | Simple scrollable div with limit(50) | 50 items is small enough, no virtualization needed |
| Loading states | Custom spinner | Loader2 from lucide-react + animate-spin | Consistent with existing patterns |
| Export gating | Custom modal confirmation | Disabled button + inline message | Simpler UX, no extra step |

**Key insight:** The "confirmation step" requirement is best satisfied by a summary panel with a disabled Export button until all items have decisions. No separate confirmation dialog is needed - the state of the button IS the confirmation gate.

## Common Pitfalls

### Pitfall 1: RLS Blocking Inventory Reads
**What goes wrong:** searchInventory returns empty because `artigos` table has restrictive RLS.

**Why it happens:** The `artigos` table may have SELECT restricted to certain roles.

**How to avoid:**
```typescript
// Check existing RLS policy on artigos table
// If needed, ensure authenticated users can SELECT from artigos
// The inventory page already works, so RLS should be fine
```

**Warning signs:** Search always returns empty even with valid queries.

### Pitfall 2: Manual Match Not Displaying Correctly
**What goes wrong:** After selecting manual match, UI shows old data.

**Why it happens:** Cache not properly invalidated, or nested select not including new match.

**How to avoid:**
```typescript
// Always call revalidatePath after setManualMatch
revalidatePath(`/rfps/${jobId}/matches`)

// Ensure the nested select includes all match fields
.select(`*, rfp_match_suggestions!rfp_match_suggestions_rfp_item_id_fkey (*)`)
```

**Warning signs:** Need to refresh page to see manual match.

### Pitfall 3: Export Button Enabled Prematurely
**What goes wrong:** User can click Export before all items have decisions.

**Why it happens:** Client-side count doesn't match server-side reality.

**How to avoid:**
```typescript
// Calculate pending count from server-rendered data, not local state
const stats = {
  pending: items.filter(i => i.review_status === 'pending').length,
}
const allDecided = stats.pending === 0
```

**Warning signs:** Button enabled but some items still show as pending.

### Pitfall 4: Inventory Search Too Slow
**What goes wrong:** Search takes >1 second, users see lag.

**Why it happens:** No index on searched columns, or searching too many columns.

**How to avoid:**
```typescript
// Limit results and search essential columns only
const { data } = await supabase
  .from('artigos')
  .select('id, codigo_spms, artigo, descricao, unidade_venda, preco')
  .or(`codigo_spms.ilike.%${query}%,artigo.ilike.%${query}%,descricao.ilike.%${query}%`)
  .limit(50) // Important: limit results

// Ensure database has indexes on searched columns
```

**Warning signs:** Search feels laggy, especially with short queries.

### Pitfall 5: Manual Matches Not Tracked as "Manual"
**What goes wrong:** Manual matches look same as AI-accepted matches in exports.

**Why it happens:** Not setting `match_type: 'Manual'` or `review_status: 'manual'`.

**How to avoid:**
```typescript
// Set explicit markers when creating manual match
.insert({
  ...
  match_type: 'Manual',      // Distinguishes from AI matches
  similarity_score: 1.0,     // 100% user confidence
  rank: 0,                   // Top priority
})

// Update item with manual status
.update({
  review_status: 'manual',   // Different from 'accepted'
  selected_match_id: newMatch.id,
})
```

**Warning signs:** Can't tell manual vs AI matches in reports/exports.

## Code Examples

Verified patterns from existing codebase:

### Extending MatchReviewTable with Manual Correction Button
```typescript
// Source: Existing match-review-table.tsx pattern
// Add "Corrigir" button to ItemRow when user wants to search inventory

function ItemRow({ jobId, item, isLast }: ItemRowProps) {
  const [showManualDialog, setShowManualDialog] = useState(false)

  // ... existing code ...

  return (
    <>
      <TableRow>
        {/* ... existing cells ... */}
        <TableCell>
          {/* Add manual correction option */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowManualDialog(true)}
            className="text-blue-600"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Corrigir
          </Button>
        </TableCell>
      </TableRow>

      <ManualMatchDialog
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
        jobId={jobId}
        rfpItemId={item.id}
        rfpItemDescription={item.descricao_pedido}
      />
    </>
  )
}
```

### InventorySearchResult Item Component
```typescript
// Source: Existing SuggestionItem pattern in match-review-table.tsx
'use client'

interface InventoryResultItemProps {
  item: InventorySearchResult
  onSelect: () => void
  isPending: boolean
}

function InventoryResultItem({
  item,
  onSelect,
  isPending,
}: InventoryResultItemProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">
            {item.codigo_spms ?? item.artigo ?? '-'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {item.descricao ?? '-'}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
```

### Updated Page Layout with Confirmation Summary
```typescript
// Source: Existing matches/page.tsx
// Add confirmation summary panel

export default async function MatchReviewPage({ params }: PageProps) {
  // ... existing data fetching ...

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* ... existing header ... */}
      </div>

      {/* Main content with summary sidebar */}
      <div className="flex gap-6">
        {/* Items table - takes most space */}
        <div className="flex-1">
          <MatchReviewTable jobId={jobId} items={itemsWithSortedMatches} />
        </div>

        {/* Confirmation summary - fixed sidebar */}
        <div className="w-72 shrink-0">
          <ConfirmationSummary
            items={itemsWithSortedMatches}
            onProceedToExport={() => {/* Navigate to Phase 9 */}}
          />
        </div>
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Bulk select with checkboxes | Individual item actions | User request | Simpler UI, clearer decisions |
| Separate confirmation page | Inline summary panel | Current scope | Fewer steps, better context |
| Full-text search API | Supabase ilike queries | Existing | Good enough for ~50 results |

**Deprecated/outdated (from original spec):**
- **Bulk accept/reject** - Removed from scope
- **Multi-select checkboxes** - Removed from scope
- **Separate confirmation step page** - Inline summary is sufficient

## Open Questions

Things that couldn't be fully resolved:

1. **Which columns to search in artigos table?**
   - What we know: Inventory page searches configurable columns
   - What's unclear: Exact column names (codigo_spms, artigo, descricao are likely)
   - Recommendation: Query `inventory_column_config` for searchable columns, or hardcode the 3 main columns

2. **Should manual matches be editable again?**
   - What we know: User can set a manual match
   - What's unclear: Can they change it later, or is it locked?
   - Recommendation: Allow re-searching and re-selecting (no lock), consistent with AI match behavior

3. **Export destination (Phase 9)?**
   - What we know: Confirmation gates export
   - What's unclear: What format/destination for export
   - Recommendation: Phase 9 will define - for now, just gate the button and navigate to export route

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/app/(dashboard)/rfps/[id]/matches/actions.ts` - Server Action patterns
- Existing codebase: `src/app/(dashboard)/rfps/components/match-review-table.tsx` - UI patterns
- Existing codebase: `src/app/(dashboard)/inventory/page.tsx` - Inventory search patterns
- Existing codebase: `src/components/ui/dialog.tsx` - Dialog component
- Database schema: `supabase/migrations/20260122_rfp_match_results.sql` - Tables and RLS

### Secondary (MEDIUM confidence)
- Phase 7 research and plans - Established patterns for accept/reject
- shadcn/ui documentation - Dialog component usage

### Tertiary (LOW confidence)
- None - all patterns verified with primary sources

## Metadata

**Confidence breakdown:**
- Manual match dialog: HIGH - Follows existing dialog + search patterns exactly
- Server Actions: HIGH - Direct extension of existing actions.ts
- Confirmation summary: HIGH - Simple component with derived state
- Database operations: HIGH - Uses existing schema and RLS
- Integration: HIGH - All components exist, just need wiring

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable patterns)

## Existing Code to Leverage

### Already Implemented (Phase 7)
1. **Server Actions** - `acceptMatch`, `rejectMatch`, `unselectMatch` in actions.ts
2. **UI Components** - `MatchReviewTable`, `ItemRow`, `SuggestionItem`
3. **Types** - `RFPItem`, `MatchSuggestion`, `RFPItemWithMatches`
4. **Database schema** - `rfp_items.review_status` includes 'manual' option
5. **Page structure** - `/rfps/[id]/matches/page.tsx`

### To Create (Phase 8)
1. **Server Action** - `searchInventory(query)` returning inventory items
2. **Server Action** - `setManualMatch(jobId, rfpItemId, inventoryItem)`
3. **Component** - `ManualMatchDialog` with search + selection
4. **Component** - `ConfirmationSummary` with status counts + export button
5. **UI Extension** - Add "Corrigir" button to `MatchReviewTable`

### No Changes Needed
1. **Database schema** - Already supports `review_status: 'manual'`
2. **RLS policies** - Already allow user operations
3. **Types** - Already define all needed structures
4. **Existing actions** - `acceptMatch`/`rejectMatch` remain unchanged

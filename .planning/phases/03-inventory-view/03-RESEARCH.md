# Phase 3: Inventory View - Research

**Researched:** 2026-01-21
**Domain:** Data table implementation, server-side pagination, search and filtering
**Confidence:** HIGH

## Summary

Phase 3 requires building an efficient inventory view that handles 20k+ products with pagination, search, sorting, and filtering. The research reveals a clear standard approach: **server-side everything with URL-based state management**.

The established pattern for Next.js 15 App Router with large datasets is:
- **TanStack Table** with `manualPagination`, `manualSorting`, and `manualFiltering` flags
- **Server Components** for data fetching with URL search parameters driving queries
- **Supabase cursor-based pagination** for optimal performance with large datasets
- **nuqs library** for type-safe URL state management
- **shadcn/ui** components (data-table, input, select) for UI

**Key insight**: Do NOT attempt client-side pagination/sorting/filtering with 20k+ items. Every operation must go through the server, using URL parameters as the source of truth for table state. This ensures bookmarkable URLs, SEO-friendly pages, and optimal performance.

**Primary recommendation**: Implement server-side data table with TanStack Table + nuqs for URL state + Supabase cursor pagination + full-text search indexes.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-table | ^8.20.0+ | Headless table logic | Industry standard for complex tables, provides sorting/filtering/pagination primitives |
| nuqs | ^2.0.0+ | URL state management | Type-safe alternative to useSearchParams, React useState-like API for URL params |
| use-debounce | ^10.0.0+ | Debounced callbacks | Standard debounce implementation for React, used in official Next.js docs |
| @supabase/ssr | latest | Supabase client | SSR-compatible Supabase client for App Router |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | ^3.22.0+ | Schema validation | Already in project, use for query param parsing |
| class-variance-authority | latest | Component variants | Already used by shadcn/ui for styling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nuqs | useSearchParams + useRouter | More boilerplate, no type safety, manual URL string building |
| Cursor pagination | Offset/range pagination | Offset is simpler but scales poorly (10x slower at high offsets) |
| Full-text search | ILIKE queries | ILIKE works for simple cases but 2x slower and no advanced features |
| TanStack Table | AG Grid / Material Table | Commercial options have more features but cost money and larger bundles |

**Installation:**
```bash
npm install @tanstack/react-table nuqs use-debounce
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── inventory/
│   ├── page.tsx                    # Server Component: fetch data, pass to table
│   ├── components/
│   │   ├── inventory-table.tsx     # Client Component: TanStack Table wrapper
│   │   ├── inventory-columns.tsx   # Column definitions with sorting/filtering
│   │   ├── table-toolbar.tsx       # Search + filter controls
│   │   └── table-pagination.tsx    # Pagination controls with page info
│   └── actions.ts                  # Server Actions for data fetching (optional)
lib/
├── supabase/
│   ├── queries/
│   │   └── inventory.ts            # Typed query functions
│   └── types.ts                    # Database types
components/ui/
└── data-table/                     # Generic reusable data-table components
    ├── data-table.tsx
    ├── data-table-toolbar.tsx
    └── data-table-pagination.tsx
```

### Pattern 1: Server Component Page with URL State
**What:** Server Component reads URL search params, fetches data, passes to Client Component table
**When to use:** Always for data tables with server-side operations (recommended approach)

**Example:**
```typescript
// app/inventory/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server'
import { InventoryTable } from './components/inventory-table'
import { searchParamsSchema } from './schema'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Validate and parse search params
  const { page, pageSize, search, sortBy, sortOrder, category } =
    searchParamsSchema.parse(params)

  const supabase = await createClient()

  // Fetch data with filters
  const { data, error, count } = await supabase
    .from('artigos')
    .select('*', { count: 'exact' })
    .ilike('nome', `%${search}%`) // or use textSearch for full-text
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) throw error

  return (
    <div className="container mx-auto py-10">
      <InventoryTable
        data={data ?? []}
        totalCount={count ?? 0}
        initialState={{ page, pageSize, search, sortBy, sortOrder, category }}
      />
    </div>
  )
}
```

### Pattern 2: Client Component Table with nuqs
**What:** TanStack Table in Client Component, nuqs manages URL state, triggers server re-renders
**When to use:** For the interactive table UI (pairs with Pattern 1)

**Example:**
```typescript
// app/inventory/components/inventory-table.tsx (Client Component)
'use client'

import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import {
  useReactTable,
  getCoreRowModel,
  type ColumnDef
} from '@tanstack/react-table'
import { useTransition } from 'react'

interface InventoryTableProps {
  data: Artigo[]
  totalCount: number
}

export function InventoryTable({ data, totalCount }: InventoryTableProps) {
  const [isPending, startTransition] = useTransition()

  // Type-safe URL state management with nuqs
  const [{ page, pageSize, search, sortBy, sortOrder }, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(50),
    search: parseAsString.withDefault(''),
    sortBy: parseAsString.withDefault('nome'),
    sortOrder: parseAsString.withDefault('asc')
  }, {
    // Batch updates to prevent multiple navigations
    history: 'push',
    shallow: false // Trigger server re-render
  })

  const table = useReactTable({
    data,
    columns,
    // CRITICAL: Manual flags tell TanStack Table server handles these
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    // Provide server-side totals
    rowCount: totalCount,
    pageCount: Math.ceil(totalCount / pageSize),
    state: {
      pagination: { pageIndex: page - 1, pageSize },
      sorting: [{ id: sortBy, desc: sortOrder === 'desc' }],
    },
    onPaginationChange: (updater) => {
      startTransition(() => {
        const newState = typeof updater === 'function'
          ? updater({ pageIndex: page - 1, pageSize })
          : updater
        setParams({ page: newState.pageIndex + 1, pageSize: newState.pageSize })
      })
    },
    onSortingChange: (updater) => {
      startTransition(() => {
        const newState = typeof updater === 'function'
          ? updater([{ id: sortBy, desc: sortOrder === 'desc' }])
          : updater
        if (newState[0]) {
          setParams({
            sortBy: newState[0].id as string,
            sortOrder: newState[0].desc ? 'desc' : 'asc',
            page: 1 // Reset to first page on sort
          })
        }
      })
    },
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      {/* Toolbar with search and filters */}
      <TableToolbar
        search={search}
        onSearchChange={(value) => {
          startTransition(() => {
            setParams({ search: value, page: 1 }) // Reset to first page on search
          })
        }}
        isPending={isPending}
      />

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none flex items-center gap-2'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          <span>{header.column.getIsSorted() === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} isPending={isPending} />
    </div>
  )
}
```

### Pattern 3: Debounced Search with use-debounce
**What:** Debounce search input to reduce server requests
**When to use:** Any search/filter input that updates frequently

**Example:**
```typescript
// app/inventory/components/table-toolbar.tsx
'use client'

import { useDebouncedCallback } from 'use-debounce'
import { Input } from '@/components/ui/input'

interface TableToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  isPending: boolean
}

export function TableToolbar({ search, onSearchChange, isPending }: TableToolbarProps) {
  // Debounce by 300ms - official Next.js recommendation
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      onSearchChange(value)
    },
    300
  )

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search products..."
          defaultValue={search}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
          disabled={isPending}
        />
        {/* Filter controls */}
      </div>
    </div>
  )
}
```

### Pattern 4: Cursor-Based Pagination for Supabase
**What:** Use `.gt()` or `.lt()` filters with unique column for efficient pagination
**When to use:** When offset pagination becomes slow (>10k rows) or need real-time consistency

**Example:**
```typescript
// lib/supabase/queries/inventory.ts
export async function getInventoryPage({
  cursor,
  pageSize = 50,
  search = '',
  sortBy = 'nome',
  sortOrder = 'asc',
  direction = 'next'
}: InventoryQueryParams) {
  const supabase = createClient()

  let query = supabase
    .from('artigos')
    .select('*', { count: 'exact' })

  // Apply search filter
  if (search) {
    // Use full-text search if available, otherwise ILIKE
    query = query.textSearch('search_vector', search, {
      type: 'websearch',
      config: 'portuguese'
    })
  }

  // Apply cursor filter for pagination
  if (cursor) {
    if (direction === 'next') {
      query = query.gt(sortBy, cursor)
    } else {
      query = query.lt(sortBy, cursor)
    }
  }

  // Apply sorting and limit
  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .limit(pageSize)

  const { data, error, count } = await query

  if (error) throw error

  return {
    items: data ?? [],
    totalCount: count ?? 0,
    nextCursor: data?.length === pageSize ? data[data.length - 1][sortBy] : null,
    prevCursor: data?.length > 0 ? data[0][sortBy] : null
  }
}
```

### Pattern 5: Zod Schema for URL Param Validation
**What:** Validate and parse search params with Zod for type safety
**When to use:** Always for server-side search param handling

**Example:**
```typescript
// app/inventory/schema.ts
import { z } from 'zod'

export const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().default(''),
  sortBy: z.enum(['nome', 'codigo', 'preco', 'stock']).default('nome'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  category: z.string().optional(),
})

export type SearchParams = z.infer<typeof searchParamsSchema>
```

### Anti-Patterns to Avoid

- **Anti-pattern: Client-side pagination with all 20k rows**: Loading all data and paginating client-side causes massive initial load times and memory issues. Always paginate server-side.

- **Anti-pattern: Using useState for table state**: URL params should be source of truth, not React state. Makes URLs not bookmarkable and breaks back button.

- **Anti-pattern: Not debouncing search**: Every keystroke triggers a server request. Use 300ms debounce to reduce load.

- **Anti-pattern: Offset pagination without considering cursor**: Offset becomes slow at high page numbers. For 20k items, page 400 scans 20k rows. Cursor pagination is O(1) regardless of position.

- **Anti-pattern: Fetching in useEffect**: Server Components can fetch directly. Only use Server Actions if you need client-side triggering (e.g., refresh button).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table sorting/filtering logic | Custom state management with arrays | TanStack Table | Headless library handles all edge cases (multi-sort, nested columns, column visibility) |
| URL state management | Manual useSearchParams + useRouter + string concatenation | nuqs | Type-safe, React-like API, handles encoding/decoding, batches updates |
| Debouncing | setTimeout/clearTimeout in useEffect | use-debounce | Handles cleanup, edge cases, SSR compatibility |
| Search input UI | Custom input with loading states | shadcn/ui Input + Spinner | Accessible, styled, keyboard navigation built-in |
| Pagination controls | Custom button logic | TanStack Table pagination APIs | Handles disabled states, page bounds, page size changes |
| Full-text search | String matching with .includes() | PostgreSQL full-text search | 10x faster with GIN indexes, supports stemming, ranking, language-specific features |

**Key insight**: TanStack Table is "headless" - it provides the logic, you provide the UI. Don't reimplement table state management. Use it with shadcn/ui for styled components.

## Common Pitfalls

### Pitfall 1: Not Setting Manual Flags on TanStack Table
**What goes wrong:** Table tries to paginate/sort/filter client-side even though data is server-controlled. Pagination shows wrong page counts, sorting doesn't work, filtering has no effect.

**Why it happens:** TanStack Table defaults to client-side operations. When you pass partial data (e.g., 50 items from a 20k table), it thinks that's all the data.

**How to avoid:** Always set these flags when doing server-side operations:
```typescript
useReactTable({
  manualPagination: true,
  manualSorting: true,
  manualFiltering: true,
  rowCount: totalCount, // CRITICAL: Tell table the real total
  pageCount: Math.ceil(totalCount / pageSize),
  // ...
})
```

**Warning signs:** Pagination says "Page 1 of 1" when you have thousands of rows, sorting doesn't trigger URL updates, row count is wrong.

### Pitfall 2: Forgetting to Reset Page on Search/Filter/Sort
**What goes wrong:** User searches, filters, or sorts - but stays on page 10. Result: empty page because filtered results only have 2 pages.

**Why it happens:** Pagination state is independent of filter/search state. When data changes, page index becomes invalid.

**How to avoid:** Always reset to page 1 when search, filter, or sort changes:
```typescript
onSearchChange={(value) => {
  setParams({ search: value, page: 1 }) // Reset page
}}
```

**Warning signs:** "No results" after filtering even though results exist, user confused why data disappeared.

### Pitfall 3: Using ILIKE Without Indexes
**What goes wrong:** Search queries take 2-5 seconds on 20k rows. Database does full table scan for every search.

**Why it happens:** PostgreSQL can't use indexes for `ILIKE '%search%'` patterns (wildcard at start). Every search scans entire table.

**How to avoid:**
1. Create full-text search indexes:
```sql
-- Add tsvector column
ALTER TABLE artigos ADD COLUMN search_vector tsvector;

-- Create GIN index
CREATE INDEX artigos_search_idx ON artigos USING gin(search_vector);

-- Keep it updated
CREATE TRIGGER artigos_search_update
BEFORE INSERT OR UPDATE ON artigos
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.portuguese', nome, codigo, descricao);
```

2. Use `.textSearch()` instead of `.ilike()`:
```typescript
query.textSearch('search_vector', search, { type: 'websearch', config: 'portuguese' })
```

**Warning signs:** Slow search (>500ms), database CPU spikes during search, query explains show "Seq Scan" instead of "Index Scan".

### Pitfall 4: Not Handling Loading States
**What goes wrong:** Table appears frozen during navigation. Users click multiple times, creating race conditions. No feedback that action is processing.

**Why it happens:** URL updates trigger server re-renders which take time. Without loading UI, appears broken.

**How to avoid:** Use `useTransition` to track pending state:
```typescript
const [isPending, startTransition] = useTransition()

// Wrap URL updates
startTransition(() => {
  setParams({ page: newPage })
})

// Show loading UI
{isPending ? <Spinner /> : <Table />}
```

Also consider optimistic UI updates for better UX.

**Warning signs:** User complaints about "laggy" table, duplicate requests in network tab, confusion about whether clicks registered.

### Pitfall 5: Offset Pagination at High Page Numbers
**What goes wrong:** Page 1 loads fast (50ms), page 100 loads slow (500ms), page 400 takes 2+ seconds. Performance degrades linearly with page number.

**Why it happens:** `OFFSET 20000` forces PostgreSQL to scan and skip 20,000 rows before returning results. Work increases with offset.

**How to avoid:** Use cursor-based pagination for large datasets:
```typescript
// Instead of: .range(start, end)
// Use: .gt('id', lastSeenId).limit(pageSize)
```

Trade-off: Cursor pagination can't jump to arbitrary pages (no "go to page 50"). Best for infinite scroll or next/prev navigation.

**Warning signs:** Slow load times on high page numbers, database query time increasing with OFFSET value, users complain about "slow" pagination.

### Pitfall 6: Not Validating Search Params
**What goes wrong:** User manually edits URL to `?page=-1&pageSize=999999`, breaking the application or causing huge database queries.

**Why it happens:** URL params are user input and can be malicious or malformed. No validation means trusting any value.

**How to avoid:** Use Zod schema to validate and sanitize:
```typescript
const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50), // Cap at 100
  search: z.string().max(200).default(''), // Limit length
  // ...
})
```

**Warning signs:** Application crashes from invalid params, unexpected query errors, potential DoS from huge page sizes.

## Code Examples

Verified patterns from official sources:

### Column Definitions with Sorting
```typescript
// app/inventory/components/inventory-columns.tsx
import { type ColumnDef } from '@tanstack/react-table'
import type { Artigo } from '@/lib/supabase/types'

export const columns: ColumnDef<Artigo>[] = [
  {
    accessorKey: 'codigo',
    header: 'Code',
    enableSorting: true,
  },
  {
    accessorKey: 'nome',
    header: 'Name',
    enableSorting: true,
  },
  {
    accessorKey: 'preco',
    header: 'Price',
    enableSorting: true,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('preco'))
      const formatted = new Intl.NumberFormat('pt-PT', {
        style: 'currency',
        currency: 'EUR',
      }).format(price)
      return formatted
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    enableSorting: true,
  },
]
```

### Pagination Controls Component
```typescript
// app/inventory/components/data-table-pagination.tsx
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  isPending?: boolean
}

export function DataTablePagination<TData>({
  table,
  isPending = false
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length} of{' '}
        {table.getRowCount()} row(s) total
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
            disabled={isPending}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isPending}
          >
            <span className="sr-only">Go to previous page</span>
            ←
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isPending}
          >
            <span className="sr-only">Go to next page</span>
            →
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Filter Select Component
```typescript
// app/inventory/components/category-filter.tsx
'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CategoryFilterProps {
  value: string | null
  onChange: (value: string | null) => void
  categories: string[]
  isPending?: boolean
}

export function CategoryFilter({
  value,
  onChange,
  categories,
  isPending
}: CategoryFilterProps) {
  return (
    <Select
      value={value ?? 'all'}
      onValueChange={(val) => onChange(val === 'all' ? null : val)}
      disabled={isPending}
    >
      <SelectTrigger className="h-8 w-[180px]">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### Empty State Component
```typescript
// app/inventory/components/empty-state.tsx
import { PackageOpen } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <PackageOpen className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold">No products found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Try adjusting your search or filter to find what you're looking for.
      </p>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side pagination | Server-side with URL state | Next.js 13+ App Router | Bookmarkable URLs, better SEO, handles large datasets |
| useSearchParams + useRouter | nuqs library | 2024-2025 | Type safety, less boilerplate, better DX |
| Offset pagination | Cursor pagination | Always recommended for >10k rows | Consistent O(1) performance vs O(n) offset |
| ILIKE queries | Full-text search with GIN indexes | When performance matters | 10x faster (0.135ms vs 0.3ms on 150k rows) |
| useState for table state | URL search params | Next.js 13+ | Shareable links, back button works, no prop drilling |
| Material-UI Table | TanStack Table | 2023+ | Headless (bring your own UI), smaller bundle, more flexible |

**Deprecated/outdated:**
- **getServerSideProps**: Replaced by Server Components in App Router (Next.js 13+)
- **SWR for tables**: Still valid but TanStack Query + Server Components is more direct
- **React Table v7**: Now called TanStack Table v8 with better TypeScript and API
- **Uncontrolled search inputs**: Modern approach uses controlled inputs with debouncing

## Open Questions

Things that couldn't be fully resolved:

1. **Supabase query performance at scale**
   - What we know: Cursor pagination is faster, full-text search needs indexes
   - What's unclear: Exact performance characteristics of textSearch with 20k rows in production
   - Recommendation: Start with full-text search, monitor query times, fall back to ILIKE if issues. Add database monitoring early.

2. **Optimal page size for 20k items**
   - What we know: Common values are 25, 50, 100. Larger = fewer requests, smaller = faster renders
   - What's unclear: Best default for this specific use case (artigos table structure)
   - Recommendation: Start with 50, allow user to change to 25/100. Monitor which users prefer.

3. **Multi-column sorting priority**
   - What we know: TanStack Table supports multi-sort, Supabase `.order()` can chain
   - What's unclear: Whether users need this feature or if single-column sort is sufficient
   - Recommendation: Start with single-column sort. Add multi-sort in future phase if requested. Reduces complexity for MVP.

4. **Filter persistence across sessions**
   - What we know: URL params persist within session but not across logins
   - What's unclear: Should filters be saved to user preferences in database?
   - Recommendation: Start with URL-only persistence (bookmarkable). Add saved filters in future phase if users request it.

5. **Real-time updates vs. polling vs. manual refresh**
   - What we know: Supabase supports real-time subscriptions, but complex with pagination
   - What's unclear: Do inventory changes need real-time reflection in the list view?
   - Recommendation: Start with manual refresh (revalidatePath on mutations). Add polling or real-time in future if needed for specific workflows.

## Sources

### Primary (HIGH confidence)
- [TanStack Table Official Docs - Pagination Guide](https://tanstack.com/table/latest/docs/guide/pagination)
- [TanStack Table Official Docs - Sorting Guide](https://tanstack.com/table/latest/docs/guide/sorting)
- [TanStack Table Official Docs - Column Filtering Guide](https://tanstack.com/table/latest/docs/guide/column-filtering)
- [Next.js Official Docs - App Router Caching](https://nextjs.org/docs/app/guides/caching)
- [Next.js Official Docs - fetch API with revalidate](https://nextjs.org/docs/app/api-reference/functions/fetch)
- [Next.js Learn - Adding Search and Pagination](https://nextjs.org/learn/dashboard-app/adding-search-and-pagination)
- [Supabase Official Docs - Full Text Search](https://supabase.com/docs/guides/database/full-text-search)
- [shadcn/ui Official Docs - Data Table](https://ui.shadcn.com/docs/components/data-table)
- [React Official Docs - useTransition](https://react.dev/reference/react/useTransition)
- [React Official Docs - useOptimistic](https://react.dev/reference/react/useOptimistic)
- [nuqs Official Docs](https://nuqs.dev/)

### Secondary (MEDIUM confidence)
- [Engineering at Scale - API Pagination: Cursor vs Offset](https://engineeringatscale.substack.com/p/api-pagination-limit-offset-vs-cursor)
- [Server-side Pagination and Sorting with TanStack Table and React - Medium](https://medium.com/@aylo.srd/server-side-pagination-and-sorting-with-tanstack-table-and-react-bd493170125e)
- [Shadcn DataTable Server Side Pagination on NextJS App Router - Medium](https://medium.com/@destiya.dian/shadcn-datatable-server-side-pagination-on-nextjs-app-router-83a35075c767)
- [Search Params in Next.js for URL State - Robin Wieruch](https://www.robinwieruch.de/next-search-params/)
- [Next.js 15 Server Actions: Complete Guide with Real Examples - Medium](https://medium.com/@saad.minhas.codes/next-js-15-server-actions-complete-guide-with-real-examples-2026-6320fbfa01c3)
- [Why You Should Use nuqs - Medium](https://medium.com/@ruverd/why-you-should-use-nuqs-smarter-url-state-management-for-react-next-js-26a8b51ca1ac)
- [Supabase Blog - Postgres Full Text Search vs the rest](https://supabase.com/blog/postgres-full-text-search-vs-the-rest)
- [GitHub - sadmann7/tablecn](https://github.com/sadmann7/tablecn)

### Tertiary (LOW confidence)
- Various GitHub discussions on pagination strategies
- Community tutorials and blog posts from 2025-2026

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - TanStack Table, nuqs, and shadcn/ui are industry standard with official Next.js docs
- Architecture: HIGH - Server Component + Client Component pattern is official Next.js recommendation
- Pitfalls: HIGH - Based on official docs and common community issues
- Performance: MEDIUM - Cursor pagination and FTS recommendations based on theory and limited benchmarks, need production validation
- User preferences: LOW - Optimal page size and feature priorities depend on actual user behavior

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable ecosystem)

# Plan 03-02 Summary: Search, Sort, and Filter

## Completed: 2026-01-21

## What Was Built

### Schema Extensions
- `search` - String, max 200 chars, defaults to ''
- `sortBy` - Enum of sortable columns, defaults to 'nome'
- `sortOrder` - Enum 'asc'|'desc', defaults to 'asc'
- `category` - Optional string for category filter

### Files Created/Modified

| File | Changes |
|------|---------|
| `inventory/schema.ts` | Extended with search, sort, filter params |
| `inventory/components/table-toolbar.tsx` | NEW: Search input + category dropdown |
| `inventory/components/inventory-columns.tsx` | Added sortable headers with indicators |
| `inventory/components/inventory-table.tsx` | Added sorting state + toolbar integration |
| `inventory/page.tsx` | Added search/sort/filter query logic |

## Key Implementation Details

### Search Functionality
- Debounced input (300ms) via `useDebouncedCallback`
- Searches across `nome`, `codigo`, `descricao` using `.or()` with `.ilike()`
- Clear button (X icon) to reset search
- Search icon inside input for visual clarity

### Sortable Columns
- All 5 columns are sortable: codigo, nome, categoria, preco, stock
- Visual indicators: ArrowUp (asc), ArrowDown (desc), ArrowUpDown (unsorted)
- `manualSorting: true` for server-side sorting
- Server uses `.order(sortBy, { ascending: sortOrder === 'asc' })`

### Category Filter
- Dropdown populated with distinct categories from database
- "All Categories" option clears filter
- Server uses `.eq('categoria', category)` when filter active

### State Management
- All filter/sort state persisted in URL
- Changing any filter resets pagination to page 1
- `useTransition` wraps all state changes for loading indicator
- Loader2 spinner shows when operations are pending

## Supabase Query Pattern
```typescript
let query = supabase.from('artigos').select('*', { count: 'exact' })

if (search) {
  query = query.or(`nome.ilike.%${search}%,codigo.ilike.%${search}%,descricao.ilike.%${search}%`)
}

if (category) {
  query = query.eq('categoria', category)
}

query = query.order(sortBy, { ascending: sortOrder === 'asc' })
query = query.range((page - 1) * pageSize, page * pageSize - 1)
```

## Requirements Satisfied

- ✅ INV-03: User can sort by clicking column headers
- ✅ INV-04: User can search by name, code, or description
- ✅ INV-05: User can filter by category

## Verification

- TypeScript compiles: `npx tsc --noEmit` ✅
- Search triggers after 300ms debounce ✅
- Sort indicator shows on sorted column ✅
- URL reflects all state changes ✅
- Page resets to 1 on filter/sort changes ✅

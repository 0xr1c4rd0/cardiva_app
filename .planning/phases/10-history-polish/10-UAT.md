---
status: testing
phase: 10-history-polish
source: [10-01-PLAN.md, 10-02-PLAN.md]
started: 2026-01-23T09:30:00Z
updated: 2026-01-23T10:15:00Z
fixes_applied:
  - "Removed revalidatePath from autoAcceptExactMatches (called during render)"
  - "Added router.refresh() to manual-match-dialog for proper data refresh"
---

## Current Test

number: 1
name: Jobs List with Pagination
expected: |
  Navigate to /rfps. The jobs list displays with pagination controls at the bottom showing "A mostrar X-Y de Z concursos", page size selector (10, 25, 50), and Previous/Next buttons.
awaiting: user response

## Tests

### 1. Jobs List with Pagination
expected: Navigate to /rfps. The jobs list displays with pagination controls at the bottom showing "A mostrar X-Y de Z concursos", page size selector (10, 25, 50), and Previous/Next buttons.
result: [pending]

### 2. Search by Filename
expected: Type a filename (or part of it) in the search box. After ~300ms, the list filters to show only jobs matching the search term. URL updates with ?search=term.
result: [pending]

### 3. Clear Search
expected: With a search term active, click the X button in the search box. The list returns to showing all jobs, and the URL search param is cleared.
result: [pending]

### 4. Sort by Name (A-Z)
expected: Click the sort dropdown and select "Nome (A-Z)". Jobs reorder alphabetically by filename. URL updates with ?sortBy=file_name&sortOrder=asc.
result: [pending]

### 5. Sort by Date (Oldest First)
expected: Select "Data (Antigo)" from the sort dropdown. Jobs reorder with oldest first. URL updates accordingly.
result: [pending]

### 6. Page Navigation
expected: If you have more jobs than the page size, click the Next page button. Page 2 loads with different jobs. URL updates with ?page=2.
result: [pending]

### 7. Change Page Size
expected: Change page size from 25 to 10 using the selector. Fewer items display per page, pagination adjusts accordingly.
result: [pending]

### 8. State Preserved on Refresh
expected: With search/sort/page parameters active, refresh the browser. The same state (search term, sort order, page) is preserved from URL.
result: [pending]

### 9. Loading State
expected: Hard refresh the /rfps page. A skeleton loading state (gray placeholder rows with pulse animation) briefly appears while data loads.
result: [pending]

### 10. Search Empty State
expected: Search for a term that doesn't match any jobs (e.g., "xyznonexistent"). Shows "Nenhum concurso encontrado" with the search term and a "Limpar pesquisa" button.
result: [pending]

### 11. Clear Search from Empty State
expected: From the search empty state, click "Limpar pesquisa". Returns to the full jobs list.
result: [pending]

### 12. Empty State (No Jobs)
expected: If you have no RFP jobs at all, the page shows an empty state with an icon, "Ainda não há concursos" message, and "Carregar primeiro concurso" button.
result: [pending]

### 13. Empty State CTA Opens Upload Dialog
expected: From the empty state, click "Carregar primeiro concurso". The RFP upload dialog opens.
result: [pending]

### 14. PDF Upload with Special Characters
expected: Upload a PDF with special characters in the filename (e.g., Portuguese accents, spaces). Upload succeeds without "Invalid key" error.
result: [pending]

## Summary

total: 14
passed: 0
issues: 0
pending: 14
skipped: 0

## Gaps

[none yet]

---
created: 2026-01-23T10:36
title: Align inventory table design with matches table
area: ui
priority: medium
files:
  - src/app/(dashboard)/inventory/components/inventory-table.tsx
  - src/app/(dashboard)/rfps/components/match-review-table.tsx
  - src/components/ui/table.tsx
---

## Problem

The inventory table and match review table have different visual designs. After fixing the match review table sorting, the inventory table should be updated to match the same visual style.

## Current Match Review Table Design

```
- rounded-lg border border-slate-200 shadow-xs overflow-hidden bg-white p-2
- Header: bg-slate-100/70 rounded corners on first/last
- Text: text-xs font-medium text-slate-700 tracking-wide
- Rows: hover:bg-slate-50 border-0
- Cells: py-2 px-3
```

## Current Inventory Table Design

```
- rounded-lg border border-slate-200 shadow-xs overflow-hidden bg-white p-2
- Header: bg-slate-100/70 rounded corners
- Similar but may have subtle differences
```

## Solution

1. Extract common table styling to shared constants or components
2. Ensure both tables use identical:
   - Border radius and shadow
   - Header background and text styling
   - Row hover states
   - Cell padding and typography
   - Sort icon styling (ArrowUp, ArrowDown, ArrowUpDown)

3. Consider creating a `SortableHeader` component to share between both tables

## Visual Checklist

- [ ] Container: same border, shadow, background
- [ ] Header row: same background, rounded corners
- [ ] Header text: same font size, weight, color, tracking
- [ ] Sort icons: same size, color, behavior
- [ ] Data rows: same hover state, border style
- [ ] Cell padding: consistent spacing
- [ ] Empty state: consistent styling

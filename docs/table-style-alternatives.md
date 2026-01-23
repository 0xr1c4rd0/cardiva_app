# Match Review Table Style Alternatives

Reference document for alternative table styling directions.

## Currently Implemented: Direction B (Linear/Notion-inspired)

```tsx
// Container - crisp border
<div className="rounded-lg border border-slate-200 shadow-xs overflow-hidden">

// Header row - bottom accent line
<TableRow className="hover:bg-transparent bg-white border-b-2 border-slate-200">
  <TableHead className="text-xs font-semibold text-slate-700 uppercase tracking-wide">...</TableHead>

// Body rows - left accent on hover
<TableRow className={cn(
  'transition-all duration-100',
  'hover:bg-emerald-50/30 hover:border-l-2 hover:border-l-emerald-400',
  'border-l-2 border-l-transparent',
  !isLast && 'border-b border-slate-100'
)}>

// Cardiva columns - subtle tinted background
<TableCell className="bg-emerald-50/20">...</TableCell>

// Separator - double line with gap
<div className="flex items-center gap-0.5 h-full">
  <div className="w-px h-6 bg-slate-200"></div>
  <div className="w-px h-6 bg-slate-200"></div>
</div>

// Empty cells - italic dash
<span className="text-slate-300 italic text-sm">—</span>
```

### Direction B Characteristics:
- Crisp, defined borders throughout
- Header has heavier bottom border (accent line)
- Rows get left border accent on hover (emerald color)
- Cardiva columns have very subtle green tint background
- Uppercase headers with tracking for professional feel
- Double-line separator between RFP and Cardiva columns

---

## Direction A: Clean & Minimal (Apple-inspired)

Ultra-clean design with no borders, relying on shadows and subtle backgrounds.

```tsx
// Container - no border, shadow only
<div className="rounded-xl shadow-md overflow-hidden bg-white">

// Header row - subtle gradient
<TableRow className="hover:bg-transparent bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
  <TableHead className="text-sm font-medium text-slate-600">...</TableHead>

// Body rows - no borders, zebra striping only
<TableRow className={cn(
  'transition-all duration-150',
  'hover:bg-slate-50 hover:shadow-sm',
  isEven && 'bg-slate-50/30'
  // NO border-b
)}>

// Separator - subtle gradient fade
<div className="h-full w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent">

// Empty cells - lighter, more elegant
<span className="text-slate-200 text-sm">·</span>
```

### Direction A Characteristics:
- No outer border, relies entirely on shadow for elevation
- No row borders, uses zebra striping for separation
- Hover state adds subtle shadow to row
- Very minimal, focuses on whitespace
- Elegant dot (·) for empty cells instead of dash

---

## Quick Win Combo

Balanced approach with borders, shadow, and zebra striping.

```tsx
// Container
<div className="rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">

// Header row
<TableRow className="hover:bg-transparent bg-slate-50/80 border-b border-slate-200/80">
  <TableHead className="text-xs font-medium text-slate-500">...</TableHead>

// Body rows
<TableRow className={cn(
  'transition-colors',
  'hover:bg-slate-100/60',
  isEven && 'bg-slate-50/40',
  !isLast && 'border-b border-slate-100'
)}>

// Separator
<div className="h-10 w-[3px] bg-gradient-to-b from-slate-200/60 via-slate-300/40 to-slate-200/60 rounded-full">

// Empty cells
<span className="text-slate-300">–</span>
```

### Quick Win Characteristics:
- Rounded container with subtle border and shadow
- Zebra striping for row differentiation
- Gradient separator between columns
- Simple hover states
- Sentence-case headers

---

## Hybrid Options

### Option 1: Direction A + Direction B separator
Use minimal styling from A but with the double-line separator from B.

### Option 2: Direction A container + Quick Win headers
Shadow-only container with the sentence-case headers.

### Option 3: Direction B hover + Quick Win base
Keep current styling but add the left-border accent on hover from B.

---

## Implementation Notes

To switch directions, update these locations in `match-review-table.tsx`:

1. **Container** (line ~132): `<div className="...">`
2. **Header row** (line ~135): `<TableRow className="...">`
3. **Header cells** (lines ~137-148): `<TableHead className="...">`
4. **Body row** (line ~225-231): `<TableRow className={cn(...)}`
5. **Separator** (line ~248-250): `<TableCell>` with inner div
6. **Empty cell spans**: Multiple locations, search for `text-slate-300`

For Direction B's tinted Cardiva columns, you'd also need to add `className` to each Cardiva `<TableCell>`.

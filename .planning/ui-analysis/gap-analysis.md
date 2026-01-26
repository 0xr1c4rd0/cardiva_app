# Gap Analysis: Gusto Design System vs Cardiva Current Implementation

> Comprehensive comparison identifying improvement opportunities for the Cardiva pharmaceutical RFP matching application, based on Gusto's proven B2B SaaS design patterns.

---

## Executive Summary

| Category | Cardiva Status | Priority Gaps | Improvement Score |
|----------|---------------|---------------|-------------------|
| **Color System** | ✅ Excellent | Minor token refinements | 9/10 |
| **Typography** | ✅ Good | Line-height consistency | 8/10 |
| **Spacing** | ⚠️ Needs Work | Inconsistent application | 6/10 |
| **Components** | ⚠️ Needs Work | 5 missing critical components | 6/10 |
| **Navigation** | ⚠️ Needs Work | Missing breadcrumbs, command palette | 5/10 |
| **Forms** | ⚠️ Needs Work | Validation patterns incomplete | 6/10 |
| **Data Display** | ✅ Good | Table accessibility gaps | 7/10 |
| **Feedback** | ⚠️ Needs Work | Toast positioning, empty states | 6/10 |
| **Animation** | ✅ Good | Already has Framer Motion | 8/10 |
| **Accessibility** | ⚠️ Needs Work | Missing ARIA labels | 5/10 |

**Overall Score: 6.6/10** → Target: 8.5/10+

---

## Color System Comparison

### Current Cardiva Colors (OKLCH)

```css
/* globals.css */
--color-primary: oklch(0.45 0.12 170);        /* #0A6B5D - teal */
--color-primary-hover: oklch(0.38 0.10 170);  /* #085A4E */
--color-primary-light: oklch(0.94 0.03 170);  /* #E8F4F2 */
--color-coral: oklch(0.65 0.18 25);           /* #F45D48 - destructive */
```

### Gusto Reference Colors

```css
--color-primary: #0A8080;        /* Teal - slightly more saturated */
--color-primary-hover: #086868;
--color-primary-light: #E6F4F4;
--color-accent: #F45D48;         /* Coral */
--color-success: #0B8E4C;        /* Green */
--color-error: #D93D42;          /* Red */
--color-warning: #F5A623;        /* Yellow/Amber */
```

### Gap Analysis

| Aspect | Cardiva | Gusto | Gap | Priority |
|--------|---------|-------|-----|----------|
| Primary Teal | oklch(0.45 0.12 170) | #0A8080 | Slightly desaturated | Low |
| Success Green | Uses shadcn default | #0B8E4C | Missing custom token | Medium |
| Warning Yellow | Uses shadcn default | #F5A623 | Missing custom token | Medium |
| Info Blue | Uses shadcn default | #2563EB | Consider customizing | Low |
| Semantic Backgrounds | Partial | Full set | Missing light variants | Medium |

### Recommendations

1. **Add semantic color light variants**:
```css
--color-success-light: oklch(0.95 0.04 145);  /* E8F5ED equivalent */
--color-warning-light: oklch(0.97 0.03 85);   /* FFF8E6 equivalent */
--color-error-light: oklch(0.96 0.03 25);     /* FDEBEB equivalent */
```

2. **Keep OKLCH system** - it's more modern and perceptually uniform than Gusto's hex colors

---

## Typography Comparison

### Current Cardiva Typography

```css
/* Fonts */
--font-display: 'Fraunces', serif;     /* Headings */
--font-body: 'Geist Sans', sans-serif; /* Body */
```

### Gusto Reference

```css
--font-display: 'Tiempos Headline', serif;
--font-body: 'Inter', sans-serif;
```

### Gap Analysis

| Aspect | Cardiva | Gusto | Gap | Priority |
|--------|---------|-------|-----|----------|
| Display Font | Fraunces (serif) | Tiempos (serif) | ✅ Equivalent pattern | - |
| Body Font | Geist Sans | Inter | ✅ Both excellent | - |
| Type Scale | Tailwind default | Custom 8-level | Inconsistent application | Medium |
| Line Heights | Default | Custom per level | Not optimized | Medium |
| Font Weights | 400, 500, 600, 700 | 400, 500, 600, 700 | ✅ Same | - |

### Recommendations

1. **Standardize type scale** in globals.css:
```css
/* Heading Type Scale */
--text-h1: 1.75rem;    /* 28px */
--text-h2: 1.5rem;     /* 24px */
--text-h3: 1.25rem;    /* 20px */
--text-h4: 1.125rem;   /* 18px */
--text-body-lg: 1.125rem;
--text-body: 1rem;
--text-body-sm: 0.875rem;
--text-caption: 0.75rem;
```

2. **Add line-height tokens**:
```css
--leading-tight: 1.25;    /* Headings */
--leading-snug: 1.375;    /* Subheadings */
--leading-normal: 1.5;    /* Body */
--leading-relaxed: 1.625; /* Long-form */
```

---

## Spacing & Layout Comparison

### Current Cardiva

- Uses Tailwind default spacing (4px base)
- Inconsistent application across pages
- No documented spacing scale

### Gusto Reference

- 8px base unit
- Consistent spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px
- Well-documented layout patterns

### Gap Analysis

| Aspect | Cardiva | Gusto | Gap | Priority |
|--------|---------|-------|-----|----------|
| Base Unit | 4px (Tailwind) | 8px | Consider 8px for consistency | Low |
| Card Padding | Mixed (p-4, p-6) | Consistent 24px | Standardize | Medium |
| Section Margins | Inconsistent | 48-64px | Document & apply | Medium |
| Form Field Gap | Mixed | 24px consistent | Standardize to 6 | High |
| Sidebar Width | 240px | 240px | ✅ Same | - |

### Recommendations

1. **Document standard spacing**:
```css
/* Component spacing tokens */
--space-card-padding: 1.5rem;     /* 24px */
--space-section-gap: 3rem;        /* 48px */
--space-form-gap: 1.5rem;         /* 24px */
--space-input-gap: 0.5rem;        /* 8px - label to input */
```

2. **Audit and standardize** all pages for consistent spacing

---

## Component Gap Analysis

### Components Present in Cardiva

Based on the audit, Cardiva has **31+ shadcn/ui components** installed:

✅ Present and working:
- Button, Input, Label, Textarea
- Card, Dialog, Sheet, Popover
- Table, Badge, Avatar
- Select, Checkbox, RadioGroup
- Toast (Sonner), Tooltip
- DropdownMenu, Separator
- Progress, Skeleton
- Alert, AlertDialog

### Missing Critical Components

| Component | Gusto Usage | Cardiva Status | Priority |
|-----------|-------------|----------------|----------|
| **Tabs** | Everywhere - People, Settings, Reports | ❌ Not installed | 🔴 Critical |
| **Accordion** | FAQ, Settings, Expandable sections | ❌ Not installed | 🟡 High |
| **Breadcrumb** | All nested pages | ❌ Not installed | 🟡 High |
| **Command** | Quick search (Cmd+K) | ❌ Not installed | 🟢 Medium |
| **Combobox** | Searchable selects | ❌ Not installed | 🟢 Medium |
| **NavigationMenu** | Top navigation (if needed) | ❌ Not installed | 🟢 Low |
| **Calendar** | Date picking | ⚠️ May need enhancement | 🟢 Medium |

### Component Styling Gaps

| Component | Current Issue | Gusto Pattern | Fix |
|-----------|--------------|---------------|-----|
| **Button** | Default sizing | 44px height standard | Increase to h-11 default |
| **Input** | 40px height | 44px height | Increase to h-11 |
| **Badge** | Limited variants | 6 semantic colors | Add all color variants |
| **Table** | Basic styling | Row hover, selected state | Add interactive states |
| **Toast** | Top-right position | Bottom-left | Change position |

### Recommendations

1. **Install missing components immediately**:
```bash
bunx shadcn@latest add tabs accordion breadcrumb command
```

2. **Customize component defaults** in `components/ui/*.tsx`

---

## Navigation Gap Analysis

### Current Cardiva Navigation

```
Sidebar:
├── Dashboard (Painel)
├── RFPs (RFPs)
├── Inventory (Inventário)
└── Admin section (if admin)
    └── Users (Utilizadores)
```

### Gusto Navigation Patterns

1. **Hierarchical sidebar** with nested items
2. **Breadcrumbs** on all nested pages
3. **Tabs** for entity sub-pages (Overview, Details, Documents)
4. **Command palette** (Cmd+K) for quick navigation
5. **User menu** at sidebar bottom

### Gap Analysis

| Feature | Cardiva | Gusto | Gap | Priority |
|---------|---------|-------|-----|----------|
| Sidebar structure | Flat list | Hierarchical with collapse | Consider for scale | Low |
| Breadcrumbs | ❌ Missing | All nested pages | **Critical gap** | 🔴 Critical |
| Tab navigation | ❌ Missing | Entity detail pages | **Critical gap** | 🔴 Critical |
| Command palette | ❌ Missing | Global search | Enhancement | 🟢 Medium |
| Mobile nav | Sidebar hidden | Bottom navigation | Mobile improvement | 🟡 High |

### Recommendations

1. **Add breadcrumbs** to all pages with depth > 1:
   - `/rfps/[id]` → "RFPs / RFP #123"
   - `/rfps/[id]/matches` → "RFPs / RFP #123 / Matches"

2. **Add tabs** to RFP detail page:
   - Overview | Matches | History | Export

3. **Consider command palette** for power users (Phase 2)

---

## Form Pattern Gap Analysis

### Current Cardiva Forms

- Basic form layouts
- Server-side validation (form actions)
- No inline validation UI
- Limited error messaging

### Gusto Form Patterns

1. **Inline validation** with real-time feedback
2. **Password strength meters** with requirements checklist
3. **Progressive disclosure** (show fields based on selection)
4. **Multi-step wizards** with progress indicators
5. **Inline entity creation** (add new items without leaving form)
6. **Triple-action footer** (Back, Save for later, Continue)

### Gap Analysis

| Feature | Cardiva | Gusto | Gap | Priority |
|---------|---------|-------|-----|----------|
| Inline validation | ❌ Missing | Real-time | Implement for password | 🟡 High |
| Password strength | ❌ Missing | Visual meter + checklist | Add to registration | 🟡 High |
| Multi-step wizard | Partial (upload) | Full pattern | Already have basics | 🟢 Low |
| Form field hints | Partial | Consistent | Standardize | 🟢 Medium |
| Error placement | Below field | Below field | ✅ Same | - |
| Required indicators | Asterisk | Asterisk | ✅ Same | - |

### Recommendations

1. **Add inline validation component**:
```tsx
<FormField
  name="password"
  validate={passwordSchema}
  showStrengthMeter
  showRequirements
/>
```

2. **Standardize form layouts** with consistent spacing

---

## Data Display Gap Analysis

### Current Cardiva Tables

- Basic shadcn Table component
- Pagination via nuqs (URL state)
- Sorting on some columns
- Bulk selection (RFP matches)

### Gusto Table Features

1. **Sticky headers** on scroll
2. **Row hover states** with background change
3. **Selected row highlighting** (teal background)
4. **Sortable columns** with aria-sort
5. **Bulk action bar** on selection
6. **Empty states** with illustration + CTA
7. **Loading skeletons** matching table structure

### Gap Analysis

| Feature | Cardiva | Gusto | Gap | Priority |
|---------|---------|-------|-----|----------|
| Sticky headers | ❌ Missing | Present | Add for long tables | 🟢 Medium |
| Row hover | Basic | Gray-50 background | Enhance | 🟢 Low |
| Selected state | Checkbox only | Checkbox + teal bg | Add visual | 🟡 High |
| Sortable columns | Partial | All sortable + aria-sort | Add accessibility | 🟡 High |
| Empty states | Generic | Contextual illustration | Improve | 🟡 High |
| Skeleton loading | ✅ Present | Present | - | - |
| Bulk actions | ✅ Present | Present | - | - |

### Recommendations

1. **Enhance table row states**:
```tsx
<TableRow
  data-state={isSelected ? "selected" : undefined}
  className="hover:bg-muted/50 data-[state=selected]:bg-primary/5"
/>
```

2. **Add aria-sort** to sortable columns

3. **Create contextual empty states** for each table

---

## Feedback & Status Gap Analysis

### Current Cardiva Feedback

- Sonner toasts (top-right)
- Badge components for status
- Alert banners (limited use)
- Loading spinners

### Gusto Feedback Patterns

1. **Toast position**: Bottom-left
2. **Toast variants**: Success (green), Error (red), Warning (yellow), Info (blue)
3. **Alert banners**: Page-level and section-level
4. **Status dots**: Small colored circles with labels
5. **Progress indicators**: Step indicators, progress bars
6. **Confirmation modals**: Destructive action warnings
7. **Branded loading**: Animated shapes (playful)

### Gap Analysis

| Feature | Cardiva | Gusto | Gap | Priority |
|---------|---------|-------|-----|----------|
| Toast position | Top-right | Bottom-left | Change position | 🟢 Low |
| Toast duration | Default | 5s success, persistent error | Configure | 🟢 Medium |
| Alert banners | Limited | Page + section level | Expand usage | 🟢 Medium |
| Status dots | ❌ Missing | Consistent pattern | Add component | 🟡 High |
| Confirmation modals | AlertDialog | Same | ✅ Present | - |
| Loading states | Skeleton/Spinner | Branded animation | Consider enhancement | 🟢 Low |

### Recommendations

1. **Change toast position** to bottom-left in Sonner config:
```tsx
<Toaster position="bottom-left" />
```

2. **Add StatusDot component**:
```tsx
<StatusDot variant="success" label="Ativo" />
<StatusDot variant="pending" label="Pendente" />
<StatusDot variant="error" label="Rejeitado" />
```

3. **Create step indicator** for multi-step flows

---

## Animation & Motion Gap Analysis

### Current Cardiva

- Framer Motion page transitions ✅
- Basic hover transitions ✅
- Loading spinners ✅

### Gusto Patterns

- 150ms buttons/inputs
- 200ms dropdowns/tooltips
- 300ms modals/sidebars
- Branded loading animation (shapes)

### Assessment

Cardiva is **ahead of baseline** with Framer Motion implementation.

| Feature | Cardiva | Gusto | Gap | Priority |
|---------|---------|-------|-----|----------|
| Page transitions | ✅ Framer Motion | Basic fades | Cardiva is better | - |
| Micro-interactions | Basic | 150ms consistent | Standardize | 🟢 Low |
| Loading animation | Generic spinner | Branded shapes | Consider branded | 🟢 Low |

### Recommendations

1. **Keep Framer Motion** - already exceeds Gusto baseline
2. **Consider branded loading** animation (optional enhancement)

---

## Accessibility Gap Analysis

### Current Cardiva Issues (from audit)

1. **Missing ARIA labels** on icon-only buttons
2. **No aria-sort** on sortable table columns
3. **Color contrast** may need verification
4. **Focus states** using shadcn defaults (adequate)
5. **Keyboard navigation** needs testing

### Gusto Accessibility Patterns

1. All icon buttons have `aria-label`
2. Status indicators have screen reader text
3. Modals trap focus correctly
4. Sortable tables use `aria-sort`
5. Form fields have proper label associations

### Gap Analysis

| Feature | Cardiva | Gusto | Gap | Priority |
|---------|---------|-------|-----|----------|
| Icon button labels | ❌ Missing | All labeled | **Critical** | 🔴 Critical |
| Table aria-sort | ❌ Missing | Present | Add immediately | 🔴 Critical |
| Status SR text | ❌ Missing | Screen reader only spans | Add | 🟡 High |
| Focus management | Basic | Comprehensive | Test and improve | 🟡 High |
| Skip links | ❌ Missing | Present | Add | 🟢 Medium |
| Color contrast | Unknown | 4.5:1+ | Audit needed | 🟡 High |

### Recommendations

1. **Audit all icon-only buttons** and add aria-labels:
```tsx
<Button variant="ghost" size="icon" aria-label="Editar item">
  <Pencil className="h-4 w-4" />
</Button>
```

2. **Add aria-sort** to sortable table headers:
```tsx
<TableHead
  aria-sort={sortDirection === 'asc' ? 'ascending' : 'descending'}
>
```

3. **Add screen reader text** for status indicators:
```tsx
<Badge variant="success">
  <span className="sr-only">Status: </span>
  Ativo
</Badge>
```

---

## Priority Gap Summary

### 🔴 Critical (Implement Immediately)

1. **Install Tabs component** - needed for RFP detail page
2. **Install Breadcrumb component** - navigation clarity
3. **Add aria-labels** to all icon buttons
4. **Add aria-sort** to sortable table columns

### 🟡 High Priority (This Sprint)

1. Install Accordion component
2. Add StatusDot component
3. Implement inline form validation
4. Add password strength meter
5. Create contextual empty states
6. Add row selected state to tables
7. Audit and fix color contrast issues

### 🟢 Medium Priority (Next Sprint)

1. Install Command component (quick search)
2. Install Combobox component
3. Change toast position to bottom-left
4. Add semantic color light variants
5. Standardize spacing across pages
6. Add step indicator component
7. Add skip navigation links

### 🔵 Low Priority (Backlog)

1. Consider branded loading animation
2. Hierarchical sidebar (if needed at scale)
3. Mobile bottom navigation
4. Type scale refinements

---

## Implementation Complexity Estimates

| Gap | shadcn Component | Effort | Files Changed |
|-----|------------------|--------|---------------|
| Tabs | `tabs` | Small | 2-3 pages |
| Breadcrumb | `breadcrumb` | Small | Layout + pages |
| Accordion | `accordion` | Small | Settings page |
| Command | `command` | Medium | Layout, new component |
| Combobox | `combobox` (build) | Medium | New component |
| StatusDot | Custom | Small | New component |
| Step Indicator | Custom | Small | New component |
| Form validation | Enhancement | Medium | Form components |
| Password meter | Enhancement | Medium | Auth forms |
| Accessibility | Audit | Medium | All pages |
| Spacing | CSS | Small | globals.css |
| Empty states | Content | Medium | All tables |

---

## Conclusion

Cardiva has a **solid foundation** with 31+ shadcn/ui components, OKLCH color system, and Framer Motion animations. The primary gaps are:

1. **Missing navigation components** (Tabs, Breadcrumbs) - easy to add
2. **Accessibility gaps** (ARIA labels) - must fix for compliance
3. **Form patterns** - inline validation needed for better UX
4. **Visual polish** - status dots, empty states, toast positioning

**Total estimated effort**: 2-3 weeks for full implementation

**Constraint respected**: All improvements use shadcn/ui components only.

---

*Gap analysis based on comparison of 363 Gusto screenshots against Cardiva app audit.*

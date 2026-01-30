# Cardiva App UI Audit

**Audit Date:** 2026-01-26
**Purpose:** Document current UI implementation for comparison with Gusto design patterns

---

## 1. Component Inventory

### 1.1 Core UI Components (`src/components/ui/`)

| Component | Purpose | Props/Variants | Styling Approach |
|-----------|---------|----------------|------------------|
| **button.tsx** | Primary interaction element | `variant`: default, destructive, outline, secondary, ghost, link; `size`: default, sm, lg, icon | CVA with rounded-full shape, active:scale-[0.98] micro-interaction |
| **card.tsx** | Content container | CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter | Shadow-md, ring-1 ring-black/5, rounded-xl, no border |
| **input.tsx** | Text input field | Standard HTML input props | Rounded-md, focus ring pattern, aria-invalid states |
| **badge.tsx** | Status indicators | `variant`: default, secondary, destructive, outline | Rounded-full (pill), CVA variants |
| **table.tsx** | Data tables | Table, TableHeader, TableBody, TableRow, TableHead, TableCell | Minimal borders, slate color scheme |
| **dialog.tsx** | Modal dialogs | DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter | Radix-based, animated entry/exit |
| **alert-dialog.tsx** | Confirmation dialogs | AlertDialogAction, AlertDialogCancel | Destructive action styling support |
| **alert.tsx** | Inline notifications | `variant`: default, destructive | Border-left accent, icon support |
| **select.tsx** | Dropdown select | SelectTrigger, SelectContent, SelectItem | Radix-based, consistent with input styling |
| **skeleton.tsx** | Loading placeholder | Basic div with animate-pulse | bg-primary/10 background |
| **progress.tsx** | Progress indicator | `value` prop | Rounded-full, primary fill color |
| **tooltip.tsx** | Hover information | TooltipTrigger, TooltipContent | Radix-based, z-50 positioning |
| **dropdown-menu.tsx** | Action menus | DropdownMenuItem, DropdownMenuSeparator | Radix-based, keyboard navigation |
| **sheet.tsx** | Side panel/drawer | SheetContent with side variants | Slide animation, overlay backdrop |
| **sidebar.tsx** | App navigation | Complex sidebar system with groups, menu items, trigger | Dark theme (gray-900), collapsible |
| **checkbox.tsx** | Boolean input | Radix-based | Size-4, rounded-[4px], primary fill |
| **label.tsx** | Form labels | Standard label props | Text-sm, font-medium |
| **avatar.tsx** | User identity | AvatarImage, AvatarFallback | Rounded-full, size-8 default |
| **separator.tsx** | Visual divider | `orientation`: horizontal, vertical | bg-border, 1px |
| **popover.tsx** | Floating content | PopoverTrigger, PopoverContent | Radix-based, animated |
| **collapsible.tsx** | Expandable sections | CollapsibleTrigger, CollapsibleContent | Radix-based |
| **radio-group.tsx** | Radio selection | RadioGroup, RadioGroupItem | Radix-based, grid layout |
| **switch.tsx** | Toggle control | Radix-based | Size h-5 w-9, rounded-full |
| **sonner.tsx** | Toast notifications | Toaster wrapper | CSS variable theming |

### 1.2 Custom Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **sortable-header.tsx** | Table column sorting | `src/components/ui/` |
| **animated-number.tsx** | Number animation | `src/components/ui/` |
| **motion-provider.tsx** | Page transitions | `src/components/ui/` |
| **kpi-stats-card.tsx** | Dashboard metrics | `src/components/dashboard/` |
| **app-sidebar.tsx** | Main navigation | `src/components/layout/` |
| **user-menu.tsx** | User dropdown | `src/components/layout/` |

---

## 2. Page Analysis

### 2.1 Route Structure

```
src/app/
├── (auth)/                    # Public auth pages
│   ├── layout.tsx            # Centered, no sidebar
│   ├── login/page.tsx        # Card-based form
│   ├── register/page.tsx     # Card-based form
│   ├── reset-password/page.tsx
│   └── update-password/page.tsx
├── (dashboard)/               # Protected dashboard
│   ├── layout.tsx            # Sidebar + header + content
│   ├── page.tsx              # Dashboard home (quick links)
│   ├── admin/
│   │   ├── users/page.tsx    # User management table
│   │   └── settings/page.tsx # Admin configuration
│   ├── inventory/page.tsx    # Product inventory table
│   └── rfps/
│       ├── page.tsx          # RFP list with KPIs
│       └── [id]/matches/page.tsx  # Match review interface
├── pending-approval/page.tsx  # Account pending state
└── unauthorized/page.tsx      # Access denied state
```

### 2.2 Layout Structures

**Auth Layout (`(auth)/layout.tsx`)**
- Simple centered layout
- `min-h-screen flex items-center justify-center bg-background`
- No sidebar, no header
- Used for: login, register, password reset

**Dashboard Layout (`(dashboard)/layout.tsx`)**
- SidebarProvider with AppSidebar
- SidebarInset with header and main content
- Header: h-16, border-b, contains SidebarTrigger and UserMenu
- Main content: max-w-[1600px], p-6 lg:p-8
- MotionProvider wraps children for page transitions

**Admin Layout (`(dashboard)/admin/layout.tsx`)**
- Inherits dashboard layout
- No additional wrapper

### 2.3 Page Component Patterns

**Dashboard Home (`page.tsx`)**
- Page header: h1 (text-3xl font-semibold) + description
- Grid of 3 link cards with icons
- Cards use: rounded-lg border p-6 hover:bg-accent

**RFPs Page (`rfps/page.tsx`)**
- Server-side data fetching with KPI computation
- RFPPageContent client component receives:
  - initialJobs, totalCount, initialKPIs, initialState
- Components: RFPStats (KPI cards), RFPJobsList (table-in-card)
- Loading skeleton via loading.tsx

**Inventory Page (`inventory/page.tsx`)**
- Server-side with column config from DB
- Components: InventoryStats, InventoryTable
- TableToolbar for search
- DataTablePagination

**Admin Users Page (`admin/users/page.tsx`)**
- Server-side user/profile fetch
- UsersTable with inline actions (RoleDropdown, ActiveToggle, DeleteUserButton)

---

## 3. Design Tokens

### 3.1 Color System (from `globals.css`)

**Primary Colors (Gusto-inspired Teal)**
```css
--color-primary: oklch(0.45 0.12 170);          /* #0A6B5D */
--color-primary-hover: oklch(0.38 0.10 170);    /* #085A4E */
--color-primary-light: oklch(0.94 0.03 170);    /* #E8F4F2 */
--color-primary-foreground: oklch(1 0 0);       /* white */
```

**Accent Colors**
```css
--color-coral: oklch(0.65 0.18 25);             /* #F45D48 - destructive */
--color-coral-light: oklch(0.97 0.02 25);       /* #FEF2F0 */
--color-yellow: oklch(0.80 0.14 85);            /* #F5A623 */
--color-green: oklch(0.58 0.12 175);            /* #0D9488 */
```

**Neutral Colors (Warm Grays)**
```css
--color-gray-50: oklch(0.99 0.002 85);
--color-gray-100: oklch(0.97 0.003 85);
--color-gray-200: oklch(0.92 0.005 85);
--color-gray-400: oklch(0.70 0.01 85);
--color-gray-600: oklch(0.45 0.01 85);
--color-gray-900: oklch(0.20 0.01 85);
```

**Semantic Colors (CSS Variables)**
```css
--background: oklch(1 0 0);                     /* white */
--foreground: oklch(0.20 0 0);                  /* gray-900 */
--muted: oklch(0.96 0 0);                       /* gray-100 */
--muted-foreground: oklch(0.45 0 0);            /* gray-600 */
--border: oklch(0.92 0 0);                      /* gray-200 */
--ring: oklch(0.45 0.12 170);                   /* primary */
--destructive: oklch(0.65 0.18 25);             /* coral */
```

**Sidebar (Dark Theme)**
```css
--sidebar: oklch(0.20 0 0);                     /* gray-900 */
--sidebar-foreground: oklch(0.96 0 0);          /* gray-100 */
--sidebar-primary: oklch(0.45 0.12 170);        /* teal */
--sidebar-accent: oklch(0.30 0 0);
--sidebar-border: oklch(0.30 0 0);
```

### 3.2 Typography

**Font Stack**
```css
--font-sans: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, ...;
--font-serif: var(--font-serif), 'Georgia', serif;  /* Fraunces for headings */
--font-mono: var(--font-geist-mono), ui-monospace, ...;
```

**Font Loading (layout.tsx)**
- Geist Sans (body text) - weight 500 default
- Geist Mono (code)
- Fraunces (headings) - weight 600, letter-spacing -0.02em

**Typography Scale (observed usage)**
| Element | Class | Usage |
|---------|-------|-------|
| Page title | `text-3xl font-semibold` or `text-2xl font-semibold` | Dashboard headers |
| Card title | `leading-none font-semibold` | Card headers |
| Section label | `text-sm font-medium` | Form labels |
| Body text | `text-sm` | General content |
| Muted text | `text-sm text-muted-foreground` | Descriptions |
| Tiny text | `text-xs` | Timestamps, badges |
| Table header | `text-xs font-medium tracking-wide` | Table columns |

### 3.3 Spacing System

```css
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
```

**Common patterns:**
- Page padding: `p-6 lg:p-8`
- Card padding: `py-6 px-6`
- Gap in lists: `gap-2` to `gap-6`
- Button padding: `px-5 py-2` (default)

### 3.4 Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;     /* --radius default */
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

**Component defaults:**
- Buttons: `rounded-full`
- Cards: `rounded-xl`
- Inputs: `rounded-md`
- Badges: `rounded-full`
- Tables: `rounded-lg`

### 3.5 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.03);
--shadow-md: 0 4px 6px -1px rgb(10 107 93 / 0.08), 0 2px 4px -2px rgb(10 107 93 / 0.04);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04);
--shadow-float: 0 20px 25px -5px rgb(0 0 0 / 0.06), 0 8px 10px -6px rgb(0 0 0 / 0.04);
```

**Note:** shadow-md is tinted with primary color (teal) for subtle brand touch.

---

## 4. Current Patterns

### 4.1 Navigation Patterns

**Sidebar Navigation**
- Dark sidebar (gray-900) with light text
- Grouped menu items (Navegacao, Administracao)
- Icons (lucide-react) + text labels
- SidebarMenuButton with hover states
- Collapsible via SidebarTrigger
- Cookie-persisted open/closed state

**User Menu**
- Avatar button trigger (top-right)
- DropdownMenu with user info + logout action
- Initials fallback for avatar

**Page-level Navigation**
- Breadcrumbs: Not implemented
- Tabs: Not implemented (could use for match review filters)

### 4.2 Form Patterns

**Login/Register Forms**
```tsx
<Card className="w-full max-w-md">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <form action={formAction}>
    <CardContent className="space-y-4">
      {/* Error alert if present */}
      <div className="space-y-2">
        <Label htmlFor="field">Label</Label>
        <Input id="field" name="field" ... />
      </div>
    </CardContent>
    <CardFooter>
      <Button type="submit" className="w-full">Submit</Button>
    </CardFooter>
  </form>
</Card>
```

**Form Validation**
- Uses `useActionState` for server actions
- Error displayed via Alert component above form fields
- `aria-invalid` states on inputs
- Loading state disables inputs and shows spinner text

**Search/Filter Forms**
```tsx
<div className="relative flex-1 max-w-sm">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
  <Input placeholder="Search..." className="pl-9 pr-9" />
  {search && <ClearButton />}
</div>
```

### 4.3 Table/List Patterns

**Inventory Table Style**
```tsx
<div className="rounded-lg border border-slate-200 shadow-xs overflow-hidden bg-white p-2">
  <Table className="[&_thead_tr]:border-0">
    <TableHeader>
      <TableRow className="hover:bg-transparent border-0">
        <TableHead className="text-xs font-medium text-slate-700 tracking-wide bg-slate-100/70 py-2 rounded-l-md">
```

**Key characteristics:**
- Rounded container with subtle shadow
- Header row with light gray background (slate-100/70)
- First/last header cells have rounded corners
- No row borders, hover:bg-slate-50
- Skeleton loading rows during transitions

**List Pattern (RFP Jobs)**
```tsx
<div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
  {/* Content with icon, title, metadata */}
  {/* Actions: Badge status + icon buttons */}
</div>
```

**Sortable Headers**
- Button with icon (ArrowUpDown, ArrowUp, ArrowDown)
- Active state shows directional arrow
- Hover:text-slate-900 transition

**Pagination**
- Page size selector (Select component)
- Page info: "Showing X of Y"
- Previous/Next buttons
- Uses nuqs for URL state management

### 4.4 Modal/Dialog Patterns

**Standard Dialog**
```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <div className="space-y-6">
      {/* Content */}
    </div>
    <div className="flex justify-end gap-2">
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </div>
  </DialogContent>
</Dialog>
```

**Confirmation Dialog (AlertDialog)**
```tsx
<AlertDialog>
  <AlertDialogContent className="sm:max-w-[550px]">
    <AlertDialogHeader>
      <AlertDialogTitle>Confirm Action</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure? <span className="font-medium text-foreground">{item}</span>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 4.5 Empty States

**No Data Empty State**
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="mb-6 rounded-full bg-muted p-6">
    <Icon className="h-12 w-12 text-muted-foreground" />
  </div>
  <h3 className="mb-2 text-lg font-medium">No items yet</h3>
  <p className="mb-6 max-w-sm text-muted-foreground">
    Description of what to do next.
  </p>
  <Button>Primary Action</Button>
</div>
```

**Search Empty State**
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="mb-6 rounded-full bg-muted p-6">
    <SearchX className="h-12 w-12 text-muted-foreground" />
  </div>
  <h3>No results found</h3>
  <p>No matches for "{search}"</p>
  <Button variant="outline" onClick={handleClearSearch}>
    Clear search
  </Button>
</div>
```

### 4.6 Loading States

**Skeleton Loading**
```tsx
{isPending ? (
  Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={`skeleton-${i}`}>
      <TableCell><Skeleton className="h-4 w-full" /></TableCell>
    </TableRow>
  ))
) : (/* actual content */)}
```

**Button Loading**
```tsx
<Button disabled={isPending}>
  {isPending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

**Full Page Loading (loading.tsx)**
- Skeleton components matching page layout
- Card headers/content placeholders
- Toolbar and pagination skeletons

### 4.7 Error Handling UI

**Form Error**
```tsx
{state?.error && (
  <Alert variant="destructive">
    <AlertDescription>{state.error}</AlertDescription>
  </Alert>
)}
```

**Inline Error Message**
```tsx
{uploadError && (
  <p className="text-sm text-destructive">{uploadError}</p>
)}
```

**Row-level Error**
```tsx
{job.error_message && (
  <p className="text-sm text-destructive mt-1">{job.error_message}</p>
)}
```

### 4.8 Toast/Notification Patterns

**Toast Usage (sonner)**
```tsx
import { toast } from 'sonner'

toast.success('Success title', {
  description: 'Additional details',
})

toast.error('Error title', {
  description: 'What went wrong',
})
```

**Toaster Configuration**
- Positioned via Sonner defaults
- Styled with CSS variables for consistency

### 4.9 Status Badge Patterns

**Processing Status**
```tsx
const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, variant: 'secondary' },
  processing: { label: 'A processar', icon: Loader2, className: 'animate-spin' },
  completed: { label: 'Concluido', icon: CheckCircle2, className: 'text-green-600' },
  failed: { label: 'Falhou', icon: XCircle, variant: 'destructive' },
}
```

**Review Status (3-state model)**
```tsx
const reviewStatusConfig = {
  por_rever: {
    label: 'Por Rever',
    className: 'text-amber-600',
    badgeClassName: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  revisto: {
    className: 'text-blue-600',
    badgeClassName: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  confirmado: {
    className: 'text-emerald-600',
    badgeClassName: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
}
```

### 4.10 File Upload Patterns

**Dropzone**
```tsx
<div className={cn(
  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
  isDragActive && 'border-primary bg-primary/5',
  isDragReject && 'border-destructive bg-destructive/5',
  files.length > 0 && 'border-green-500 bg-green-50',
  'border-muted-foreground/25 hover:border-muted-foreground/50'
)}>
  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
  <p>Drag files here, or click to select</p>
</div>
```

### 4.11 KPI/Stats Card Pattern

```tsx
<Card className="overflow-hidden">
  <CardContent className="p-6">
    <div className="flex items-center gap-4">
      <div className="rounded-full p-3 bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">Label</p>
        <h3 className="text-2xl font-bold tracking-tight mt-1">
          <AnimatedNumber value={value} />
        </h3>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 5. Accessibility

### 5.1 Current Implementation

**Positive Findings:**
- Radix UI primitives provide built-in accessibility (focus management, keyboard nav, ARIA)
- `aria-invalid` states on form inputs
- `sr-only` class used for screen-reader text ("Limpar pesquisa")
- Label/Input associations via `htmlFor`/`id`
- Focus-visible ring styles on interactive elements
- Disabled states with `disabled:opacity-50 disabled:pointer-events-none`

**ARIA Labels Present:**
- AlertDialog uses AlertDialogTitle/Description for accessible labeling
- Select/Dropdown items have proper roles
- Checkboxes have proper checked state announcements

### 5.2 Gaps Identified

**Missing ARIA Labels:**
- Icon-only buttons often lack `aria-label` (rely on `title` attribute instead)
- Table sorting buttons could use `aria-sort` attribute
- Loading states could announce "Loading..." to screen readers

**Keyboard Navigation:**
- Most components support keyboard nav via Radix
- Custom popover menus in match review may need testing
- Delete animation could trap focus briefly

**Focus Management:**
- Dialog focus trap works (Radix)
- After delete animation completes, focus management unclear

**Color Contrast:**
- Muted text (`text-muted-foreground`) against white may need verification
- Amber/yellow status badges may have insufficient contrast
- Skeleton loading (bg-primary/10) very low contrast

### 5.3 Recommendations

1. Add `aria-label` to all icon-only buttons
2. Add `aria-sort` to sortable table headers
3. Use `aria-live` regions for loading/status updates
4. Verify color contrast ratios (WCAG 2.1 AA: 4.5:1)
5. Add skip navigation link
6. Test with screen reader (NVDA, VoiceOver)
7. Document keyboard shortcuts if any

---

## 6. Animation & Transitions

### 6.1 Page Transitions

**MotionProvider (Framer Motion)**
```tsx
<motion.div
  key={pathname}
  initial={{ opacity: 0, y: 15, filter: "blur(5px)" }}
  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
  exit={{ opacity: 0, y: -15, filter: "blur(5px)" }}
  transition={{ duration: 0.3, ease: "easeOut" }}
/>
```

### 6.2 Micro-interactions

- Button: `active:scale-[0.98]` press feedback
- Hover states: `transition-colors` on most interactive elements
- Delete animation: opacity + max-height collapse over 400ms
- Progress bar: `transition-all duration-300` on fill
- Number animation: requestAnimationFrame with easeOutCubic

### 6.3 Loading Animations

- Skeleton: `animate-pulse` (Tailwind)
- Spinner: `animate-spin` (Tailwind)
- Processing badge icon: `animate-spin` on Loader2

---

## 7. Responsive Design

### 7.1 Breakpoints Used

- `sm`: 640px (rarely used)
- `md`: 768px (grid columns)
- `lg`: 1024px (padding adjustments)
- No `xl` or `2xl` usage observed

### 7.2 Responsive Patterns

**Layout:**
- `max-w-[1600px]` content container
- `p-6 lg:p-8` responsive padding
- Sidebar collapsible on mobile (via SidebarProvider)

**Grid:**
- `md:grid-cols-3` for dashboard cards
- `md:grid-cols-4` for KPI stats

**Tables:**
- Horizontal scroll via `overflow-hidden` on container
- No responsive column hiding implemented

### 7.3 Mobile Considerations

- Sidebar has mobile width: `--sidebar-width-mobile: 240px`
- Forms use `max-w-md` for mobile-friendly width
- Touch targets: Buttons are h-10 (40px), adequate size

---

## 8. State Management

### 8.1 URL State (nuqs)

Used for:
- Pagination (page, pageSize)
- Search/filter (search, status)
- Sorting (sortBy, sortOrder/sortDir)

Pattern:
```tsx
const [{ page, search }, setParams] = useQueryStates(
  {
    page: parseAsInteger.withDefault(1),
    search: parseAsString.withDefault(''),
  },
  { shallow: false, startTransition }
)
```

### 8.2 Client State

- `useState` for local component state
- `useTransition` for loading states with server actions
- `useRef` for DOM references and caching
- Context API: `useRFPConfirmation` for shared confirmation state

### 8.3 Server State

- Server Components fetch initial data
- Client components receive as props and maintain local copy
- Real-time updates via Supabase Realtime subscriptions
- `RFPUploadStatusContext` for upload queue management

---

## 9. Code Organization

### 9.1 Component Co-location

Feature-specific components live with their page:
```
rfps/
├── components/
│   ├── rfp-jobs-list.tsx
│   ├── rfp-stats.tsx
│   ├── pdf-dropzone.tsx
│   └── ...
└── page.tsx
```

### 9.2 Shared vs Feature Components

**Shared (`src/components/`):**
- `ui/` - shadcn/ui primitives
- `layout/` - App-wide layout components
- `dashboard/` - Dashboard-specific shared components

**Feature-specific:**
- Page-level `components/` folders
- Actions in `actions.ts` files alongside pages

---

## 10. Summary of Findings

### 10.1 Strengths

1. **Consistent Design System** - Well-defined CSS variables and tokens
2. **Gusto-inspired Color Palette** - Teal primary with warm grays
3. **Quality UI Primitives** - shadcn/ui with Radix provides solid foundation
4. **Good Loading States** - Skeletons, spinners, transition states
5. **Thoughtful Empty States** - Clear messaging with CTAs
6. **Page Transitions** - Smooth Framer Motion animations
7. **Portuguese Localization** - Consistent PT-PT throughout

### 10.2 Areas for Improvement

1. **Accessibility Gaps** - Missing ARIA labels on icon buttons
2. **Table Responsiveness** - No column hiding or stacking on mobile
3. **Breadcrumb Navigation** - Not implemented for deep pages
4. **Form Validation UX** - Could use inline field errors
5. **Skeleton Consistency** - Loading states could better match content layout
6. **Color Contrast** - Some muted/amber colors may need verification
7. **Touch Targets** - Some icon buttons are small (h-6)

### 10.3 Design Comparison Notes

For Gusto comparison, key areas to evaluate:
- Card elevation and shadow treatment
- Button styles (Gusto uses more rounded corners, distinctive hover states)
- Status indicators and badges
- Table design (Gusto has distinctive styling)
- Form field patterns and validation
- Navigation patterns (Gusto has unique sidebar/nav)
- Progress and completion patterns
- Illustration and iconography usage

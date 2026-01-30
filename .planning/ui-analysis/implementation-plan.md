# UI/UX Implementation Plan

> Prioritized action plan for implementing Gusto-inspired design improvements in Cardiva.
> **Constraint**: Only shadcn/ui components - no custom building.

---

## Phase Overview

| Phase | Focus | Duration | Priority |
|-------|-------|----------|----------|
| **Phase 1** | Critical Components & Accessibility | 3-4 days | 🔴 Critical |
| **Phase 2** | Navigation & Layout Polish | 2-3 days | 🟡 High |
| **Phase 3** | Form Enhancements | 2-3 days | 🟡 High |
| **Phase 4** | Data Display & Feedback | 2-3 days | 🟢 Medium |
| **Phase 5** | Design Token Refinements | 1-2 days | 🟢 Medium |

**Total Estimated Duration**: 10-15 days

---

## Phase 1: Critical Components & Accessibility
*Duration: 3-4 days | Priority: 🔴 Critical*

### Task 1.1: Install Missing shadcn/ui Components

**Command**:
```bash
bunx shadcn@latest add tabs accordion breadcrumb command
```

**Files Created**:
- `src/components/ui/tabs.tsx`
- `src/components/ui/accordion.tsx`
- `src/components/ui/breadcrumb.tsx`
- `src/components/ui/command.tsx`

**Verification**:
- [ ] All components install without errors
- [ ] TypeScript types are correct
- [ ] Components render in isolation

---

### Task 1.2: Add Tabs to RFP Detail Page

**Location**: `src/app/(dashboard)/rfps/[id]/page.tsx`

**Implementation**:
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RFPDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <RFPHeader rfpId={params.id} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="matches">Correspondências</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="export">Exportar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <RFPOverview rfpId={params.id} />
        </TabsContent>
        <TabsContent value="matches">
          <RFPMatches rfpId={params.id} />
        </TabsContent>
        <TabsContent value="history">
          <RFPHistory rfpId={params.id} />
        </TabsContent>
        <TabsContent value="export">
          <RFPExport rfpId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Styling Customization** (add to `globals.css`):
```css
/* Gusto-style tabs */
[data-radix-collection-item][data-state="active"] {
  color: oklch(0.45 0.12 170); /* primary */
  border-bottom-color: oklch(0.45 0.12 170);
}
```

**Files Modified**:
- `src/app/(dashboard)/rfps/[id]/page.tsx`
- `src/app/globals.css`

**Verification**:
- [ ] Tabs render correctly
- [ ] Tab switching works
- [ ] Active state shows teal underline
- [ ] Portuguese labels are correct
- [ ] Keyboard navigation (arrow keys) works

---

### Task 1.3: Add Breadcrumb Navigation

**Create Breadcrumb Component Wrapper**:
`src/components/breadcrumb-nav.tsx`

```tsx
"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const routeLabels: Record<string, string> = {
  "": "Painel",
  "rfps": "RFPs",
  "inventory": "Inventário",
  "admin": "Administração",
  "users": "Utilizadores",
  "matches": "Correspondências",
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Painel</BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/")
          const isLast = index === segments.length - 1
          const label = routeLabels[segment] || segment

          return (
            <BreadcrumbItem key={segment}>
              <BreadcrumbSeparator />
              {isLast ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

**Add to Dashboard Layout**:
`src/app/(dashboard)/layout.tsx`

```tsx
import { BreadcrumbNav } from "@/components/breadcrumb-nav"

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <BreadcrumbNav />
        {children}
      </main>
    </div>
  )
}
```

**Files Created/Modified**:
- `src/components/breadcrumb-nav.tsx` (new)
- `src/app/(dashboard)/layout.tsx` (modified)

**Verification**:
- [ ] Breadcrumbs show on nested pages
- [ ] Links navigate correctly
- [ ] Current page is not a link
- [ ] Separator renders correctly

---

### Task 1.4: Fix Accessibility - Icon Button Labels

**Audit Script** (run to find issues):
```bash
grep -r "size=\"icon\"" src/components --include="*.tsx" | grep -v "aria-label"
```

**Pattern to Fix**:
```tsx
// ❌ Before
<Button variant="ghost" size="icon">
  <Pencil className="h-4 w-4" />
</Button>

// ✅ After
<Button variant="ghost" size="icon" aria-label="Editar">
  <Pencil className="h-4 w-4" />
</Button>
```

**Common Labels (Portuguese)**:
| Icon | aria-label |
|------|------------|
| Pencil/Edit | "Editar" |
| Trash | "Eliminar" |
| Eye | "Ver detalhes" |
| Download | "Transferir" |
| Upload | "Carregar" |
| Search | "Pesquisar" |
| Filter | "Filtrar" |
| Sort | "Ordenar" |
| Close/X | "Fechar" |
| Menu/More | "Mais opções" |
| Refresh | "Atualizar" |
| Check | "Aprovar" |
| X | "Rejeitar" |

**Files to Audit**:
- `src/app/(dashboard)/rfps/[id]/matches/page.tsx`
- `src/app/(dashboard)/inventory/page.tsx`
- `src/app/(dashboard)/admin/users/page.tsx`
- `src/components/` (all components)

**Verification**:
- [ ] Run grep audit - no icon buttons without aria-label
- [ ] Screen reader test passes

---

### Task 1.5: Fix Accessibility - Table aria-sort

**Pattern to Implement**:
```tsx
<TableHead
  className="cursor-pointer"
  onClick={() => handleSort('name')}
  aria-sort={
    sortColumn === 'name'
      ? sortDirection === 'asc'
        ? 'ascending'
        : 'descending'
      : 'none'
  }
>
  Nome
  {sortColumn === 'name' && (
    <span aria-hidden="true">
      {sortDirection === 'asc' ? ' ↑' : ' ↓'}
    </span>
  )}
</TableHead>
```

**Files to Update**:
- `src/app/(dashboard)/rfps/page.tsx`
- `src/app/(dashboard)/rfps/[id]/matches/page.tsx`
- `src/app/(dashboard)/inventory/page.tsx`
- `src/app/(dashboard)/admin/users/page.tsx`

**Verification**:
- [ ] All sortable columns have aria-sort
- [ ] Visual sort indicator has aria-hidden
- [ ] Screen reader announces sort state

---

## Phase 2: Navigation & Layout Polish
*Duration: 2-3 days | Priority: 🟡 High*

### Task 2.1: Create StatusDot Component

**Create Component**:
`src/components/ui/status-dot.tsx`

```tsx
import { cn } from "@/lib/utils"

interface StatusDotProps {
  variant: "active" | "pending" | "inactive" | "error" | "success" | "warning"
  label?: string
  className?: string
  showLabel?: boolean
}

const variantStyles = {
  active: "bg-emerald-500",
  success: "bg-emerald-500",
  pending: "bg-amber-500",
  warning: "bg-amber-500",
  inactive: "bg-gray-400",
  error: "bg-red-500",
}

export function StatusDot({
  variant,
  label,
  className,
  showLabel = true,
}: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn("h-2 w-2 rounded-full", variantStyles[variant])}
        aria-hidden="true"
      />
      {label && (
        <>
          <span className="sr-only">Estado: </span>
          {showLabel && <span className="text-sm">{label}</span>}
          {!showLabel && <span className="sr-only">{label}</span>}
        </>
      )}
    </span>
  )
}
```

**Usage Example**:
```tsx
<StatusDot variant="active" label="Ativo" />
<StatusDot variant="pending" label="Pendente" />
<StatusDot variant="error" label="Rejeitado" />
```

**Files Created**:
- `src/components/ui/status-dot.tsx`

**Verification**:
- [ ] All variants render correctly
- [ ] Screen reader text is present
- [ ] Integrates with existing badge usage

---

### Task 2.2: Add Table Row Selected State

**Update Table Styles** in `globals.css`:
```css
/* Table row states */
tr[data-state="selected"] {
  background-color: oklch(0.94 0.03 170); /* primary-light */
}

tr:hover:not([data-state="selected"]) {
  background-color: oklch(0.97 0.01 0); /* muted */
}
```

**Update Table Component Usage**:
```tsx
<TableRow
  data-state={selectedItems.includes(item.id) ? "selected" : undefined}
>
  <TableCell>
    <Checkbox
      checked={selectedItems.includes(item.id)}
      onCheckedChange={() => toggleSelection(item.id)}
    />
  </TableCell>
  {/* ... */}
</TableRow>
```

**Files Modified**:
- `src/app/globals.css`
- `src/app/(dashboard)/rfps/[id]/matches/page.tsx`

**Verification**:
- [ ] Selected rows have teal background
- [ ] Hover state works on non-selected rows
- [ ] Visual hierarchy is clear

---

### Task 2.3: Configure Toast Position

**Update Sonner Configuration**:
`src/app/layout.tsx` (or wherever Toaster is placed)

```tsx
import { Toaster } from "sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster
          position="bottom-left"
          toastOptions={{
            duration: 5000,
            classNames: {
              success: "border-l-4 border-l-emerald-500",
              error: "border-l-4 border-l-red-500",
              warning: "border-l-4 border-l-amber-500",
              info: "border-l-4 border-l-blue-500",
            },
          }}
        />
      </body>
    </html>
  )
}
```

**Files Modified**:
- `src/app/layout.tsx`

**Verification**:
- [ ] Toasts appear bottom-left
- [ ] Color borders match semantic meaning
- [ ] Multiple toasts stack correctly

---

### Task 2.4: Create Empty State Component

**Create Component**:
`src/components/empty-state.tsx`

```tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
```

**Context-Specific Empty States**:

| Page | Icon | Title | Description | Action |
|------|------|-------|-------------|--------|
| RFPs | FileText | "Sem RFPs" | "Carregue o seu primeiro RFP para começar a encontrar correspondências." | "Carregar RFP" |
| Inventory | Package | "Inventário vazio" | "Importe os seus produtos para começar a usar a correspondência automática." | "Importar CSV" |
| Matches | Search | "Sem correspondências" | "Não foram encontradas correspondências para os critérios selecionados." | "Limpar filtros" |
| Users | Users | "Sem utilizadores" | "Ainda não existem utilizadores registados no sistema." | - |

**Files Created**:
- `src/components/empty-state.tsx`

**Verification**:
- [ ] Empty states render for all table scenarios
- [ ] Actions trigger correct behavior
- [ ] Portuguese text is correct

---

## Phase 3: Form Enhancements
*Duration: 2-3 days | Priority: 🟡 High*

### Task 3.1: Create Password Strength Component

**Create Component**:
`src/components/password-strength.tsx`

```tsx
"use client"

import { useMemo } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordStrengthProps {
  password: string
}

const requirements = [
  { label: "Pelo menos 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Uma letra minúscula", test: (p: string) => /[a-z]/.test(p) },
  { label: "Um número", test: (p: string) => /[0-9]/.test(p) },
  { label: "Um carácter especial", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const results = useMemo(
    () => requirements.map((req) => ({ ...req, met: req.test(password) })),
    [password]
  )

  const score = results.filter((r) => r.met).length
  const strengthLabel =
    score <= 1 ? "Fraca" : score <= 3 ? "Moderada" : score <= 4 ? "Forte" : "Muito forte"
  const strengthColor =
    score <= 1
      ? "bg-red-500"
      : score <= 3
      ? "bg-amber-500"
      : "bg-emerald-500"

  return (
    <div className="mt-2 space-y-3">
      {/* Strength meter */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= score ? strengthColor : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Força da palavra-passe: <span className="font-medium">{strengthLabel}</span>
        </p>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1">
        {results.map((req, i) => (
          <li
            key={i}
            className={cn(
              "flex items-center gap-2 text-sm",
              req.met ? "text-emerald-600" : "text-muted-foreground"
            )}
          >
            {req.met ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

**Usage in Registration Form**:
```tsx
import { PasswordStrength } from "@/components/password-strength"

// In form
<div className="space-y-2">
  <Label htmlFor="password">Palavra-passe</Label>
  <Input
    id="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  {password && <PasswordStrength password={password} />}
</div>
```

**Files Created/Modified**:
- `src/components/password-strength.tsx` (new)
- `src/app/(auth)/register/page.tsx` (modified)

**Verification**:
- [ ] Strength meter updates in real-time
- [ ] All requirements check correctly
- [ ] Portuguese labels are correct
- [ ] Colors are semantic (red/amber/green)

---

### Task 3.2: Enhance Form Field Component

**Create Enhanced FormField**:
`src/components/form-field.tsx`

```tsx
"use client"

import { forwardRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  required?: boolean
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, hint, error, required, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s/g, "-")

    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={inputId}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={cn(error && "border-destructive")}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"
```

**Files Created**:
- `src/components/form-field.tsx`

**Verification**:
- [ ] Label associations are correct
- [ ] Error state styling works
- [ ] ARIA attributes are set correctly

---

### Task 3.3: Create Step Indicator Component

**Create Component**:
`src/components/step-indicator.tsx`

```tsx
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  label: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepIndicator({
  steps,
  currentStep,
  className,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progresso" className={className}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <li
              key={step.label}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && "border-2 border-primary text-primary",
                    !isComplete && !isCurrent && "border-2 border-muted text-muted-foreground"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "mt-2 text-sm font-medium",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "mx-4 h-0.5 flex-1",
                    isComplete ? "bg-primary" : "bg-muted"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
```

**Usage Example**:
```tsx
<StepIndicator
  steps={[
    { label: "Carregar" },
    { label: "Processar" },
    { label: "Rever" },
    { label: "Exportar" },
  ]}
  currentStep={1}
/>
```

**Files Created**:
- `src/components/step-indicator.tsx`

**Verification**:
- [ ] Steps render correctly
- [ ] Current step is highlighted
- [ ] Completed steps show checkmark
- [ ] Connecting lines show progress

---

## Phase 4: Data Display & Feedback
*Duration: 2-3 days | Priority: 🟢 Medium*

### Task 4.1: Add Badge Color Variants

**Update Badge Component**:
`src/components/ui/badge.tsx`

```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        // Semantic variants
        success: "border-transparent bg-emerald-100 text-emerald-800",
        warning: "border-transparent bg-amber-100 text-amber-800",
        error: "border-transparent bg-red-100 text-red-800",
        info: "border-transparent bg-blue-100 text-blue-800",
        muted: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

**Usage**:
```tsx
<Badge variant="success">Aprovado</Badge>
<Badge variant="warning">Pendente</Badge>
<Badge variant="error">Rejeitado</Badge>
<Badge variant="info">Em processamento</Badge>
```

**Files Modified**:
- `src/components/ui/badge.tsx`

**Verification**:
- [ ] All variants render with correct colors
- [ ] Colors match Gusto semantic palette

---

### Task 4.2: Install and Configure Command Palette

**Install Command Component** (already done in Phase 1):
```bash
bunx shadcn@latest add command
```

**Create Global Search Component**:
`src/components/command-palette.tsx`

```tsx
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  Package,
  Settings,
  Users,
  Search,
  Home,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

const navigation = [
  { icon: Home, label: "Painel", href: "/" },
  { icon: FileText, label: "RFPs", href: "/rfps" },
  { icon: Package, label: "Inventário", href: "/inventory" },
  { icon: Users, label: "Utilizadores", href: "/admin/users" },
  { icon: Settings, label: "Definições", href: "/settings" },
]

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Pesquisar..." />
      <CommandList>
        <CommandEmpty>Sem resultados.</CommandEmpty>
        <CommandGroup heading="Navegação">
          {navigation.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ações rápidas">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/rfps?action=upload"))}
          >
            <FileText className="mr-2 h-4 w-4" />
            Carregar novo RFP
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/inventory?action=import"))}
          >
            <Package className="mr-2 h-4 w-4" />
            Importar inventário
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

**Add to Layout**:
```tsx
// In dashboard layout
<CommandPalette />
```

**Files Created/Modified**:
- `src/components/command-palette.tsx` (new)
- `src/app/(dashboard)/layout.tsx` (modified)

**Verification**:
- [ ] Cmd+K opens palette
- [ ] Navigation items work
- [ ] Search filters items
- [ ] Escape closes palette

---

### Task 4.3: Create Accordion for Settings/FAQ

**Already installed in Phase 1**

**Usage Example for Settings Page**:
```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

<Accordion type="single" collapsible>
  <AccordionItem value="notifications">
    <AccordionTrigger>Notificações</AccordionTrigger>
    <AccordionContent>
      {/* Notification settings */}
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="security">
    <AccordionTrigger>Segurança</AccordionTrigger>
    <AccordionContent>
      {/* Security settings */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## Phase 5: Design Token Refinements
*Duration: 1-2 days | Priority: 🟢 Medium*

### Task 5.1: Add Semantic Color Light Variants

**Update globals.css**:
```css
@layer base {
  :root {
    /* Existing colors... */

    /* Semantic light backgrounds */
    --color-success-light: oklch(0.95 0.04 145);
    --color-warning-light: oklch(0.97 0.03 85);
    --color-error-light: oklch(0.96 0.03 25);
    --color-info-light: oklch(0.95 0.03 250);

    /* Alias for consistency */
    --success: var(--color-success);
    --success-foreground: oklch(0.98 0.01 145);
    --warning: var(--color-warning);
    --warning-foreground: oklch(0.25 0.08 85);
    --info: var(--color-info);
    --info-foreground: oklch(0.98 0.01 250);
  }
}
```

**Files Modified**:
- `src/app/globals.css`

---

### Task 5.2: Standardize Spacing Tokens

**Add to globals.css**:
```css
@layer base {
  :root {
    /* Spacing tokens */
    --space-card: 1.5rem;        /* 24px - card padding */
    --space-section: 3rem;       /* 48px - section margins */
    --space-form-gap: 1.5rem;    /* 24px - form field spacing */
    --space-input-gap: 0.5rem;   /* 8px - label to input */
    --space-inline: 0.5rem;      /* 8px - inline elements */
    --space-stack: 1rem;         /* 16px - stacked elements */
  }
}
```

**Update Tailwind Config** (if not using CSS variables directly):
```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      spacing: {
        'card': 'var(--space-card)',
        'section': 'var(--space-section)',
        'form': 'var(--space-form-gap)',
      }
    }
  }
}
```

**Files Modified**:
- `src/app/globals.css`
- `tailwind.config.ts`

---

### Task 5.3: Typography Refinements

**Add to globals.css**:
```css
@layer base {
  :root {
    /* Line height tokens */
    --leading-tight: 1.25;
    --leading-snug: 1.375;
    --leading-normal: 1.5;
    --leading-relaxed: 1.625;
  }

  /* Heading styles */
  h1 {
    font-family: var(--font-display);
    font-weight: 600;
    line-height: var(--leading-tight);
  }

  h2, h3, h4, h5, h6 {
    font-family: var(--font-sans);
    font-weight: 600;
    line-height: var(--leading-snug);
  }

  /* Body text */
  p, li, td {
    line-height: var(--leading-normal);
  }
}
```

**Files Modified**:
- `src/app/globals.css`

---

## Verification Checklist

### Phase 1 Complete When:
- [ ] All 4 components installed (tabs, accordion, breadcrumb, command)
- [ ] Tabs working on RFP detail page
- [ ] Breadcrumbs showing on all nested pages
- [ ] Zero icon buttons without aria-labels
- [ ] All sortable columns have aria-sort

### Phase 2 Complete When:
- [ ] StatusDot component created and used
- [ ] Table selected rows have visual highlight
- [ ] Toasts appear bottom-left
- [ ] Empty states show for all tables

### Phase 3 Complete When:
- [ ] Password strength meter on registration
- [ ] FormField component with error states
- [ ] Step indicator component ready

### Phase 4 Complete When:
- [ ] Badge has all semantic variants
- [ ] Command palette opens with Cmd+K
- [ ] Accordion used in appropriate places

### Phase 5 Complete When:
- [ ] All color tokens documented
- [ ] Spacing is consistent across pages
- [ ] Typography line-heights standardized

---

## Files Summary

### New Files to Create
- `src/components/breadcrumb-nav.tsx`
- `src/components/ui/status-dot.tsx`
- `src/components/empty-state.tsx`
- `src/components/password-strength.tsx`
- `src/components/form-field.tsx`
- `src/components/step-indicator.tsx`
- `src/components/command-palette.tsx`

### Files to Modify
- `src/app/globals.css` (design tokens)
- `src/app/(dashboard)/layout.tsx` (breadcrumbs, command palette)
- `src/app/(dashboard)/rfps/[id]/page.tsx` (tabs)
- `src/app/(auth)/register/page.tsx` (password strength)
- `src/components/ui/badge.tsx` (variants)
- `tailwind.config.ts` (spacing tokens)
- Multiple pages for accessibility fixes

### shadcn Components to Install
```bash
bunx shadcn@latest add tabs accordion breadcrumb command
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Component style conflicts | Test each component in isolation before integration |
| Breaking existing layouts | Create feature branch, test all pages before merge |
| Accessibility regressions | Run automated a11y audit after each phase |
| Portuguese text issues | Review all user-facing strings before deployment |

---

*Implementation plan created from comprehensive analysis of 363 Gusto screenshots and Cardiva app audit.*
*Constraint: All components use shadcn/ui - no custom building.*

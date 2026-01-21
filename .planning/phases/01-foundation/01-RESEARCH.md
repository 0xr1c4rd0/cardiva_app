# Phase 1: Foundation - Research

**Researched:** 2026-01-21
**Domain:** Next.js 16, Tailwind CSS v4, shadcn/ui, Supabase SSR
**Confidence:** HIGH

## Summary

This research covers the technical requirements for Phase 1: Foundation, which establishes the project scaffold with a Gusto-inspired design system and Supabase integration. The stack combines Next.js 16 (App Router, Turbopack, React 19), Tailwind CSS v4 (CSS-first configuration with @theme directive), shadcn/ui (composable components with Radix primitives), and Supabase SSR (@supabase/ssr for server-side auth).

Key findings:
- Next.js 16 uses `--yes` flag for recommended defaults (TypeScript, Tailwind, App Router, Turbopack)
- Tailwind CSS v4 uses `@theme` directive in CSS instead of tailwind.config.js for custom tokens
- shadcn/ui requires CSS variables in OKLCH format with specific naming conventions
- Supabase SSR requires separate browser/server clients plus middleware for token refresh

**Primary recommendation:** Start with `npx create-next-app@latest cardiva-app --yes`, then configure Tailwind v4 @theme with the UI_DESIGN.md color palette, initialize shadcn/ui with the custom theme, and set up Supabase SSR with proper middleware.

## Standard Stack

The established libraries/tools for this phase:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.x | React framework with App Router | Current stable, Turbopack default, React 19 support |
| React | 19.x | UI library | Bundled with Next.js 16, includes React Compiler |
| TypeScript | 5.x | Type safety | Default with create-next-app |
| Tailwind CSS | 4.x | Utility-first CSS | CSS-first config, 5x faster builds |
| shadcn/ui | latest | Component library | Copy-paste ownership, Radix primitives |
| Lucide React | latest | Icons | shadcn/ui default icon set |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/supabase-js | 2.90+ | Supabase client | All database/auth operations |
| @supabase/ssr | 0.8+ | SSR support | Server components, middleware |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind CSS v4 | Tailwind CSS v3 | v3 uses JS config; v4 is CSS-first, faster |
| shadcn/ui | Chakra UI / MUI | Heavier, harder to customize for custom palette |
| Lucide | Heroicons | Both work; Lucide is shadcn default |

**Installation:**

```bash
# Create Next.js 16 app with recommended defaults
npx create-next-app@latest cardiva-app --yes

# Navigate to project
cd cardiva-app

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Initialize shadcn/ui (will prompt for options)
npx shadcn@latest init

# Add required shadcn components for foundation
npx shadcn@latest add sidebar button
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/                      # App Router pages
│   ├── (auth)/               # Auth route group (login, register)
│   ├── (dashboard)/          # Protected route group
│   │   ├── layout.tsx        # Dashboard layout with sidebar
│   │   ├── page.tsx          # Dashboard home
│   │   ├── rfps/             # RFP pages
│   │   ├── inventory/        # Inventory pages
│   │   └── history/          # History pages
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing/redirect
│   └── globals.css           # Global styles + @theme
├── components/
│   ├── ui/                   # shadcn/ui components (auto-generated)
│   ├── layout/               # Layout components (sidebar, header)
│   └── shared/               # Shared custom components
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   ├── server.ts         # Server client
│   │   └── proxy.ts          # Middleware utilities
│   └── utils.ts              # General utilities
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript types
└── middleware.ts             # Auth token refresh
```

### Pattern 1: Tailwind v4 @theme Configuration

**What:** Define design tokens using CSS @theme directive
**When to use:** All custom colors, spacing, typography
**Example:**

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Primary Colors - from UI_DESIGN.md */
  --color-primary: oklch(0.45 0.12 170);          /* #0A6B5D teal */
  --color-primary-hover: oklch(0.38 0.10 170);    /* #085A4E darker */
  --color-primary-light: oklch(0.94 0.03 170);    /* #E8F4F2 */

  /* Accent Colors */
  --color-coral: oklch(0.65 0.18 25);             /* #F45D48 */
  --color-coral-light: oklch(0.97 0.02 25);       /* #FEF2F0 */
  --color-yellow: oklch(0.75 0.14 75);            /* #F5A623 */
  --color-green: oklch(0.58 0.12 175);            /* #0D9488 */

  /* Neutral Colors */
  --color-gray-50: oklch(0.98 0 0);               /* #F9FAFB */
  --color-gray-100: oklch(0.96 0 0);              /* #F3F4F6 */
  --color-gray-200: oklch(0.92 0 0);              /* #E5E7EB */
  --color-gray-400: oklch(0.70 0 0);              /* #9CA3AF */
  --color-gray-600: oklch(0.45 0 0);              /* #4B5563 */
  --color-gray-900: oklch(0.20 0 0);              /* #111827 */

  /* Spacing - 4px base unit from UI_DESIGN.md */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  /* Sidebar width */
  --sidebar-width: 240px;
  --sidebar-width-mobile: 240px;
}
```

### Pattern 2: shadcn/ui CSS Variables Setup

**What:** Configure shadcn/ui to use custom theme colors
**When to use:** After @theme setup, for component styling
**Example:**

```css
/* Additional shadcn/ui variable mapping in globals.css */
:root {
  /* Map to shadcn/ui expected variables */
  --background: oklch(1 0 0);                     /* white */
  --foreground: oklch(0.20 0 0);                  /* gray-900 */

  --primary: oklch(0.45 0.12 170);                /* teal */
  --primary-foreground: oklch(1 0 0);             /* white */

  --secondary: oklch(0.96 0 0);                   /* gray-100 */
  --secondary-foreground: oklch(0.20 0 0);        /* gray-900 */

  --accent: oklch(0.94 0.03 170);                 /* primary-light */
  --accent-foreground: oklch(0.20 0 0);

  --destructive: oklch(0.65 0.18 25);             /* coral */
  --destructive-foreground: oklch(1 0 0);

  --muted: oklch(0.96 0 0);                       /* gray-100 */
  --muted-foreground: oklch(0.45 0 0);            /* gray-600 */

  --border: oklch(0.92 0 0);                      /* gray-200 */
  --input: oklch(0.92 0 0);
  --ring: oklch(0.45 0.12 170);                   /* primary */

  /* Sidebar specific */
  --sidebar-background: oklch(0.20 0 0);          /* gray-900 dark sidebar */
  --sidebar-foreground: oklch(0.96 0 0);
  --sidebar-primary: oklch(0.45 0.12 170);
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.30 0 0);
  --sidebar-accent-foreground: oklch(0.96 0 0);
  --sidebar-border: oklch(0.30 0 0);
}

/* Register with Tailwind v4 */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}
```

### Pattern 3: Supabase SSR Client Setup

**What:** Configure separate browser and server Supabase clients
**When to use:** Foundation setup, before any auth/data operations
**Example:**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component - ignore
          }
        },
      },
    }
  )
}
```

```typescript
// src/middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh auth token
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Pattern 4: Sidebar Layout with SidebarProvider

**What:** Set up dashboard layout with collapsible sidebar
**When to use:** For the main application shell
**Example:**

```typescript
// src/app/(dashboard)/layout.tsx
import { cookies } from 'next/headers'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          {/* Header content */}
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-[1200px]">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

```typescript
// src/components/layout/app-sidebar.tsx
import { Home, FileText, Package, History, Settings } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import Link from 'next/link'

const navItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  { title: 'RFPs', url: '/rfps', icon: FileText },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'History', url: '/history', icon: History },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <span className="text-xl font-semibold">Cardiva</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenuButton asChild>
          <Link href="/settings">
            <Settings />
            <span>Settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
```

### Anti-Patterns to Avoid

- **Mixing Tailwind v3 and v4 config approaches:** Don't create tailwind.config.js for colors - use @theme directive in CSS
- **Using HSL instead of OKLCH for shadcn/ui:** Current shadcn/ui uses OKLCH format; convert hex colors appropriately
- **Putting Supabase service_role key in client code:** Never expose service_role; use anon key on frontend
- **Skipping middleware for auth:** Without middleware, auth tokens won't refresh and SSR won't work properly
- **Using getSession() instead of getUser() on server:** getSession() doesn't validate the token; always use getUser()

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sidebar navigation | Custom sidebar CSS | shadcn/ui Sidebar | Handles collapse, mobile, persistence, accessibility |
| Color palette utilities | Manual CSS classes | Tailwind @theme | Auto-generates all utility classes from tokens |
| Cookie-based auth | Custom cookie handling | @supabase/ssr | Handles complex cookie scenarios, refresh tokens |
| Icon system | Icon sprite sheets | lucide-react | Tree-shakeable, consistent sizing, shadcn integration |
| CSS variable theming | Multiple stylesheets | shadcn/ui theming | Built-in dark mode, consistent naming |

**Key insight:** shadcn/ui's sidebar component is one of the most complex components to build correctly - it handles collapsible state, mobile responsiveness, cookie persistence, keyboard shortcuts, and accessibility. Use the official component.

## Common Pitfalls

### Pitfall 1: Tailwind v4 @theme vs v3 Config

**What goes wrong:** Developers try to use tailwind.config.js to define custom colors, which is the v3 approach. In v4, custom theme values should go in CSS using @theme directive.

**Why it happens:** Most tutorials and existing knowledge are for Tailwind v3.

**How to avoid:**
- Delete tailwind.config.js (or keep minimal if needed for plugins)
- Define all custom colors, spacing, etc. in globals.css using `@theme { }`
- The @theme directive automatically generates utility classes

**Warning signs:** "Unknown utility class" errors for custom colors, colors not appearing in IDE autocomplete.

### Pitfall 2: OKLCH Color Conversion

**What goes wrong:** shadcn/ui v4+ uses OKLCH color format, but UI_DESIGN.md provides hex colors. Incorrect conversion results in wrong colors.

**Why it happens:** OKLCH is a perceptually uniform color space; hex-to-OKLCH conversion isn't straightforward.

**How to avoid:**
- Use a color converter tool (oklch.com or similar)
- Test colors visually after conversion
- Keep hex comments next to OKLCH values for reference

**Warning signs:** Colors look "off" compared to design mockups, especially at different lightness levels.

### Pitfall 3: Supabase Client Singleton Pattern

**What goes wrong:** Creating multiple Supabase clients per request causes memory leaks and inconsistent auth state.

**Why it happens:** Each call to createBrowserClient in different components creates a new instance if not careful.

**How to avoid:**
- Browser client is automatically a singleton - just call createClient() wherever needed
- Server client must be created per request (async function)
- Don't cache server client across requests

**Warning signs:** Auth state not syncing between components, "already connected" warnings.

### Pitfall 4: Sidebar State Not Persisting

**What goes wrong:** Sidebar collapses on every page navigation, not remembering user preference.

**Why it happens:** Not reading cookie in server layout, or cookie name mismatch.

**How to avoid:**
- Use async layout component with `cookies()` from next/headers
- Read `sidebar_state` cookie and pass to `defaultOpen` prop
- Ensure cookie name matches what SidebarProvider writes

**Warning signs:** Sidebar always opens/closes on navigation, layout shift on page load.

### Pitfall 5: Middleware Not Processing All Routes

**What goes wrong:** Auth works on some pages but not others. Token refresh happens inconsistently.

**Why it happens:** Middleware matcher config excludes routes incorrectly.

**How to avoid:**
- Use the recommended matcher pattern that excludes only static assets
- Test middleware runs on all dynamic routes
- Log middleware execution during development

**Warning signs:** getUser() returns null intermittently, auth tokens expiring.

## Code Examples

Verified patterns from official sources:

### Next.js 16 App Creation

```bash
# Source: https://nextjs.org/docs/app/getting-started/installation
npx create-next-app@latest cardiva-app --yes

# This enables by default:
# - TypeScript
# - Tailwind CSS v4
# - ESLint
# - App Router
# - Turbopack (dev server)
# - Import alias @/*
```

### shadcn/ui Initialization

```bash
# Source: https://ui.shadcn.com/docs/installation/next
npx shadcn@latest init

# When prompted:
# - Style: New York (uses Lucide icons by default)
# - Base color: Slate (we'll customize)
# - CSS variables: Yes

# Add sidebar component
npx shadcn@latest add sidebar button
```

### Environment Variables Setup

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Note: NEVER commit this file
# Note: service_role key goes only in server-side env (not NEXT_PUBLIC_)
```

### Verifying Supabase Connection

```typescript
// Quick test in a server component or route handler
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Test connection - this should not error
  const { data, error } = await supabase.from('_test_connection').select('*').limit(0)

  if (error && !error.message.includes('does not exist')) {
    return Response.json({ status: 'error', message: error.message })
  }

  return Response.json({ status: 'connected' })
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js colors | @theme in CSS | Tailwind v4 (Jan 2025) | All custom tokens in CSS, not JS |
| @supabase/auth-helpers-nextjs | @supabase/ssr | Late 2024 | Simpler API, better SSR support |
| HSL colors in shadcn/ui | OKLCH colors | shadcn/ui 2024-2025 | Better perceptual uniformity |
| Pages Router | App Router | Next.js 13+ (stable in 14+) | Server Components, layouts, streaming |
| next.config.js experimental | next.config.ts stable | Next.js 16 | TypeScript config default |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: Replaced by @supabase/ssr, no longer maintained
- `tailwind.config.js` for colors: Still works but @theme is preferred in v4
- `getSession()` on server: Use `getUser()` which validates the token

## Open Questions

Things that couldn't be fully resolved:

1. **OKLCH exact values for UI_DESIGN.md colors**
   - What we know: Hex colors are specified in UI_DESIGN.md
   - What's unclear: Exact OKLCH equivalents (need conversion tool)
   - Recommendation: Convert using oklch.com, visually verify in browser

2. **shadcn/ui Sidebar dark/light theme**
   - What we know: UI_DESIGN.md shows dark sidebar option
   - What's unclear: Whether to use CSS variables or Tailwind classes for sidebar theme
   - Recommendation: Use sidebar-specific CSS variables (--sidebar-background etc.)

## Sources

### Primary (HIGH confidence)

- [Next.js 16 Installation](https://nextjs.org/docs/app/getting-started/installation) - create-next-app command, defaults
- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16) - New features, Turbopack default
- [Tailwind CSS v4 Theme](https://tailwindcss.com/docs/theme) - @theme directive syntax
- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation/next) - Init command, component addition
- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar) - Component structure, SidebarProvider
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming) - CSS variables format, OKLCH colors
- [Supabase SSR Next.js Setup](https://supabase.com/docs/guides/auth/server-side/nextjs) - Client utilities, middleware
- [Supabase Creating SSR Client](https://supabase.com/docs/guides/auth/server-side/creating-a-client) - Browser/server client patterns

### Secondary (MEDIUM confidence)

- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - Folder conventions
- [Tailwind CSS v4 Blog](https://tailwindcss.com/blog/tailwindcss-v4) - Release notes, migration

### Tertiary (LOW confidence)

- Community tutorials on sidebar setup - Patterns vary, official docs preferred

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All from official docs and npm registries
- Architecture: HIGH - Based on official Next.js and shadcn/ui patterns
- Pitfalls: HIGH - From PITFALLS.md research + official troubleshooting docs

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable stack, no major releases expected)

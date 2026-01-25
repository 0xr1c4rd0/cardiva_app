# Technology Stack

**Analysis Date:** 2026-01-25

## Languages

**Primary:**
- TypeScript 5.x - All application code (components, server actions, utilities)
- JavaScript (ES2017+) - Build configuration and scripts

**Secondary:**
- CSS (Tailwind CSS 4) - Styling with custom design tokens

## Runtime

**Environment:**
- Node.js 23.6.1

**Package Manager:**
- npm
- Lockfile: package-lock.json present

## Frameworks

**Core:**
- Next.js 16.1.4 - App Router with React Server Components
- React 19.2.3 - UI framework
- React DOM 19.2.3 - DOM rendering

**Testing:**
- Playwright 1.57.0 - E2E testing framework
- Configured for Chromium with HTML reporter

**Build/Dev:**
- TypeScript Compiler - Type checking and transpilation
- PostCSS - CSS processing with Tailwind plugin
- Next.js Built-in bundler - Production builds

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.91.0 - Supabase client SDK for auth, database, storage, realtime
- `@supabase/ssr` 0.8.0 - Server-side rendering integration for Supabase
- `next` 16.1.4 - Application framework with App Router

**Infrastructure:**
- `@tanstack/react-query` 5.90.19 - Server state management
- `zustand` 5.0.10 - Client state management
- `nuqs` 2.8.6 - URL state management with type-safety

**UI Components:**
- `@radix-ui/*` (multiple packages) - Headless UI primitives (dialog, dropdown, select, etc.)
- `lucide-react` 0.562.0 - Icon library
- `framer-motion` 12.29.0 - Animation library
- `sonner` 2.0.7 - Toast notifications
- `tailwindcss` 4.x - Utility-first CSS framework
- `class-variance-authority` 0.7.1 - Component variant management
- `tailwind-merge` 3.4.0 - Tailwind class merging utility

**Data Processing:**
- `papaparse` 5.5.3 - CSV parsing and generation
- `xlsx` 0.18.5 - Excel file generation
- `zod` 4.3.5 - Schema validation
- `date-fns` 4.1.0 - Date formatting and manipulation

**File Handling:**
- `react-dropzone` 14.3.8 - File upload drag-and-drop
- `file-saver` 2.0.5 - Client-side file downloads

**Developer Experience:**
- `use-debounce` 10.1.0 - Debounce hooks for search/input
- `@tanstack/react-table` 8.21.3 - Table state management

## Configuration

**Environment:**
- `.env.local` for local development
- `.env.local.example` template provided
- Required variables:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - `N8N_RFP_WEBHOOK_URL` - RFP processing webhook endpoint
  - `N8N_INVENTORY_WEBHOOK_URL` - Inventory update webhook endpoint
  - `N8N_EXPORT_EMAIL_WEBHOOK_URL` - Export email webhook endpoint
  - `N8N_WEBHOOK_SECRET` - Optional shared secret for webhook authentication

**Build:**
- `next.config.ts` - Next.js configuration with 10MB server action body limit
- `tsconfig.json` - TypeScript compiler options with strict mode enabled
- `playwright.config.ts` - E2E test configuration
- `postcss.config.mjs` - PostCSS with Tailwind CSS 4 plugin
- `components.json` - shadcn/ui configuration (New York style, Lucide icons)

## Platform Requirements

**Development:**
- Node.js 20+ recommended (running on 23.6.1)
- npm package manager
- Local Supabase project or hosted instance
- n8n instance for workflow processing

**Production:**
- Vercel (Next.js native deployment platform)
- Supabase hosted instance (Auth, Postgres, Storage, Realtime)
- n8n cloud or self-hosted instance

---

*Stack analysis: 2026-01-25*

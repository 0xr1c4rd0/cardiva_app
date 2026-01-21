# Stack Research

**Project:** Cardiva App - Pharmaceutical RFP Matching SaaS
**Researched:** 2026-01-21
**Overall Confidence:** HIGH

## Executive Summary

This stack is optimized for a SaaS web application with Supabase backend, n8n webhook integration, and async processing requirements. The recommendations prioritize:
1. **Developer velocity** - Proven patterns with excellent DX
2. **Real-time capability** - Native Supabase realtime support
3. **Async task handling** - Robust patterns for 3-5 min background jobs
4. **Enterprise aesthetics** - Professional UI components for pharmaceutical domain

---

## Recommended Stack

### Frontend Framework

**Next.js 16** (latest stable)
- **Rationale:** Next.js 16 is the current production-ready version as of January 2026. It includes stable Turbopack (5x faster builds), complete React 19 support with React Compiler, and explicit caching APIs. Build times dropped from 56s to 14s in real-world tests. The App Router with React Server Components reduces JS bundle size, critical for enterprise dashboards. Next.js 16 requires Node.js 20.9+.
- **Confidence:** HIGH
- **Sources:** [Next.js Blog](https://nextjs.org/blog/next-16), [Upgrading Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)

**Why not Next.js 15:** Version 16 removed temporary synchronous API compatibility - staying on 15 means tech debt. Performance gains (2-5x faster builds) justify immediate adoption.

### UI Library

**shadcn/ui** + **Tailwind CSS v4**
- **Rationale:** shadcn/ui provides copy-paste ownership of components built on Radix UI primitives, styled with Tailwind. Unlike package-based libraries, you own the code and can customize freely. Tailwind CSS v4 (released Jan 2025) offers 5x faster full builds and 100x faster incremental builds with CSS-first configuration. The combination is ideal for enterprise SaaS dashboards with professional, customizable aesthetics.
- **Confidence:** HIGH
- **Key consideration:** Radix UI (shadcn's foundation) announced reduced maintenance - monitor for updates, but shadcn's copy-paste model mitigates dependency risk.
- **Sources:** [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog), [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4), [WorkOS Comparison](https://workos.com/blog/what-is-the-difference-between-radix-and-shadcn-ui)

**Pharmaceutical palette implementation:**
```css
/* In your global CSS with Tailwind v4 @theme */
@theme {
  --color-primary: #1e3a5f;    /* Deep pharma blue */
  --color-secondary: #2d5a3d;  /* Medical green */
  --color-accent: #4a90a4;     /* Teal accent */
  --color-background: #f8fafc; /* Clean white */
  --color-muted: #64748b;      /* Professional gray */
}
```

### State Management

**Zustand v5** (v5.0.10)
- **Rationale:** Zustand is the 2025 default for SaaS dashboards. ~3KB bundle size, no boilerplate, hook-based API. Perfect for medium-large apps without Redux complexity. Works seamlessly with Next.js SSR via `unstable_ssrSafe` middleware. For 90% of SaaS platforms, MVPs, and enterprise dashboards, Zustand is the right choice.
- **Confidence:** HIGH
- **Sources:** [Zustand npm](https://www.npmjs.com/package/zustand), [State Management 2025](https://makersden.io/blog/react-state-management-in-2025)

**Why not Jotai:** Jotai excels at fine-grained atomic state but adds complexity for dashboard patterns. Zustand's centralized store is simpler for team onboarding.

**Why not Redux Toolkit:** Overkill for this project. RTK's boilerplate adds friction without proportional benefit.

### Server State / Data Fetching

**TanStack Query v5** (v5.90.19) + **@supabase-cache-helpers/postgrest-react-query** (v1.13.6)
- **Rationale:** TanStack Query is the industry standard for server-state management with caching, optimistic updates, and background refetching. The supabase-cache-helpers library bridges TanStack Query with Supabase, providing automatic cache invalidation for PostgREST queries and realtime subscription integration. DevTools included for debugging.
- **Confidence:** HIGH
- **Sources:** [TanStack Query npm](https://www.npmjs.com/package/@tanstack/react-query), [Supabase Cache Helpers](https://supabase-cache-helpers.vercel.app/), [Supabase Blog](https://supabase.com/blog/react-query-nextjs-app-router-cache-helpers)

**Why not SWR:** TanStack Query has larger ecosystem, DevTools, and better TypeScript inference. The supabase-cache-helpers are more mature for TanStack Query.

### Supabase Client

**@supabase/supabase-js** (v2.90.1) + **@supabase/ssr** (v0.8.0)
- **Rationale:** Official Supabase clients. `supabase-js` is the core client for database, auth, storage, and realtime. `@supabase/ssr` is the official package for server-side rendering in Next.js (replaces deprecated auth-helpers). Both are actively maintained with unified versioning in the new monorepo.
- **Confidence:** HIGH
- **Note:** Requires Node.js 20+ (Node 18 support dropped in v2.79.0)
- **Sources:** [Supabase JS npm](https://www.npmjs.com/package/@supabase/supabase-js), [Supabase SSR npm](https://www.npmjs.com/package/@supabase/ssr)

### Async/Background Processing

**Pattern: Supabase Database Webhooks + Realtime Subscriptions**
- **Rationale:** For 3-5 minute n8n processing tasks, use a polling/subscription hybrid:
  1. User uploads PDF -> Creates `processing_jobs` row with status `pending`
  2. Supabase Database Webhook triggers n8n workflow
  3. n8n processes (3-5 min), updates row status to `processing` -> `completed`
  4. Frontend subscribes to Supabase Realtime on the job row
  5. UI updates instantly when status changes

- **Why this pattern:**
  - Database Webhooks use pg_net extension (async, non-blocking)
  - Realtime subscriptions provide instant UI updates without polling
  - Job status stored in DB provides audit trail and recovery
  - n8n can update progress percentage for progress bars

- **Confidence:** HIGH
- **Sources:** [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks), [Supabase Realtime](https://supabase.com/docs/guides/realtime)

**Job status table schema:**
```sql
create table processing_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  file_path text not null,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  progress int default 0 check (progress between 0 and 100),
  result jsonb,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable realtime
alter publication supabase_realtime add table processing_jobs;
```

### Forms & Validation

**React Hook Form** (v7.61.1) + **Zod** (v3.x) + **@hookform/resolvers** (v5.2.0)
- **Rationale:** Industry standard form library with minimal re-renders. Zod provides TypeScript-first schema validation with excellent inference. The combination is lightweight, fast, and recommended by shadcn/ui.
- **Confidence:** HIGH
- **Note:** Use Zod v3.x for now - v4 has edge case issues with React Hook Form
- **Sources:** [React Hook Form](https://react-hook-form.com/), [hookform/resolvers](https://github.com/react-hook-form/resolvers)

### File Upload

**react-dropzone** (v14.3.8)
- **Rationale:** Simple, lightweight hook for drag-and-drop file uploads. Supports file type restrictions (PDF only for RFPs), multiple files, and size limits. Not a full uploader - pair with Supabase Storage for actual uploads.
- **Confidence:** HIGH
- **Alternative:** FilePond for more features (previews, progress), but heavier
- **Sources:** [react-dropzone npm](https://www.npmjs.com/package/react-dropzone), [react-dropzone docs](https://react-dropzone.js.org/)

**Upload pattern:**
```typescript
const { getRootProps, getInputProps } = useDropzone({
  accept: { 'application/pdf': ['.pdf'] },
  maxSize: 10 * 1024 * 1024, // 10MB
  onDrop: async (files) => {
    const file = files[0];
    const { data, error } = await supabase.storage
      .from('rfp-uploads')
      .upload(`${userId}/${Date.now()}-${file.name}`, file);
  }
});
```

### Export (Excel)

**ExcelJS** (v4.4.0)
- **Rationale:** More sophisticated than SheetJS for enterprise exports - supports styling, formulas, data validation, and custom formatting. Critical for pharmaceutical reporting where presentation matters. Bundle is larger but worth it for professional output.
- **Confidence:** MEDIUM (package inactive for 2 years but stable)
- **Alternative:** SheetJS (xlsx) is more popular but has had security vulnerabilities and less formatting control
- **Sources:** [ExcelJS npm](https://www.npmjs.com/package/exceljs), [npm-compare](https://npm-compare.com/excel4node,exceljs,xlsx,xlsx-populate)

**Why not SheetJS:** Security vulnerabilities in older versions, 400KB+ bundle, less styling control for pharmaceutical-grade reports.

### Additional Supporting Libraries

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| **date-fns** | latest | Date formatting/manipulation | HIGH |
| **lucide-react** | latest | Icons (shadcn default) | HIGH |
| **sonner** | latest | Toast notifications (shadcn) | HIGH |
| **nuqs** | latest | URL state management for filters | MEDIUM |
| **@tanstack/react-table** | v8 | Data tables for match results | HIGH |

---

## Avoid

| Technology | Why Avoid |
|------------|-----------|
| **Redux / RTK** | Overkill for this project. Zustand provides same benefits with 90% less boilerplate |
| **SWR** | TanStack Query has better Supabase integration via cache-helpers |
| **Chakra UI / MUI** | Heavier than shadcn/ui, harder to customize for pharma aesthetic |
| **Prisma** | Unnecessary - Supabase provides database client directly |
| **tRPC** | Adds complexity when Supabase already provides type-safe client |
| **Firebase** | Project explicitly requires Supabase |
| **Zod v4** | Edge cases with React Hook Form - use v3.x |
| **Node.js 18** | EOL April 2025, Supabase dropped support |
| **Next.js 14/15** | Version 16 is stable, 15's sync APIs removed in 16 |

---

## Installation

```bash
# Core framework
npx create-next-app@latest cardiva-app --typescript --tailwind --app --src-dir

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Data fetching
npm install @tanstack/react-query @supabase-cache-helpers/postgrest-react-query

# State management
npm install zustand

# Forms
npm install react-hook-form zod @hookform/resolvers

# UI (shadcn/ui is added via CLI)
npx shadcn@latest init
npx shadcn@latest add button card dialog form input label table toast

# File handling
npm install react-dropzone

# Export
npm install exceljs

# Utilities
npm install date-fns lucide-react sonner nuqs @tanstack/react-table
```

---

## Stack Summary

This stack combines **Next.js 16** (React 19, Turbopack, App Router) with **shadcn/ui + Tailwind CSS v4** for a professional pharmaceutical aesthetic. **Supabase** handles authentication, PostgreSQL database, file storage, and real-time subscriptions for live job status updates. **TanStack Query v5** with **supabase-cache-helpers** provides intelligent caching and server-state management. **Zustand** handles client-side global state. Async n8n processing is managed through **Supabase Database Webhooks** triggering workflows and **Realtime subscriptions** updating the UI when 3-5 minute jobs complete. Forms use **React Hook Form + Zod**, file uploads use **react-dropzone + Supabase Storage**, and Excel exports use **ExcelJS** for professional formatting. This is a modern, production-tested stack optimized for enterprise SaaS with real-time features.

---

## Version Summary Table

| Package | Version | Last Updated |
|---------|---------|--------------|
| Next.js | 16.x | Jan 2026 |
| React | 19.x | 2025 |
| Tailwind CSS | 4.x | Jan 2025 |
| @supabase/supabase-js | 2.90.1 | Jan 2026 |
| @supabase/ssr | 0.8.0 | Nov 2024 |
| @tanstack/react-query | 5.90.19 | Jan 2026 |
| Zustand | 5.0.10 | Jan 2026 |
| React Hook Form | 7.61.1 | 2025 |
| Zod | 3.x | stable |
| react-dropzone | 14.3.8 | 2024 |
| ExcelJS | 4.4.0 | 2023 (stable) |
| shadcn/ui | latest | Jan 2026 |

---

## Sources

### Official Documentation
- [Next.js 16 Blog](https://nextjs.org/blog/next-16)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Docs](https://ui.shadcn.com/)

### Package Registries (verified versions)
- [npm: @supabase/supabase-js](https://www.npmjs.com/package/@supabase/supabase-js)
- [npm: @tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query)
- [npm: zustand](https://www.npmjs.com/package/zustand)

### Comparison Articles
- [Next.js 15 vs 16](https://peerlist.io/mrchamp/articles/nextjs-16-vs-nextjs-15)
- [State Management in 2025](https://makersden.io/blog/react-state-management-in-2025)
- [React Query vs SWR 2025](https://refine.dev/blog/react-query-vs-tanstack-query-vs-swr-2025/)
- [shadcn vs Radix](https://workos.com/blog/what-is-the-difference-between-radix-and-shadcn-ui)

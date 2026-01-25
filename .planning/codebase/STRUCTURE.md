# Codebase Structure

**Analysis Date:** 2026-01-25

## Directory Layout

```
cardiva_app/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── (auth)/            # Public authentication routes
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── api/               # API endpoints
│   │   ├── auth/              # Auth callback handlers
│   │   ├── pending-approval/  # Pending user approval page
│   │   ├── unauthorized/      # Unauthorized access page
│   │   ├── layout.tsx         # Root layout with fonts and providers
│   │   └── globals.css        # Global Tailwind styles
│   ├── components/            # Reusable React components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── layout/            # Layout components (sidebar, user menu)
│   │   ├── shared/            # Shared utility components
│   │   └── ui/                # shadcn/ui primitives
│   ├── contexts/              # React Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Library code and utilities
│   │   ├── auth/              # Authentication utilities
│   │   ├── csv/               # CSV parsing and validation
│   │   ├── export/            # Export functionality
│   │   ├── n8n/               # n8n webhook integrations
│   │   ├── supabase/          # Supabase client factories
│   │   └── utils.ts           # General utilities (cn, etc.)
│   └── types/                 # TypeScript type definitions
├── supabase/
│   └── migrations/            # Database migration SQL files
├── e2e/                       # Playwright E2E tests
├── public/                    # Static assets
├── .planning/                 # Project planning and documentation
├── docs/                      # Additional documentation
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── playwright.config.ts       # Playwright test configuration
└── next.config.ts             # Next.js configuration
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router file-based routing
- Contains: Pages, layouts, Server Actions, API routes
- Key files: `layout.tsx` (root), route groups `(auth)` and `(dashboard)`

**`src/app/(auth)/`:**
- Purpose: Public authentication pages without sidebar layout
- Contains: Login, register, reset-password, update-password pages
- Key files: `layout.tsx` (centered layout), `*/page.tsx`, `*/actions.ts`

**`src/app/(dashboard)/`:**
- Purpose: Protected application pages with sidebar and auth checks
- Contains: Dashboard home, RFPs, inventory, admin pages
- Key files: `layout.tsx` (auth guard + sidebar), `*/page.tsx`, `*/actions.ts`, `*/components/`

**`src/app/(dashboard)/rfps/`:**
- Purpose: RFP management and match review features
- Contains: RFP listing page, match review page, upload components
- Key files: `page.tsx`, `actions.ts`, `components/`, `[id]/matches/page.tsx`

**`src/app/(dashboard)/rfps/components/`:**
- Purpose: RFP-specific client components
- Contains: Upload cards, processing status, stats, page content
- Key files: `rfp-upload-card.tsx`, `rfp-processing-card.tsx`, `rfp-stats.tsx`, `match-review-content.tsx`

**`src/app/(dashboard)/inventory/`:**
- Purpose: Product inventory management
- Contains: Inventory listing, CSV upload/export, search/filter
- Key files: `page.tsx`, `actions.ts`, `components/`

**`src/app/(dashboard)/admin/`:**
- Purpose: Admin-only functionality (user approval)
- Contains: User management pages
- Key files: `users/page.tsx`, `users/actions.ts`

**`src/app/api/`:**
- Purpose: API route handlers
- Contains: Health check, debug endpoints
- Key files: `health/route.ts`, `debug/schema/route.ts`

**`src/components/ui/`:**
- Purpose: Reusable UI primitives from shadcn/ui
- Contains: Radix-based components with Tailwind styling
- Key files: `button.tsx`, `card.tsx`, `dialog.tsx`, `table.tsx`, `sidebar.tsx`

**`src/components/layout/`:**
- Purpose: Application layout components
- Contains: Sidebar, user menu, navigation
- Key files: `app-sidebar.tsx`, `user-menu.tsx`

**`src/components/dashboard/`:**
- Purpose: Dashboard-specific reusable components
- Contains: KPI cards, stats widgets
- Key files: `kpi-stats-card.tsx`

**`src/contexts/`:**
- Purpose: React Context providers for shared state
- Contains: Upload queue management, realtime subscriptions
- Key files: `rfp-upload-status-context.tsx`

**`src/hooks/`:**
- Purpose: Custom React hooks
- Contains: Reusable hook logic
- Key files: Currently minimal usage

**`src/lib/supabase/`:**
- Purpose: Supabase client initialization
- Contains: Server and client Supabase factories, type definitions
- Key files: `server.ts` (async, cookie-based), `client.ts` (browser singleton), `admin.ts` (service role)

**`src/lib/n8n/`:**
- Purpose: n8n webhook integration
- Contains: Webhook trigger functions
- Key files: `rfp-webhook.ts`, `webhook.ts`, `export-webhook.ts`

**`src/lib/csv/`:**
- Purpose: CSV file handling
- Contains: Parsing, validation, export utilities
- Key files: `parser.ts`, `validation.ts`, `export.ts`

**`src/lib/auth/`:**
- Purpose: Authentication utilities
- Contains: Validation, helper functions
- Key files: `validation.ts`, `utils.ts`

**`src/types/`:**
- Purpose: TypeScript type definitions
- Contains: Domain types, interfaces
- Key files: `rfp.ts` (RFPItem, MatchSuggestion, RFPItemWithMatches)

**`supabase/migrations/`:**
- Purpose: Database schema version control
- Contains: SQL migration files with timestamps
- Key files: `20260122_rfp_match_results.sql`, `20260121_profiles_and_auth_hook.sql`

**`e2e/`:**
- Purpose: Playwright end-to-end tests
- Contains: Test suites organized by phase
- Key files: `phase-01-foundation.spec.ts`, `phase-02-authentication.spec.ts`

**`.planning/`:**
- Purpose: Project planning documentation
- Contains: Phase plans, codebase analysis, research notes
- Key files: `phases/`, `codebase/`, `intel/`, `todos/`

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout with fonts and global providers
- `src/app/(dashboard)/layout.tsx`: Auth-gated dashboard layout with sidebar
- `src/app/(auth)/layout.tsx`: Public auth pages centered layout

**Configuration:**
- `next.config.ts`: Next.js configuration (10MB body size limit)
- `tsconfig.json`: TypeScript compiler options
- `tailwind.config.ts`: Tailwind CSS customization
- `playwright.config.ts`: E2E test configuration
- `package.json`: Dependencies and npm scripts

**Core Logic:**
- `src/lib/supabase/server.ts`: Server-side Supabase client factory
- `src/lib/supabase/client.ts`: Browser-side Supabase client factory
- `src/lib/n8n/rfp-webhook.ts`: Fire-and-forget RFP processing trigger
- `src/contexts/rfp-upload-status-context.tsx`: Upload queue and realtime subscriptions

**Testing:**
- `e2e/phase-01-foundation.spec.ts`: Foundation tests
- `e2e/phase-02-authentication.spec.ts`: Auth flow tests
- `e2e/phase-03-inventory.spec.ts`: Inventory tests
- `playwright.config.ts`: Test configuration with baseURL and retries

## Naming Conventions

**Files:**
- `page.tsx`: Next.js route page components
- `layout.tsx`: Next.js layout components
- `actions.ts`: Server Actions for mutations
- `route.ts`: API route handlers
- `*.spec.ts`: Playwright test files
- `kebab-case.tsx`: Component files
- `kebab-case.ts`: Utility/library files

**Directories:**
- `kebab-case`: Standard directory naming
- `(route-group)`: Next.js route groups (parentheses don't affect URL)
- `[param]`: Dynamic route segments

**Components:**
- PascalCase: Component names (MatchReviewContent, RFPUploadCard)
- camelCase: Variable and function names
- UPPERCASE: Constants and environment variables

**Database:**
- snake_case: Table names (rfp_upload_jobs, rfp_items)
- snake_case: Column names (file_name, created_at, similarity_score)
- uuid: Primary keys (gen_random_uuid())

## Where to Add New Code

**New Feature:**
- Primary code: `src/app/(dashboard)/{feature}/` (create new route group directory)
- Server Actions: `src/app/(dashboard)/{feature}/actions.ts`
- Components: `src/app/(dashboard)/{feature}/components/`
- Page: `src/app/(dashboard)/{feature}/page.tsx`
- Tests: `e2e/phase-{N}-{feature}.spec.ts`

**New Component/Module:**
- Reusable UI: `src/components/ui/` (shadcn primitives)
- Feature-specific: `src/app/(dashboard)/{feature}/components/`
- Layout components: `src/components/layout/`
- Dashboard widgets: `src/components/dashboard/`

**Utilities:**
- Shared helpers: `src/lib/utils.ts` (or create specific `src/lib/{domain}/` directory)
- Auth utilities: `src/lib/auth/`
- Data processing: `src/lib/csv/`, `src/lib/export/`
- External integrations: `src/lib/n8n/`

**Database Changes:**
- Migration file: `supabase/migrations/{YYYYMMDD}_{description}.sql`
- Types: `src/types/{domain}.ts`
- RLS policies: Include in migration SQL

**Testing:**
- E2E tests: `e2e/phase-{N}-{feature}.spec.ts`
- Test utilities: `e2e/utils/` (if needed)

## Special Directories

**`node_modules/`:**
- Purpose: npm package dependencies
- Generated: Yes (via npm install)
- Committed: No (.gitignore)

**`.next/`:**
- Purpose: Next.js build output and cache
- Generated: Yes (via next build/dev)
- Committed: No (.gitignore)

**`test-results/` and `playwright-report/`:**
- Purpose: Playwright test artifacts
- Generated: Yes (during test runs)
- Committed: No (.gitignore)

**`.planning/`:**
- Purpose: Project planning and documentation
- Generated: No (manually created)
- Committed: Yes (project documentation)

**`public/`:**
- Purpose: Static assets served from root
- Generated: No
- Committed: Yes (images, fonts, etc.)

**`.git/`:**
- Purpose: Git version control metadata
- Generated: Yes (via git init)
- Committed: No (Git internal)

---

*Structure analysis: 2026-01-25*

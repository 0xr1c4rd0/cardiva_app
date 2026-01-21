---
phase: 02-authentication
plan: 01
subsystem: auth
tags: [supabase, auth, zod, validation, registration, rbac, jwt]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js 16 scaffold, Supabase client, shadcn/ui components
provides:
  - User registration with email/password
  - Admin Supabase client for service_role operations
  - Auth form validation schemas (Zod)
  - Auto-ban new accounts pending approval
  - SQL migration for profiles table and Custom Access Token Hook
  - Auth route group layout
affects: [02-02-login, 02-03-approval, 03-inventory, 04-rfp-upload]

# Tech tracking
tech-stack:
  added: [zod@4.3.5]
  patterns:
    - "Supabase admin client pattern for service_role operations"
    - "Auth form validation with Zod schemas"
    - "useActionState for form submissions with server actions"
    - "Auto-ban on registration for approval workflow"
    - "Custom Access Token Hook for RBAC (role in JWT)"

key-files:
  created:
    - src/lib/supabase/admin.ts
    - src/lib/auth/validation.ts
    - src/app/(auth)/layout.tsx
    - src/app/(auth)/register/page.tsx
    - src/app/(auth)/register/actions.ts
    - supabase/migrations/20260121_profiles_and_auth_hook.sql
    - src/components/ui/card.tsx
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "useActionState for simpler form handling vs react-hook-form"
  - "876000h ban_duration as pending approval state (100 years)"
  - "Manual SQL execution via Dashboard (simpler than CLI migrations for v1)"
  - "Disable email confirmation for simpler approval flow"
  - "Custom Access Token Hook injects role into JWT for RBAC"

patterns-established:
  - "Admin client: createAdminClient() with service_role key for privileged ops"
  - "Validation: Zod schemas exported from src/lib/auth/validation.ts"
  - "Registration flow: signup action → auto-ban → redirect with message"
  - "Auth layout: centered, no sidebar for public pages"

# Metrics
duration: 8min
completed: 2026-01-21
---

# Phase 2 Plan 1: Authentication Infrastructure Summary

**User registration with auto-ban approval workflow, Zod validation schemas, admin client for service_role operations, and SQL migration for profiles table with Custom Access Token Hook**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-21T11:06:31Z
- **Completed:** 2026-01-21T11:14:35Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- User registration form with email/password validation
- New accounts created in disabled state (banned) pending admin approval
- Admin Supabase client for service_role operations (ban, profile management)
- Zod validation schemas for all auth forms
- SQL migration ready for profiles table, RLS policies, and Custom Access Token Hook

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies and create admin client** - `6aafd35` (chore)
2. **Task 2: Create auth route group layout and registration page** - `08fb623` (feat)
3. **Task 3: Create SQL migration file for profiles table and Auth Hook** - `3341054` (docs)

## Files Created/Modified

- `package.json` + `package-lock.json` - Added zod@4.3.5 for form validation
- `src/lib/supabase/admin.ts` - Admin client with service_role key for privileged operations
- `src/lib/auth/validation.ts` - Zod schemas for login, signup, reset password, update password
- `src/app/(auth)/layout.tsx` - Centered layout without sidebar for auth pages
- `src/app/(auth)/register/page.tsx` - Registration form with email, password, confirmPassword
- `src/app/(auth)/register/actions.ts` - Signup server action with auto-ban logic
- `src/components/ui/card.tsx` - shadcn card component for auth forms
- `supabase/migrations/20260121_profiles_and_auth_hook.sql` - SQL migration for profiles table, RLS policies, user creation trigger, Custom Access Token Hook

## Decisions Made

**useActionState over react-hook-form:** Chose native useActionState for simpler form handling without additional dependencies. Server actions with FormData provide good UX with progressive enhancement.

**876000h ban_duration as pending state:** Using Supabase's ban_duration field (100 years) as a "pending approval" state. Simpler than adding custom user metadata. Admin unbans to approve.

**Manual SQL execution via Dashboard:** For v1, manual SQL execution in Supabase Dashboard is simpler than setting up CLI migrations. SQL file provides reference and instructions.

**Disable email confirmation:** Disabled email confirmation for simpler approval flow. Admin approval is the gate, not email verification.

**Custom Access Token Hook for RBAC:** Inject user role from profiles table into JWT claims. Enables server-side and client-side role checks without extra database queries.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all tasks completed successfully with all verifications passing.

## User Setup Required

**External services require manual configuration.** User must:

1. **Set environment variable:**
   - `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
   - Source: Supabase Dashboard → Project Settings → API → service_role (secret)

2. **Run SQL migration:**
   - Copy `supabase/migrations/20260121_profiles_and_auth_hook.sql`
   - Execute in Supabase Dashboard → SQL Editor

3. **Enable Custom Access Token Hook:**
   - Dashboard → Authentication → Hooks
   - Select `custom_access_token_hook` → `public.custom_access_token_hook`
   - Click "Enable Hook"

4. **Disable email confirmation:**
   - Dashboard → Authentication → Providers → Email
   - Toggle OFF "Confirm email"
   - Click "Save"

**Verification:** After setup, user can navigate to `/register`, submit form, see success message, and verify user appears in auth.users table with banned status.

## Next Phase Readiness

**Ready for Phase 2 Plan 2 (Login flow):**
- Registration infrastructure complete
- Admin client available for approval operations
- Validation schemas ready for login form
- Auth layout established

**Blockers:**
- User must complete manual setup steps above before registration/login works
- SQL migration must be executed before profiles can be created
- Service role key required for auto-ban functionality

---
*Phase: 02-authentication*
*Completed: 2026-01-21*

---
phase: 02-authentication
plan: 03
subsystem: auth
tags: [supabase, jwt, rbac, password-reset, admin, shadcn]

# Dependency graph
requires:
  - phase: 02-01
    provides: Registration with auto-ban, profiles table with role field
  - phase: 02-02
    provides: Login flow with ban detection, auth middleware
provides:
  - Password reset via email with token verification
  - Auth utility functions for role checking (getUserRole, requireAdmin, isAdmin)
  - Admin user management interface for approval workflow
  - Email confirmation callback route
  - RBAC infrastructure for admin vs user permissions
affects: [03-rfp-upload, admin-features, role-based-features]

# Tech tracking
tech-stack:
  added: [badge component, table component]
  patterns:
    - "JWT role extraction from token claims"
    - "Server component async role checking"
    - "Admin route protection via layout"
    - "Client components for server action forms"
    - "Email-based password reset with redirectTo"

key-files:
  created:
    - src/lib/auth/utils.ts
    - src/app/auth/confirm/route.ts
    - src/app/unauthorized/page.tsx
    - src/app/(auth)/reset-password/page.tsx
    - src/app/(auth)/reset-password/actions.ts
    - src/app/(auth)/update-password/page.tsx
    - src/app/(auth)/update-password/actions.ts
    - src/app/(dashboard)/admin/layout.tsx
    - src/app/(dashboard)/admin/users/page.tsx
    - src/app/(dashboard)/admin/users/actions.ts
    - src/app/(dashboard)/admin/users/user-actions.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/table.tsx
  modified:
    - src/components/layout/app-sidebar.tsx

key-decisions:
  - "JWT role extraction: Parse token payload to get user_role claim"
  - "Email confirmation route: Use verifyOtp with redirectTo for password reset"
  - "Admin actions: Client components with useActionState wrap server actions"
  - "Sidebar async: Convert sidebar to async server component for role check"

patterns-established:
  - "Role checking pattern: isAdmin() for conditional UI, requireAdmin() for protection"
  - "Email flow pattern: resetPasswordForEmail → confirm route → updateUser"
  - "Admin UI pattern: Server component fetches data, client components handle actions"
  - "RBAC layout pattern: Admin routes protected by admin layout with requireAdmin()"

# Metrics
duration: 16min
completed: 2026-01-21
---

# Phase 2 Plan 3: Password Reset & Admin Management Summary

**Password reset via email with token verification, RBAC utilities for JWT role extraction, and admin interface for user approval workflow**

## Performance

- **Duration:** 16 min
- **Started:** 2026-01-21T16:00:00Z
- **Completed:** 2026-01-21T16:16:16Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments
- Users can reset forgotten passwords via email link
- Admin users can view pending and approved users
- Admin users can approve (unban) or reject (delete) pending registrations
- RBAC infrastructure enables role-based permissions and UI
- Admin section appears in sidebar only for admin users

## Task Commits

Each task was committed atomically:

1. **Task 1: Create auth utilities and email confirmation route** - `d874bd6` (feat)
2. **Task 2: Create password reset flow** - `6bb5fbe` (feat)
3. **Task 3: Create admin user management page** - `e0d637a` (feat)

## Files Created/Modified

- `src/lib/auth/utils.ts` - Role checking utilities (getUserRole, requireAdmin, isAdmin)
- `src/app/auth/confirm/route.ts` - Email confirmation callback handler
- `src/app/unauthorized/page.tsx` - Access denied page for non-admin users
- `src/app/(auth)/reset-password/page.tsx` - Password reset request form
- `src/app/(auth)/reset-password/actions.ts` - Password reset request action
- `src/app/(auth)/update-password/page.tsx` - New password form after email verification
- `src/app/(auth)/update-password/actions.ts` - Password update action
- `src/app/(dashboard)/admin/layout.tsx` - Admin route protection
- `src/app/(dashboard)/admin/users/page.tsx` - Admin user management page
- `src/app/(dashboard)/admin/users/actions.ts` - Approve/reject user actions
- `src/app/(dashboard)/admin/users/user-actions.tsx` - Client action button components
- `src/components/ui/badge.tsx` - Badge component from shadcn
- `src/components/ui/table.tsx` - Table component from shadcn
- `src/components/layout/app-sidebar.tsx` - Added admin section with conditional rendering

## Decisions Made

**1. JWT role extraction from token claims**
- Parse JWT access_token payload (base64 decode middle section)
- Extract user_role claim injected by Custom Access Token Hook
- Return null if not authenticated or parsing fails

**2. Email confirmation route pattern**
- Single route handles both recovery (password reset) and other OTP types
- Use verifyOtp with token_hash and type from query params
- Redirect to next URL after successful verification

**3. Admin action form handling**
- Create client components (ApproveButton, RejectButton) wrapping server actions
- Use useActionState for form state management and pending state
- Server actions called with userId parameter from props

**4. Sidebar role-based rendering**
- Convert sidebar to async server component
- Call isAdmin() to check current user role
- Conditionally render Admin section based on role

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod error.errors property name**
- **Found during:** Task 2 (Update password action TypeScript compilation)
- **Issue:** Zod validation error uses `issues` not `errors` property
- **Fix:** Changed `validated.error.errors` to `validated.error.issues` with type annotation
- **Files modified:** src/app/(auth)/update-password/actions.ts
- **Verification:** TypeScript compiles successfully
- **Committed in:** 6bb5fbe (Task 2 commit)

**2. [Rule 3 - Blocking] Created client components for admin actions**
- **Found during:** Task 3 (TypeScript compilation of admin page)
- **Issue:** Server actions returning values can't be used directly in form action with .bind()
- **Fix:** Created ApproveButton and RejectButton client components wrapping actions with useActionState
- **Files modified:** src/app/(dashboard)/admin/users/page.tsx, added user-actions.tsx
- **Verification:** TypeScript compiles, proper form action typing
- **Committed in:** e0d637a (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both necessary for TypeScript correctness and proper form handling. No scope creep.

## Issues Encountered

None - all tasks executed as planned with only minor TypeScript fixes.

## User Setup Required

**External services require manual configuration.** Users must complete these steps:

### Supabase Dashboard Configuration

1. **Update password reset email template**
   - Go to: Supabase Dashboard → Authentication → Email Templates → Reset Password
   - Replace `{{ .ConfirmationURL }}` with:
     ```
     {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/update-password
     ```
   - This ensures password reset links redirect through our confirmation handler

### Environment Variables

1. **Add NEXT_PUBLIC_SITE_URL to .env.local**
   - Development: `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
   - Production: `NEXT_PUBLIC_SITE_URL=https://yourapp.com`
   - Required for password reset email redirectTo URL

### Verification

- Navigate to `/reset-password` and submit email
- Check email inbox for reset link
- Click link and verify redirect to `/update-password`
- Enter new password and verify login works

## Next Phase Readiness

**Ready for Phase 3 (RFP Upload):**
- Authentication complete with login, registration, password reset
- Admin approval workflow fully functional
- RBAC infrastructure ready for role-based features
- User management interface operational

**Blockers/Concerns:**
- User must configure Supabase email template before password reset works
- User must set NEXT_PUBLIC_SITE_URL environment variable
- Admin users must be created manually (update role in profiles table)

**Phase 2 Complete:** Authentication system fully implemented with all required AUTH requirements (AUTH-01 through AUTH-09) satisfied.

---
*Phase: 02-authentication*
*Completed: 2026-01-21*

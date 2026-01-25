---
phase: 09-export-email-admin
plan: 06
subsystem: admin-management
tags: [admin, users, roles, permissions, supabase]
completed: 2026-01-25
duration: 6min

requires:
  - 02-authentication (user management foundation)

provides:
  - Role management for approved users
  - User deletion with confirmation
  - Self-protection for current user

affects:
  - Admin workflow improvements
  - User permission management

tech-stack:
  added: []
  patterns:
    - Select dropdown for role changes
    - AlertDialog for destructive actions
    - Server actions with self-protection

key-files:
  created: []
  modified:
    - src/app/(dashboard)/admin/users/actions.ts
    - src/app/(dashboard)/admin/users/user-actions.tsx
    - src/app/(dashboard)/admin/users/page.tsx

decisions:
  - pattern: Self-protection in server actions
    reason: Prevent admins from accidentally modifying/deleting their own account
  - pattern: AlertDialog for delete confirmation
    reason: Destructive action requires explicit user confirmation
  - pattern: Current user marked with (voce)
    reason: Clear visual indication of own account in user list

metrics:
  tasks: 3/3
  commits: 3
  files-modified: 3
---

# Phase 09 Plan 06: Admin Role Management & User Deletion Summary

Enhanced admin users page with role management and user deletion capabilities.

## One-liner

Admin users page now has interactive role dropdown and delete button with confirmation dialog and self-protection.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 69d091a | feat | Add updateUserRole and deleteUser server actions |
| 47a96ad | feat | Add RoleDropdown and DeleteUserButton components |
| dc41ae4 | feat | Integrate role and delete controls in admin users page |

## What Was Built

### Server Actions (actions.ts)

1. **updateUserRole**: Changes user role in profiles table
   - Accepts userId and role ('user' | 'admin')
   - Self-protection: Cannot change own role
   - Revalidates /admin/users path after change

2. **deleteUser**: Removes user via Supabase Admin API
   - Uses admin.auth.admin.deleteUser for proper deletion
   - Cascades to profiles via FK constraint
   - Self-protection: Cannot delete own account

### UI Components (user-actions.tsx)

1. **RoleDropdown**: Interactive role selector
   - Shows current role (Utilizador/Admin)
   - Disabled for current user (self-protection)
   - Loading state during update
   - Toast notifications for success/error

2. **DeleteUserButton**: Confirmation dialog for user deletion
   - Hidden for current user
   - AlertDialog with explicit confirmation
   - Shows user email in confirmation message
   - Red destructive button styling

### Page Integration (page.tsx)

- Added current user detection
- Replaced Badge with RoleDropdown for approved users
- Added Acoes column with DeleteUserButton
- Current user marked with "(voce)" label

## Key Patterns

### Self-Protection Pattern
```typescript
// Server-side protection
const { data: { user } } = await supabase.auth.getUser()
if (user?.id === userId) {
  return { error: 'Nao pode alterar a sua propria funcao' }
}

// Client-side UI protection
<RoleDropdown
  isCurrentUser={isCurrentUser}
  disabled={isUpdating || isCurrentUser}
/>
```

### Confirmation Dialog Pattern
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="ghost" size="icon">
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Eliminar utilizador?</AlertDialogTitle>
      <AlertDialogDescription>
        Tem a certeza que pretende eliminar <strong>{userEmail}</strong>?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Verification Results

- [x] updateUserRole server action changes role in profiles table
- [x] deleteUser server action removes user via admin API
- [x] Both actions prevent self-modification
- [x] RoleDropdown shows current role and allows changing
- [x] RoleDropdown is disabled for current user
- [x] DeleteUserButton shows confirmation dialog
- [x] DeleteUserButton is hidden for current user
- [x] Current user marked with "(voce)" label
- [x] TypeScript compiles without errors
- [x] Build succeeds

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Phase 09 (Export, Email & Admin) is now complete with all 6 plans executed:
- 09-01: Export Matches Button
- 09-02: Export Progress/Results
- 09-03: Email Export Trigger
- 09-04: Email Status UI
- 09-05: Admin Dashboard Stats
- 09-06: Admin Role Management & User Deletion

Ready for Phase 10 verification and UAT.

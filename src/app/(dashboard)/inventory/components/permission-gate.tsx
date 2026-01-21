import { ReactNode } from 'react'
import { UserRole } from '@/lib/auth/utils'

interface PermissionGateProps {
  children: ReactNode
  /** Role required to see children. 'admin' means admin-only, 'user' means any authenticated user */
  requiredRole: 'admin' | 'user'
  /** Current user's role, passed from server component */
  userRole: UserRole | null
  /** Content to show if user doesn't have permission (optional) */
  fallback?: ReactNode
}

/**
 * Conditionally render children based on user role
 *
 * Role hierarchy: admin > user > null (unauthenticated)
 * - admin can access everything
 * - user can access 'user' level and below
 * - null (not logged in) can access nothing gated
 *
 * @example
 * // Only admin sees this
 * <PermissionGate requiredRole="admin" userRole={userRole}>
 *   <UploadButton />
 * </PermissionGate>
 *
 * // Any authenticated user sees this
 * <PermissionGate requiredRole="user" userRole={userRole}>
 *   <ExportButton />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  requiredRole,
  userRole,
  fallback = null,
}: PermissionGateProps) {
  // Not authenticated - show nothing
  if (!userRole) {
    return <>{fallback}</>
  }

  // Admin can access everything
  if (userRole === 'admin') {
    return <>{children}</>
  }

  // Check specific role requirement
  // 'user' role can access 'user' level content
  if (requiredRole === 'user' && userRole === 'user') {
    return <>{children}</>
  }

  // User doesn't have required permission
  return <>{fallback}</>
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'user' | 'admin'

/**
 * Get the current user's role from JWT claims
 * Returns null if not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return null
  }

  try {
    // Decode JWT payload (middle part, base64)
    const payload = JSON.parse(
      Buffer.from(session.access_token.split('.')[1], 'base64').toString()
    )
    return payload.user_role || 'user'
  } catch {
    return null
  }
}

/**
 * Require admin role, redirect to unauthorized if not admin
 * Use in server components/actions that need admin access
 */
export async function requireAdmin(): Promise<void> {
  const role = await getUserRole()
  if (role !== 'admin') {
    redirect('/unauthorized')
  }
}

/**
 * Check if current user is admin (non-redirecting version)
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole()
  return role === 'admin'
}

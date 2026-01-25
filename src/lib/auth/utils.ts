import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'user' | 'admin'

/**
 * Get the current user's role from profiles table
 * Returns null if not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Query the profiles table for the user's role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return (profile?.role as UserRole) || 'user'
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

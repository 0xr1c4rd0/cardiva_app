import { createClient } from '@/lib/supabase/server'
import { UserMenuClient } from './user-menu-client'

export async function UserMenu() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user initials from email
  const email = user.email || 'User'
  const initials = email
    .split('@')[0]
    .split(/[._-]/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return <UserMenuClient email={email} initials={initials} />
}

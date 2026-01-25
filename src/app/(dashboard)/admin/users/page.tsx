import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { UsersTable, type UserWithProfile } from './users-table'

export default async function AdminUsersPage() {
  const admin = createAdminClient()
  const supabase = await createClient()

  // Fetch all users
  const { data: authUsers } = await admin.auth.admin.listUsers()

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, role, approved_at, created_at')

  // Get current user ID for comparison
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const currentUserId = currentUser?.id

  const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  // Merge auth users with profiles into a single structure
  const usersWithProfiles: UserWithProfile[] = (authUsers?.users || []).map((user) => {
    const profile = profilesMap.get(user.id)
    return {
      id: user.id,
      email: user.email || '',
      created_at: user.created_at,
      banned_until: user.banned_until ? String(user.banned_until) : null,
      role: profile?.role || 'user',
      approved_at: profile?.approved_at || null,
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Utilizadores</h1>
        <p className="text-muted-foreground">
          Gerir utilizadores e permissões de acesso
        </p>
      </div>

      <UsersTable
        initialUsers={usersWithProfiles}
        currentUserId={currentUserId}
      />
    </div>
  )
}

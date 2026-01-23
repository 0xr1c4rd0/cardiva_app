import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { ApproveButton, RejectButton } from './user-actions'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function AdminUsersPage() {
  const admin = createAdminClient()
  const supabase = await createClient()

  // Fetch all users
  const { data: authUsers } = await admin.auth.admin.listUsers()

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, role, approved_at, created_at')

  const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  // Separate pending and approved users
  const pendingUsers = authUsers?.users.filter((user) => user.banned_until) || []
  const approvedUsers =
    authUsers?.users.filter((user) => !user.banned_until) || []

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Utilizadores</h1>
        <p className="text-muted-foreground">
          Aprovar ou rejeitar registos de utilizadores pendentes
        </p>
      </div>

      {/* Pending Users Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pendentes de Aprovação</CardTitle>
          <CardDescription>
            Utilizadores à espera de aprovação da conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sem utilizadores pendentes de momento
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[1%]">Estado</TableHead>
                  <TableHead className="w-[1%]">Registado</TableHead>
                  <TableHead className="w-[1%] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => {
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Pendente</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('pt-PT')}
                      </TableCell>
                      <TableCell className="text-right">
                        <ApproveButton userId={user.id} />
                        <RejectButton userId={user.id} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approved Users Section */}
      <Card>
        <CardHeader>
          <CardTitle>Utilizadores Aprovados</CardTitle>
          <CardDescription>Utilizadores ativos com contas aprovadas</CardDescription>
        </CardHeader>
        <CardContent>
          {approvedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ainda não existem utilizadores aprovados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[1%]">Função</TableHead>
                  <TableHead className="w-[1%]">Aprovado</TableHead>
                  <TableHead className="w-[1%]">Registado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedUsers.map((user) => {
                  const profile = profilesMap.get(user.id)
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            profile?.role === 'admin' ? 'default' : 'secondary'
                          }
                        >
                          {profile?.role === 'admin' ? 'admin' : 'utilizador'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {profile?.approved_at
                          ? new Date(profile.approved_at).toLocaleDateString('pt-PT')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('pt-PT')}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

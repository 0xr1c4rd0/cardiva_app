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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Approve or reject pending user registrations
        </p>
      </div>

      {/* Pending Users Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>
            Users waiting for account approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pending users at this time
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => {
                  const profile = profilesMap.get(user.id)
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Pending</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
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
          <CardTitle>Approved Users</CardTitle>
          <CardDescription>Active users with approved accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {approvedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No approved users yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Registered</TableHead>
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
                          {profile?.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {profile?.approved_at
                          ? new Date(profile.approved_at).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
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

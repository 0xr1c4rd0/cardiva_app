'use client'

import { useState, useCallback } from 'react'
import { RoleDropdown, ActiveToggle, DeleteUserButton } from './user-actions'
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
import { Badge } from '@/components/ui/badge'
import { StatusDot } from '@/components/ui/status-dot'

export interface UserWithProfile {
  id: string
  email: string
  created_at: string
  banned_until: string | null
  role: string
  approved_at: string | null
}

interface UsersTableProps {
  initialUsers: UserWithProfile[]
  currentUserId: string | undefined
}

export function UsersTable({ initialUsers, currentUserId }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers)

  // Update a user in the local state for instant UI feedback
  const updateUser = useCallback((userId: string, updates: Partial<UserWithProfile>) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, ...updates } : user
    ))
  }, [])

  // Remove a user from the local state
  const removeUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
  }, [])

  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle>Utilizadores</CardTitle>
        <CardDescription>
          Ative a checkbox para aprovar o acesso de um utilizador
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ainda não existem utilizadores registados
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="w-[140px]">Função</TableHead>
                <TableHead className="w-[80px] text-center">Ativo</TableHead>
                <TableHead className="w-[120px]">Aprovado</TableHead>
                <TableHead className="w-[120px]">Registado</TableHead>
                <TableHead className="w-[60px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const isCurrentUser = user.id === currentUserId
                const isActive = !user.banned_until && !!user.approved_at
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.email}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <RoleDropdown
                        userId={user.id}
                        currentRole={user.role || 'user'}
                        isCurrentUser={isCurrentUser}
                        onUpdate={(role) => updateUser(user.id, { role })}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <ActiveToggle
                        userId={user.id}
                        isActive={isActive}
                        isCurrentUser={isCurrentUser}
                        onUpdate={(approved_at, banned_until) =>
                          updateUser(user.id, { approved_at, banned_until })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusDot
                          variant={user.approved_at ? 'success' : 'pending'}
                          size="sm"
                          label={user.approved_at ? 'Aprovado' : 'Pendente'}
                        />
                        <span>
                          {user.approved_at
                            ? new Date(user.approved_at).toLocaleDateString('pt-PT')
                            : 'Pendente'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-PT')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteUserButton
                        userId={user.id}
                        userEmail={user.email || ''}
                        isCurrentUser={isCurrentUser}
                        onDelete={() => removeUser(user.id)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

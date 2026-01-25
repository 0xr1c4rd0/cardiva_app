'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { approveUser, rejectUser, updateUserRole, deleteUser } from './actions'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ApproveButton({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      return await approveUser(userId)
    },
    null
  )

  return (
    <form action={formAction} className="inline">
      <Button
        type="submit"
        size="sm"
        variant="default"
        className="mr-2"
        disabled={isPending}
      >
        {isPending ? 'A aprovar...' : 'Aprovar'}
      </Button>
    </form>
  )
}

export function RejectButton({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      return await rejectUser(userId)
    },
    null
  )

  return (
    <form action={formAction} className="inline">
      <Button
        type="submit"
        size="sm"
        variant="destructive"
        disabled={isPending}
      >
        {isPending ? 'A rejeitar...' : 'Rejeitar'}
      </Button>
    </form>
  )
}

interface RoleDropdownProps {
  userId: string
  currentRole: string
  isCurrentUser: boolean
}

export function RoleDropdown({ userId, currentRole, isCurrentUser }: RoleDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return

    setIsUpdating(true)
    try {
      const result = await updateUserRole(userId, newRole as 'user' | 'admin')
      if (result.success) {
        toast.success('Funcao atualizada')
      } else {
        toast.error(result.error || 'Erro ao atualizar funcao')
      }
    } catch (error) {
      toast.error('Erro ao atualizar funcao')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select
      value={currentRole}
      onValueChange={handleRoleChange}
      disabled={isUpdating || isCurrentUser}
    >
      <SelectTrigger className="w-32">
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">Utilizador</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  )
}

interface DeleteUserButtonProps {
  userId: string
  userEmail: string
  isCurrentUser: boolean
}

export function DeleteUserButton({ userId, userEmail, isCurrentUser }: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteUser(userId)
      if (result.success) {
        toast.success('Utilizador eliminado')
      } else {
        toast.error(result.error || 'Erro ao eliminar utilizador')
      }
    } catch (error) {
      toast.error('Erro ao eliminar utilizador')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isCurrentUser) {
    return null // Don't show delete for current user
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isDeleting}>
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar utilizador?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem a certeza que pretende eliminar <strong>{userEmail}</strong>?
            Esta acao nao pode ser revertida.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

'use client'

import { useState } from 'react'
import { updateUserRole, deleteUser, toggleUserActive } from './actions'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface RoleDropdownProps {
  userId: string
  currentRole: string
  isCurrentUser: boolean
  onUpdate?: (newRole: string) => void
}

export function RoleDropdown({ userId, currentRole, isCurrentUser, onUpdate }: RoleDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [role, setRole] = useState(currentRole)

  const handleRoleChange = async (newRole: string) => {
    if (newRole === role) return

    const previousRole = role
    setIsUpdating(true)
    setRole(newRole) // Optimistic update

    try {
      const result = await updateUserRole(userId, newRole as 'user' | 'admin')
      if (result.success) {
        toast.success('Função atualizada')
        onUpdate?.(newRole)
      } else {
        setRole(previousRole) // Revert on error
        toast.error(result.error || 'Erro ao atualizar função')
      }
    } catch (error) {
      setRole(previousRole) // Revert on error
      toast.error('Erro ao atualizar função')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Select
      value={role}
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

interface ActiveToggleProps {
  userId: string
  isActive: boolean
  isCurrentUser: boolean
  onUpdate?: (approved_at: string | null, banned_until: string | null) => void
}

export function ActiveToggle({ userId, isActive, isCurrentUser, onUpdate }: ActiveToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [checked, setChecked] = useState(isActive)

  const handleToggle = async (newValue: boolean) => {
    setIsUpdating(true)
    setChecked(newValue) // Optimistic update
    try {
      const result = await toggleUserActive(userId, newValue)
      if (result.success) {
        toast.success(newValue ? 'Utilizador ativado' : 'Utilizador desativado')
        // Update parent state with the new values
        onUpdate?.(result.approved_at ?? null, result.banned_until ?? null)
      } else {
        setChecked(!newValue) // Revert on error
        toast.error(result.error || 'Erro ao alterar estado')
      }
    } catch (error) {
      setChecked(!newValue) // Revert on error
      toast.error('Erro ao alterar estado')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={handleToggle}
      disabled={isUpdating || isCurrentUser}
      aria-label="Ativar utilizador"
    />
  )
}

interface DeleteUserButtonProps {
  userId: string
  userEmail: string
  isCurrentUser: boolean
  onDelete?: () => void
}

export function DeleteUserButton({ userId, userEmail, isCurrentUser, onDelete }: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteUser(userId)
      if (result.success) {
        toast.success('Utilizador eliminado')
        onDelete?.()
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
            Esta ação não pode ser revertida.
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

'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteRFPJob } from '../actions'

interface DeleteRFPDialogProps {
  jobId: string | null
  jobName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function DeleteRFPDialog({
  jobId,
  jobName,
  open,
  onOpenChange,
  onDeleted,
}: DeleteRFPDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!jobId) return

    setIsDeleting(true)
    try {
      const result = await deleteRFPJob(jobId)
      if (result.success) {
        onOpenChange(false)
        onDeleted?.()
      } else {
        console.error('Failed to delete RFP:', result.error)
      }
    } catch (error) {
      console.error('Error deleting RFP:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar Concurso</AlertDialogTitle>
          <AlertDialogDescription>
            Tem a certeza que deseja eliminar{' '}
            {jobName ? (
              <span className="font-medium text-foreground">{jobName}</span>
            ) : (
              'este concurso'
            )}
            ? Esta ação não pode ser revertida.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A eliminar...
              </>
            ) : (
              'Eliminar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { confirmRFP } from '../[id]/matches/actions'

interface ConfirmRFPButtonProps {
  jobId: string
  isConfirmed: boolean
}

/**
 * Button to confirm an RFP job, marking it as ready for export.
 * Shows "Confirmado" (disabled) if already confirmed, otherwise "Confirmar".
 */
export function ConfirmRFPButton({ jobId, isConfirmed }: ConfirmRFPButtonProps) {
  const [isPending, startTransition] = useTransition()

  if (isConfirmed) {
    return (
      <Button variant="outline" disabled className="text-emerald-600 border-emerald-200">
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Confirmado
      </Button>
    )
  }

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await confirmRFP(jobId)
      if (result.success) {
        toast.success('Concurso confirmado', {
          description: 'O concurso esta pronto para exportacao.'
        })
      } else {
        toast.error('Erro ao confirmar', {
          description: result.error
        })
      }
    })
  }

  return (
    <Button onClick={handleConfirm} disabled={isPending}>
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="mr-2 h-4 w-4" />
      )}
      Confirmar
    </Button>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, Download, ChevronDown, Loader2, Mail, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import type { RFPItemWithMatches } from '@/types/rfp'
import { ExportDownloadDialog } from './export-download-dialog'
import { ExportEmailDialog } from './export-email-dialog'
import { confirmRFP } from '../[id]/matches/actions'
import { useRFPConfirmation } from './rfp-confirmation-context'

interface RFPActionButtonProps {
  jobId: string
  items: RFPItemWithMatches[]
  rfpFileName: string
}

/**
 * Smart action button that shows:
 * - "Confirmar" when not confirmed (with pending item indicator if applicable)
 * - "Exportar ▼" dropdown when confirmed
 * Uses RFPConfirmationContext for shared state.
 */
export function RFPActionButton({ jobId, items, rfpFileName }: RFPActionButtonProps) {
  const { isConfirmed, setIsConfirmed } = useRFPConfirmation()
  const [isPending, startTransition] = useTransition()
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  // Calculate pending count (items with suggestions that need review, excluding 100% matches)
  const pendingCount = items.filter((i) => {
    if (i.review_status !== 'pending') return false
    if (i.rfp_match_suggestions.length === 0) return false
    // Exclude items with 100% match (auto-accepted)
    const hasExactMatch = i.rfp_match_suggestions.some((m) => m.similarity_score >= 0.9999)
    return !hasExactMatch
  }).length

  // Check if there are any confirmed matches (accepted or manual)
  const hasConfirmedMatches = items.some(
    (i) => i.review_status === 'accepted' || i.review_status === 'manual'
  )

  const canConfirm = pendingCount === 0 && hasConfirmedMatches

  const handleConfirm = () => {
    startTransition(async () => {
      const result = await confirmRFP(jobId)
      if (result.success) {
        toast.success('Concurso confirmado', {
          description: 'O concurso esta pronto para exportacao.',
        })
        // Update shared state via context
        setIsConfirmed(true)
      } else {
        toast.error('Erro ao confirmar', {
          description: result.error,
        })
      }
    })
  }

  // Unconfirmed state: show Confirmar button
  if (!isConfirmed) {
    const getButtonText = () => {
      if (pendingCount > 0) {
        return `${pendingCount} ${pendingCount === 1 ? 'produto' : 'produtos'} por rever`
      }
      return 'Confirmar'
    }

    const getTooltipText = () => {
      if (pendingCount > 0) {
        return 'Reveja todos os produtos antes de confirmar'
      }
      if (!hasConfirmedMatches) {
        return 'Selecione pelo menos um produto para confirmar'
      }
      return ''
    }

    const button = (
      <Button
        onClick={handleConfirm}
        disabled={!canConfirm || isPending}
        className={!canConfirm ? 'cursor-not-allowed' : ''}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-4 w-4" />
        )}
        {getButtonText()}
      </Button>
    )

    if (!canConfirm) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>{button}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipText()}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return button
  }

  // Confirmed state: show Export dropdown
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Exportar
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setDownloadDialogOpen(true)}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Transferir Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Enviar por Email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExportDownloadDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        items={items}
        rfpFileName={rfpFileName}
      />

      <ExportEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        items={items}
        jobId={jobId}
        rfpFileName={rfpFileName}
      />
    </>
  )
}

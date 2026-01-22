'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { RFPItemWithMatches } from '@/types/rfp'
import { ExportDialog } from './export-dialog'

interface HeaderExportButtonProps {
  items: RFPItemWithMatches[]
  jobId: string
}

export function HeaderExportButton({ items, jobId }: HeaderExportButtonProps) {
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  // Calculate pending count (items with suggestions that need review)
  const pendingCount = items.filter(
    (i) => i.review_status === 'pending' && i.rfp_match_suggestions.length > 0
  ).length

  // Check if there are any confirmed matches (accepted or manual)
  const hasConfirmedMatches = items.some(
    (i) => i.review_status === 'accepted' || i.review_status === 'manual'
  )

  const isDisabled = pendingCount > 0 || !hasConfirmedMatches

  const getButtonText = () => {
    if (pendingCount > 0) {
      return `${pendingCount} ${pendingCount === 1 ? 'item' : 'itens'} por rever`
    }
    return 'Confirmar e Exportar'
  }

  const getTooltipText = () => {
    if (pendingCount > 0) {
      return 'Reveja todos os itens antes de exportar'
    }
    if (!hasConfirmedMatches) {
      return 'Selecione pelo menos um produto para exportar'
    }
    return ''
  }

  const button = (
    <Button
      disabled={isDisabled}
      onClick={() => setExportDialogOpen(true)}
      className={isDisabled ? 'cursor-not-allowed' : ''}
    >
      <Download className="h-4 w-4 mr-2" />
      {getButtonText()}
    </Button>
  )

  return (
    <>
      {isDisabled ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>{button}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipText()}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        items={items}
        jobId={jobId}
      />
    </>
  )
}

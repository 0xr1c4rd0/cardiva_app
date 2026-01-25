'use client'

import { useState } from 'react'
import { Download, ChevronDown, Mail } from 'lucide-react'
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
import type { RFPItemWithMatches } from '@/types/rfp'
import { ExportDownloadDialog } from './export-download-dialog'

interface HeaderExportButtonProps {
  items: RFPItemWithMatches[]
  jobId: string
}

export function HeaderExportButton({ items, jobId }: HeaderExportButtonProps) {
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

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
      return `${pendingCount} ${pendingCount === 1 ? 'produto' : 'produtos'} por rever`
    }
    return 'Exportar'
  }

  const getTooltipText = () => {
    if (pendingCount > 0) {
      return 'Reveja todos os produtos antes de exportar'
    }
    if (!hasConfirmedMatches) {
      return 'Selecione pelo menos um produto para exportar'
    }
    return ''
  }

  const button = (
    <Button
      disabled={isDisabled}
      className={isDisabled ? 'cursor-not-allowed' : ''}
    >
      <Download className="h-4 w-4 mr-2" />
      {getButtonText()}
      {!isDisabled && <ChevronDown className="ml-2 h-4 w-4" />}
    </Button>
  )

  if (isDisabled) {
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {button}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setDownloadDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
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
      />

      {/* ExportEmailDialog - implemented in plan 09-03 */}
      {emailDialogOpen && (
        <div className="hidden">Email dialog placeholder - implemented in 09-03</div>
      )}
    </>
  )
}

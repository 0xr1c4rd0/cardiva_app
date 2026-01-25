'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, X, AlertCircle, Edit, Download, ChevronDown, Mail } from 'lucide-react'
import type { RFPItemWithMatches } from '@/types/rfp'
import { ExportDownloadDialog } from './export-download-dialog'
import { ExportEmailDialog } from './export-email-dialog'

interface ConfirmationSummaryProps {
  items: RFPItemWithMatches[]
  jobId: string
  rfpFileName: string
}

export function ConfirmationSummary({ items, jobId, rfpFileName }: ConfirmationSummaryProps) {
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  // Calculate stats from items
  // "Sem correspondência" items (no suggestions) are considered reviewed - nothing to decide
  const noMatchItems = items.filter(
    (i) => i.review_status === 'pending' && i.rfp_match_suggestions.length === 0
  ).length

  // Only items with pending status AND suggestions need review
  const pendingWithSuggestions = items.filter(
    (i) => i.review_status === 'pending' && i.rfp_match_suggestions.length > 0
  ).length

  const stats = {
    total: items.length,
    accepted: items.filter((i) => i.review_status === 'accepted').length,
    rejected: items.filter((i) => i.review_status === 'rejected').length,
    manual: items.filter((i) => i.review_status === 'manual').length,
    pending: pendingWithSuggestions, // Only count items that actually need review
    noMatch: noMatchItems, // Track "Sem correspondência" separately
  }

  const allDecided = stats.pending === 0
  const hasMatches = stats.accepted + stats.manual > 0

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Resumo da Revisão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status counts */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <span>Selecionados: {stats.accepted}</span>
          </div>
          <div className="flex items-center gap-2">
            <Edit className="h-4 w-4 text-blue-600" />
            <span>Manuais: {stats.manual}</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-gray-500" />
            <span>Rejeitados: {stats.rejected}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>Sem corresp.: {stats.noMatch}</span>
          </div>
          {stats.pending > 0 && (
            <div className="flex items-center gap-2 col-span-2 text-amber-600 font-medium">
              <AlertCircle className="h-4 w-4" />
              <span>Por rever: {stats.pending}</span>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{stats.accepted + stats.manual + stats.rejected + stats.noMatch} / {stats.total}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((stats.accepted + stats.manual + stats.rejected + stats.noMatch) / stats.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Warning message if there are items with suggestions that need review */}
        {stats.pending > 0 && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-600">
            <p>
              Reveja {stats.pending === 1 ? 'o' : 'os'} <strong>{stats.pending}</strong> {stats.pending === 1 ? 'produto com sugestões' : 'produtos com sugestões'} antes de continuar.
            </p>
          </div>
        )}

        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full" disabled={!allDecided || !hasMatches}>
              {allDecided ? (
                <>
                  Exportar
                  <ChevronDown className="ml-2 h-4 w-4" />
                </>
              ) : (
                `${stats.pending} ${stats.pending === 1 ? 'produto' : 'produtos'} por rever`
              )}
            </Button>
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

        {/* Help text */}
        {allDecided && !hasMatches && (
          <p className="text-xs text-muted-foreground text-center">
            Selecione pelo menos um produto para exportar.
          </p>
        )}
      </CardContent>

      {/* Export Download dialog */}
      <ExportDownloadDialog
        open={downloadDialogOpen}
        onOpenChange={setDownloadDialogOpen}
        items={items}
        rfpFileName={rfpFileName}
      />

      {/* Export Email dialog */}
      <ExportEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        items={items}
        jobId={jobId}
        rfpFileName={rfpFileName}
      />
    </Card>
  )
}

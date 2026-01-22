'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, X, AlertCircle, Edit, Download } from 'lucide-react'
import type { RFPItemWithMatches } from '@/types/rfp'

interface ConfirmationSummaryProps {
  items: RFPItemWithMatches[]
  onProceedToExport: () => void
}

export function ConfirmationSummary({ items, onProceedToExport }: ConfirmationSummaryProps) {
  // Calculate stats from items
  const stats = {
    total: items.length,
    accepted: items.filter((i) => i.review_status === 'accepted').length,
    rejected: items.filter((i) => i.review_status === 'rejected').length,
    manual: items.filter((i) => i.review_status === 'manual').length,
    pending: items.filter((i) => i.review_status === 'pending').length,
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
            <span>Sem match: {stats.rejected}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>Pendentes: {stats.pending}</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{stats.total - stats.pending} / {stats.total}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((stats.total - stats.pending) / stats.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Warning message if pending > 0 */}
        {stats.pending > 0 && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-600">
            <p>
              Reveja os <strong>{stats.pending}</strong> {stats.pending === 1 ? 'item pendente' : 'itens pendentes'} antes de continuar.
            </p>
          </div>
        )}

        {/* Export button */}
        <Button
          className="w-full"
          disabled={!allDecided || !hasMatches}
          onClick={onProceedToExport}
        >
          <Download className="h-4 w-4 mr-2" />
          {allDecided
            ? 'Confirmar e Exportar'
            : `${stats.pending} ${stats.pending === 1 ? 'item' : 'itens'} por rever`}
        </Button>

        {/* Help text */}
        {allDecided && !hasMatches && (
          <p className="text-xs text-muted-foreground text-center">
            Selecione pelo menos um produto para exportar.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

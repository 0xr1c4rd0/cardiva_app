'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Download, Mail, Loader2, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { RFPItemWithMatches } from '@/types/rfp'
import {
  transformToExportRows,
  calculateExportSummary,
  exportRFPToExcel,
  generateExcelBase64,
  generateExportFilename,
} from '@/lib/export/rfp-export'
import { sendExportEmail } from '@/app/(dashboard)/rfps/[id]/matches/export-actions'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: RFPItemWithMatches[]
  jobId: string
}

export function ExportDialog({ open, onOpenChange, items, jobId }: ExportDialogProps) {
  const [exportMode, setExportMode] = useState<'matched' | 'all'>('matched')
  const [email, setEmail] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Calculate summary and row counts
  const { matchedCount, noMatchCount, totalRows } = useMemo(() => {
    const summary = calculateExportSummary(items)
    const matched = summary.confirmedCount + summary.manualCount
    const noMatch = summary.rejectedCount + summary.noMatchCount
    const confirmedOnly = exportMode === 'matched'
    const rows = transformToExportRows(items, confirmedOnly)

    return {
      matchedCount: matched,
      noMatchCount: noMatch,
      totalRows: rows.length,
    }
  }, [items, exportMode])

  const handleExport = async () => {
    if (totalRows === 0) {
      toast.error('Sem dados para exportar')
      return
    }

    setIsExporting(true)
    setTimeout(() => {
      try {
        const confirmedOnly = exportMode === 'matched'
        exportRFPToExcel(items, confirmedOnly, 'RFP_Resultados')
        toast.success('Ficheiro Excel transferido')
      } catch (error) {
        console.error('Export failed:', error)
        toast.error('Erro ao exportar ficheiro')
      } finally {
        setIsExporting(false)
      }
    }, 0)
  }

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Introduza um email válido')
      return
    }

    if (totalRows === 0) {
      toast.error('Sem dados para enviar')
      return
    }

    setIsSendingEmail(true)
    try {
      const confirmedOnly = exportMode === 'matched'
      const excelBase64 = generateExcelBase64(items, confirmedOnly)
      const fileName = generateExportFilename('RFP_Resultados')
      const summary = calculateExportSummary(items)

      const result = await sendExportEmail({
        jobId,
        recipientEmail: email,
        fileName,
        excelBase64,
        summary: {
          totalItems: summary.totalItems,
          confirmedCount: summary.confirmedCount,
          rejectedCount: summary.rejectedCount,
          manualCount: summary.manualCount,
          noMatchCount: summary.noMatchCount,
        },
      })

      if (result.success) {
        toast.success('Email enviado para processamento')
        setEmail('')
      } else {
        toast.error(result.error || 'Erro ao enviar email')
      }
    } catch (error) {
      console.error('Send email failed:', error)
      toast.error('Erro ao enviar email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleClose = () => {
    if (!isExporting && !isSendingEmail) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Exportar Resultados</DialogTitle>
          <DialogDescription>
            Exporte os resultados da revisão para Excel.
          </DialogDescription>
        </DialogHeader>

        {/* Summary stats - compact inline */}
        <div className="flex items-center justify-center gap-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-100">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="text-lg font-semibold text-emerald-700">{matchedCount}</span>
            <span className="text-xs text-muted-foreground">Correspondências</span>
          </div>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100">
              <AlertCircle className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <span className="text-lg font-semibold text-gray-700">{noMatchCount}</span>
            <span className="text-xs text-muted-foreground">Sem correspondência</span>
          </div>
        </div>

        {/* Export mode selection */}
        <div className="space-y-3 py-3 border-t">
          <Label className="text-sm font-medium">Incluir na exportação</Label>
          <RadioGroup
            value={exportMode}
            onValueChange={(value) => setExportMode(value as 'matched' | 'all')}
            className="space-y-2"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="matched" id="matched" />
              <Label htmlFor="matched" className="cursor-pointer font-normal">
                Apenas correspondências ({matchedCount} {matchedCount === 1 ? 'item' : 'itens'})
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer font-normal">
                Todos os itens ({items.length} {items.length === 1 ? 'item' : 'itens'})
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Email section */}
        <div className="space-y-3 py-3 border-t">
          <Label htmlFor="email" className="text-sm font-medium">
            Enviar por email (opcional)
          </Label>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSendingEmail}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendEmail}
              disabled={!email || isSendingEmail || totalRows === 0}
            >
              {isSendingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isExporting || isSendingEmail}>
            Fechar
          </Button>
          <Button onClick={handleExport} disabled={isExporting || totalRows === 0}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A exportar...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Transferir Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

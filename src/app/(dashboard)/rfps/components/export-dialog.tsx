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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Download, Mail, Loader2, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { RFPItemWithMatches } from '@/types/rfp'
import {
  transformToExportRows,
  calculateExportSummary,
  exportRFPToExcel,
  generateExcelBase64,
  generateExportFilename,
  type RFPExportRow,
} from '@/lib/export/rfp-export'
import { sendExportEmail } from '@/app/(dashboard)/rfps/[id]/matches/export-actions'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: RFPItemWithMatches[]
  jobId: string
}

const PREVIEW_ROW_COUNT = 8

export function ExportDialog({ open, onOpenChange, items, jobId }: ExportDialogProps) {
  const [confirmedOnly, setConfirmedOnly] = useState(true)
  const [email, setEmail] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // Calculate preview data and summary
  const { previewRows, totalRows, summary } = useMemo(() => {
    const rows = transformToExportRows(items, confirmedOnly)
    const summaryData = calculateExportSummary(items)
    return {
      previewRows: rows.slice(0, PREVIEW_ROW_COUNT),
      totalRows: rows.length,
      summary: summaryData,
    }
  }, [items, confirmedOnly])

  const handleExport = async () => {
    if (totalRows === 0) {
      toast.error('Sem dados para exportar')
      return
    }

    setIsExporting(true)
    // Use setTimeout to let React update UI before CPU-intensive export
    setTimeout(() => {
      try {
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
      const excelBase64 = generateExcelBase64(items, confirmedOnly)
      const fileName = generateExportFilename('RFP_Resultados')

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Selecionado':
        return <Check className="h-3.5 w-3.5 text-emerald-600" />
      case 'Sem correspondência':
        return <AlertCircle className="h-3.5 w-3.5 text-gray-500" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exportar Resultados</DialogTitle>
          <DialogDescription>
            Exporte os resultados da revisão para Excel ou envie por email.
          </DialogDescription>
        </DialogHeader>

        {/* Summary stats - simplified to 2 categories */}
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-semibold text-emerald-700">
              {summary.confirmedCount + summary.manualCount}
            </div>
            <div className="text-xs text-emerald-600">Correspondências</div>
          </div>
          <div className="text-center p-3 bg-gray-100 rounded-lg">
            <div className="text-2xl font-semibold text-gray-700">
              {summary.rejectedCount + summary.noMatchCount}
            </div>
            <div className="text-xs text-gray-600">Sem correspondência</div>
          </div>
        </div>

        {/* Filter toggle */}
        <div className="flex items-center justify-between py-2 border-t border-b">
          <div className="flex items-center gap-2">
            <Switch
              id="confirmed-only"
              checked={confirmedOnly}
              onCheckedChange={setConfirmedOnly}
            />
            <Label htmlFor="confirmed-only" className="cursor-pointer">
              Apenas itens com correspondência
            </Label>
          </div>
          <span className="text-sm text-muted-foreground">
            {totalRows} {totalRows === 1 ? 'item' : 'itens'} a exportar
          </span>
        </div>

        {/* Preview table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Lote</TableHead>
                <TableHead className="w-[60px]">Pos.</TableHead>
                <TableHead>Descrição Pedido</TableHead>
                <TableHead>Descrição Match</TableHead>
                <TableHead className="w-[80px]">Similar.</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Sem itens para exportar
                  </TableCell>
                </TableRow>
              ) : (
                previewRows.map((row: RFPExportRow, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{row.lote ?? '-'}</TableCell>
                    <TableCell>{row.posicao ?? '-'}</TableCell>
                    <TableCell className="max-w-[180px] truncate" title={row.descricao_pedido}>
                      {row.descricao_pedido}
                    </TableCell>
                    <TableCell
                      className="max-w-[180px] truncate"
                      title={row.descricao_match || ''}
                    >
                      {row.descricao_match || '-'}
                    </TableCell>
                    <TableCell>{row.similaridade}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(row.status)}
                        <span className="text-xs">{row.status}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {totalRows > PREVIEW_ROW_COUNT && (
            <div className="text-center py-2 text-sm text-muted-foreground border-t bg-muted/50">
              ... e mais {totalRows - PREVIEW_ROW_COUNT}{' '}
              {totalRows - PREVIEW_ROW_COUNT === 1 ? 'item' : 'itens'}
            </div>
          )}
        </div>

        {/* Email section */}
        <div className="space-y-3 pt-2">
          <Label htmlFor="email">Enviar por email (opcional)</Label>
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
              onClick={handleSendEmail}
              disabled={!email || isSendingEmail || totalRows === 0}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A enviar...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            O ficheiro Excel será enviado como anexo para o email indicado.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
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

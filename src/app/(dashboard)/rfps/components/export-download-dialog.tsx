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
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Download, Loader2, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { RFPItemWithMatches } from '@/types/rfp'
import {
  transformToExportRows,
  calculateExportSummary,
  exportRFPToExcel,
} from '@/lib/export/rfp-export'

interface ExportDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: RFPItemWithMatches[]
  rfpFileName: string
}

export function ExportDownloadDialog({ open, onOpenChange, items, rfpFileName }: ExportDownloadDialogProps) {
  const [exportMode, setExportMode] = useState<'matched' | 'all'>('matched')
  const [isExporting, setIsExporting] = useState(false)

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
    try {
      const confirmedOnly = exportMode === 'matched'
      // Use RFP filename (without extension) for Excel filename
      const baseName = rfpFileName.replace(/\.pdf$/i, '')
      await exportRFPToExcel(items, confirmedOnly, baseName)
      toast.success('Ficheiro Excel transferido')
      onOpenChange(false)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Erro ao exportar ficheiro')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Transferir Excel</DialogTitle>
          <DialogDescription>
            Exporte os resultados da revisão para Excel.
          </DialogDescription>
        </DialogHeader>

        {/* Summary stats - compact inline */}
        <div className="flex items-center justify-center gap-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-sm bg-emerald-100">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="text-lg font-semibold text-emerald-700">{matchedCount}</span>
            <span className="text-xs text-muted-foreground">Correspondências</span>
          </div>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-6 w-6 rounded-sm bg-gray-100">
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
                Apenas correspondências ({matchedCount} {matchedCount === 1 ? 'produto' : 'produtos'})
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="cursor-pointer font-normal">
                Todos os produtos ({items.length} {items.length === 1 ? 'produto' : 'produtos'})
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancelar
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

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react'
import { exportToExcel, exportToCSV, ExportColumn } from '@/lib/csv/export'
import { Artigo, InventoryColumnConfig } from '@/lib/supabase/types'
import { toast } from 'sonner'

interface ExportButtonProps {
  data: Artigo[]
  columnConfig: InventoryColumnConfig[]
  disabled?: boolean
}

export function ExportButton({ data, columnConfig, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  // Map column config to export columns
  const columns: ExportColumn<Artigo>[] = columnConfig.map((col) => ({
    key: col.column_name as keyof Artigo,
    header: col.display_name,
  }))

  const handleExportExcel = () => {
    if (data.length === 0) {
      toast.error('Sem dados para exportar')
      return
    }

    setIsExporting(true)
    // Use setTimeout to let React update UI before CPU-intensive export
    setTimeout(() => {
      try {
        exportToExcel(data, columns, {
          filename: 'inventario',
          sheetName: 'Inventário',
        })
        toast.success('Ficheiro Excel transferido')
      } catch (error) {
        console.error('Export failed:', error)
        toast.error('Exportação falhou')
      } finally {
        setIsExporting(false)
      }
    }, 0)
  }

  const handleExportCSV = () => {
    if (data.length === 0) {
      toast.error('Sem dados para exportar')
      return
    }

    setIsExporting(true)
    setTimeout(() => {
      try {
        exportToCSV(data, columns, 'inventario')
        toast.success('Ficheiro CSV transferido')
      } catch (error) {
        console.error('Export failed:', error)
        toast.error('Exportação falhou')
      } finally {
        setIsExporting(false)
      }
    }, 0)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting || data.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'A exportar...' : 'Exportar'}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportExcel} disabled={isExporting}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar como Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar como CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

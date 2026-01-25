'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronDown, Loader2, FileSpreadsheet, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import type { ExportColumnConfig } from '@/types/export-config'
import { updateExportColumnConfig, syncExportColumns } from './actions'

interface ExportFieldsSectionProps {
  initialColumns: ExportColumnConfig[]
}

interface ColumnState {
  id: number
  column_name: string
  display_name: string
  visible: boolean
  display_order: number
  source_table: string
}

export function ExportFieldsSection({ initialColumns }: ExportFieldsSectionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [columns, setColumns] = useState<ColumnState[]>(
    initialColumns.map(c => ({
      id: c.id,
      column_name: c.column_name,
      display_name: c.display_name,
      visible: c.visible,
      display_order: c.display_order,
      source_table: c.source_table,
    }))
  )

  const rfpItemsColumns = columns.filter(c => c.source_table === 'rfp_items')
  const matchSuggestionsColumns = columns.filter(c => c.source_table === 'rfp_match_suggestions')

  const updateColumn = (id: number, field: keyof ColumnState, value: string | boolean | number) => {
    setColumns(columns.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateExportColumnConfig(
        columns.map(c => ({
          id: c.id,
          display_name: c.display_name,
          visible: c.visible,
          display_order: c.display_order,
        }))
      )

      if (result.success) {
        toast.success('Configuracao de exportacao guardada')
      } else {
        toast.error(result.error || 'Erro ao guardar')
      }
    } catch {
      toast.error('Erro ao guardar configuracao')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const result = await syncExportColumns()
      if (result.success) {
        toast.success('Colunas sincronizadas')
        // Page will reload due to revalidatePath
      } else {
        toast.error(result.error || 'Erro ao sincronizar')
      }
    } catch {
      toast.error('Erro ao sincronizar colunas')
    } finally {
      setIsSyncing(false)
    }
  }

  const renderTable = (tableColumns: ColumnState[], tableName: string) => (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">{tableName}</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Campo</TableHead>
            <TableHead>Nome de Exibicao</TableHead>
            <TableHead className="w-[80px] text-center">Visivel</TableHead>
            <TableHead className="w-[80px] text-center">Ordem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableColumns.map((col) => (
            <TableRow key={col.id}>
              <TableCell className="font-mono text-sm">{col.column_name}</TableCell>
              <TableCell>
                <Input
                  value={col.display_name}
                  onChange={(e) => updateColumn(col.id, 'display_name', e.target.value)}
                  className="h-8"
                />
              </TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={col.visible}
                  onCheckedChange={(v) => updateColumn(col.id, 'visible', v)}
                />
              </TableCell>
              <TableCell className="text-center">
                <Input
                  type="number"
                  value={col.display_order}
                  onChange={(e) => updateColumn(col.id, 'display_order', parseInt(e.target.value) || 0)}
                  className="h-8 w-16 text-center"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                <div>
                  <CardTitle className="text-lg">Campos de Exportacao</CardTitle>
                  <CardDescription>
                    Configurar colunas visiveis nas exportacoes Excel
                  </CardDescription>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {renderTable(rfpItemsColumns, 'Itens do RFP (rfp_items)')}
            {renderTable(matchSuggestionsColumns, 'Sugestoes de Match (rfp_match_suggestions)')}

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
                {isSyncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Sincronizar Colunas
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

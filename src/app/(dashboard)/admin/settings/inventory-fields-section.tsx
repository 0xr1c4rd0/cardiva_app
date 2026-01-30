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
import { ChevronDown, Loader2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { updateInventoryColumnConfig } from './actions'

interface InventoryColumn {
  id: number
  column_name: string
  display_name: string
  visible: boolean
  sortable: boolean
  searchable: boolean
  display_order: number
}

interface InventoryFieldsSectionProps {
  initialColumns: InventoryColumn[]
}

export function InventoryFieldsSection({ initialColumns }: InventoryFieldsSectionProps) {
  const [isOpen, setIsOpen] = useState(false) // Start collapsed
  const [isSaving, setIsSaving] = useState(false)
  const [columns, setColumns] = useState(initialColumns)

  const updateColumn = (id: number, field: keyof InventoryColumn, value: string | boolean | number) => {
    setColumns(columns.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateInventoryColumnConfig(
        columns.map(c => ({
          id: c.id,
          display_name: c.display_name,
          visible: c.visible,
          display_order: c.display_order,
        }))
      )

      if (result.success) {
        toast.success('Configuracao do inventario guardada')
      } else {
        toast.error(result.error || 'Erro ao guardar')
      }
    } catch {
      toast.error('Erro ao guardar configuracao')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="py-6">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <div>
                  <CardTitle className="text-lg">Campos do Inventario</CardTitle>
                  <CardDescription>
                    Configurar colunas visiveis na pagina de inventario
                  </CardDescription>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
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
                {columns.map((col) => (
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

            <div className="flex justify-end">
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

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { createClient } from '@/lib/supabase/client'
import type { RFPItemWithMatches, MatchSuggestion } from '@/types/rfp'
import type { ExportColumnConfig, ExportColumnMapping } from '@/types/export-config'
import { DEFAULT_EXPORT_COLUMNS } from '@/types/export-config'

/**
 * Flat row structure for RFP export
 * Combines RFP item data with selected/confirmed match data
 */
export interface RFPExportRow {
  lote: number | null
  posicao: number | null
  artigo_pedido: string | null
  descricao_pedido: string
  quantidade: number | null
  codigo_spms: string | null
  artigo_match: string | null
  descricao_match: string | null
  preco_unit: number | null
  similaridade: string
  tipo_match: string | null
  status: string
}

/**
 * Export summary statistics
 */
export interface ExportSummary {
  totalItems: number
  confirmedCount: number
  rejectedCount: number
  manualCount: number
  noMatchCount: number
}

/**
 * @deprecated Use getExportColumnConfig() instead for database-driven configuration
 * Export column configuration with Portuguese headers (kept for backward compatibility)
 */
export const RFP_EXPORT_COLUMNS = [
  { key: 'lote' as const, header: 'Lote' },
  { key: 'posicao' as const, header: 'Posicao' },
  { key: 'artigo_pedido' as const, header: 'Artigo Pedido' },
  { key: 'descricao_pedido' as const, header: 'Descricao Pedido' },
  { key: 'quantidade' as const, header: 'Quantidade' },
  { key: 'codigo_spms' as const, header: 'Cod. SPMS' },
  { key: 'artigo_match' as const, header: 'Artigo Match' },
  { key: 'descricao_match' as const, header: 'Descricao Match' },
  { key: 'preco_unit' as const, header: 'Preco Unit.' },
  { key: 'similaridade' as const, header: 'Similaridade' },
  { key: 'tipo_match' as const, header: 'Tipo' },
  { key: 'status' as const, header: 'Status' },
]

/**
 * Fetch export column configuration from database
 * Returns visible columns ordered by display_order
 */
export async function getExportColumnConfig(): Promise<ExportColumnMapping[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('export_column_config')
      .select('*')
      .eq('visible', true)
      .order('source_table')
      .order('display_order')

    if (error || !data || data.length === 0) {
      console.warn('Using default export columns:', error?.message)
      return DEFAULT_EXPORT_COLUMNS
    }

    // Transform to ExportColumnMapping
    return data.map((col: ExportColumnConfig) => ({
      key: col.column_name,
      header: col.display_name,
      source: col.source_table,
      type: col.column_type,
    }))
  } catch (error) {
    console.warn('Failed to fetch export config, using defaults:', error)
    return DEFAULT_EXPORT_COLUMNS
  }
}

/**
 * Format a value based on column type
 */
function formatValue(value: unknown, type: ExportColumnMapping['type']): string | number | null {
  if (value === null || value === undefined) return null

  switch (type) {
    case 'currency':
      return typeof value === 'number' ? value : parseFloat(String(value)) || null
    case 'number':
      if (typeof value === 'number') {
        // Format similarity score as percentage (values between 0 and 1)
        return value <= 1 && value > 0 ? `${Math.round(value * 100)}%` : value
      }
      return parseFloat(String(value)) || null
    case 'date':
      if (value instanceof Date) return value.toISOString()
      return String(value)
    default:
      return String(value)
  }
}

/**
 * Get the selected/confirmed match for an RFP item
 * Returns the match if status is accepted/manual, null otherwise
 */
function getSelectedMatch(item: RFPItemWithMatches): MatchSuggestion | null {
  if (item.review_status !== 'accepted' && item.review_status !== 'manual') {
    return null
  }

  // For accepted/manual items, find the selected match
  if (item.selected_match_id) {
    return item.rfp_match_suggestions.find((m) => m.id === item.selected_match_id) || null
  }

  // Fallback: get the highest-ranked accepted suggestion
  const acceptedMatch = item.rfp_match_suggestions.find((m) => m.status === 'accepted')
  return acceptedMatch || null
}

/**
 * Get human-readable status label in Portuguese
 * - accepted/manual both show as "Selecionado" (manual uses blue color as hint in UI)
 * - rejected shows as "Sem correspondencia" (same as no AI match)
 */
function getStatusLabel(status: RFPItemWithMatches['review_status'], hasMatch: boolean): string {
  switch (status) {
    case 'accepted':
    case 'manual':
      return 'Selecionado'
    case 'rejected':
      return 'Sem correspondencia'
    case 'pending':
      return hasMatch ? 'Pendente' : 'Sem correspondencia'
    default:
      return status
  }
}

/**
 * Transform RFP items to flat export rows
 * @param items - RFP items with match suggestions
 * @param confirmedOnly - If true, only include accepted/manual items
 * @param columnConfig - Column configuration (uses defaults if not provided)
 * @returns Array of flat export rows
 */
export function transformToExportRows(
  items: RFPItemWithMatches[],
  confirmedOnly: boolean = false,
  columnConfig: ExportColumnMapping[] = DEFAULT_EXPORT_COLUMNS
): Record<string, unknown>[] {
  const filteredItems = confirmedOnly
    ? items.filter((i) => i.review_status === 'accepted' || i.review_status === 'manual')
    : items

  return filteredItems.map((item) => {
    const match = getSelectedMatch(item)
    const row: Record<string, unknown> = {}

    columnConfig.forEach((col) => {
      let value: unknown

      if (col.source === 'rfp_items') {
        // Get value from item - use type assertion via unknown for dynamic access
        value = (item as unknown as Record<string, unknown>)[col.key]
      } else {
        // Get value from match - use type assertion via unknown for dynamic access
        value = match ? (match as unknown as Record<string, unknown>)[col.key] : null
      }

      row[col.header] = formatValue(value, col.type)
    })

    // Always add status column (not from config)
    const hasAnyMatch = item.rfp_match_suggestions.length > 0
    row['Status'] = getStatusLabel(item.review_status, hasAnyMatch)

    return row
  })
}

/**
 * Calculate export summary statistics
 */
export function calculateExportSummary(items: RFPItemWithMatches[]): ExportSummary {
  const noMatchItems = items.filter(
    (i) => i.review_status === 'pending' && i.rfp_match_suggestions.length === 0
  ).length

  return {
    totalItems: items.length,
    confirmedCount: items.filter((i) => i.review_status === 'accepted').length,
    rejectedCount: items.filter((i) => i.review_status === 'rejected').length,
    manualCount: items.filter((i) => i.review_status === 'manual').length,
    noMatchCount: noMatchItems,
  }
}

/**
 * Export RFP data to Excel file (browser download)
 * @param items - RFP items with match suggestions
 * @param confirmedOnly - If true, only include accepted/manual items
 * @param filename - Base filename (without extension)
 * @param columnConfig - Optional column config (fetches from DB if not provided)
 */
export async function exportRFPToExcel(
  items: RFPItemWithMatches[],
  confirmedOnly: boolean = false,
  filename: string = 'RFP_Resultados',
  columnConfig?: ExportColumnMapping[]
): Promise<void> {
  // Fetch config if not provided
  const config = columnConfig || await getExportColumnConfig()

  const exportData = transformToExportRows(items, confirmedOnly, config)

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados RFP')

  // Auto-size columns based on content
  const headers = [...config.map(c => c.header), 'Status']
  const maxWidths = headers.map((header) => {
    const headerWidth = header.length
    const dataWidths = exportData.map((row) => String(row[header] ?? '').length)
    return Math.min(Math.max(headerWidth, ...dataWidths) + 2, 50)
  })
  worksheet['!cols'] = maxWidths.map((w) => ({ wch: w }))

  // Generate buffer and download
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  })

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  const dateStr = new Date().toISOString().split('T')[0]
  saveAs(blob, `${filename}_${dateStr}.xlsx`)
}

/**
 * Generate Excel file as base64 for email attachment
 * @param items - RFP items with match suggestions
 * @param confirmedOnly - If true, only include accepted/manual items
 * @param columnConfig - Optional column config (fetches from DB if not provided)
 * @returns Base64 encoded Excel file
 */
export async function generateExcelBase64(
  items: RFPItemWithMatches[],
  confirmedOnly: boolean = false,
  columnConfig?: ExportColumnMapping[]
): Promise<string> {
  const config = columnConfig || await getExportColumnConfig()
  const exportData = transformToExportRows(items, confirmedOnly, config)

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados RFP')

  const headers = [...config.map(c => c.header), 'Status']
  const maxWidths = headers.map((header) => {
    const headerWidth = header.length
    const dataWidths = exportData.map((row) => String(row[header] ?? '').length)
    return Math.min(Math.max(headerWidth, ...dataWidths) + 2, 50)
  })
  worksheet['!cols'] = maxWidths.map((w) => ({ wch: w }))

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' })
}

/**
 * Generate filename for export
 */
export function generateExportFilename(prefix: string = 'RFP_Resultados'): string {
  const dateStr = new Date().toISOString().split('T')[0]
  return `${prefix}_${dateStr}.xlsx`
}

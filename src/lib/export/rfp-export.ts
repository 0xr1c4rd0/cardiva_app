import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { RFPItemWithMatches, MatchSuggestion } from '@/types/rfp'

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
 * Export column configuration with Portuguese headers
 */
export const RFP_EXPORT_COLUMNS = [
  { key: 'lote' as const, header: 'Lote' },
  { key: 'posicao' as const, header: 'Posição' },
  { key: 'artigo_pedido' as const, header: 'Artigo Pedido' },
  { key: 'descricao_pedido' as const, header: 'Descrição Pedido' },
  { key: 'quantidade' as const, header: 'Quantidade' },
  { key: 'codigo_spms' as const, header: 'Cód. SPMS' },
  { key: 'artigo_match' as const, header: 'Artigo Match' },
  { key: 'descricao_match' as const, header: 'Descrição Match' },
  { key: 'preco_unit' as const, header: 'Preço Unit.' },
  { key: 'similaridade' as const, header: 'Similaridade' },
  { key: 'tipo_match' as const, header: 'Tipo' },
  { key: 'status' as const, header: 'Status' },
]

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
 * - rejected shows as "Sem correspondência" (same as no AI match)
 */
function getStatusLabel(status: RFPItemWithMatches['review_status'], hasMatch: boolean): string {
  switch (status) {
    case 'accepted':
    case 'manual':
      return 'Selecionado'
    case 'rejected':
      return 'Sem correspondência'
    case 'pending':
      return hasMatch ? 'Pendente' : 'Sem correspondência'
    default:
      return status
  }
}

/**
 * Transform RFP items to flat export rows
 * @param items - RFP items with match suggestions
 * @param confirmedOnly - If true, only include accepted/manual items
 * @returns Array of flat export rows
 */
export function transformToExportRows(
  items: RFPItemWithMatches[],
  confirmedOnly: boolean = false
): RFPExportRow[] {
  const filteredItems = confirmedOnly
    ? items.filter((i) => i.review_status === 'accepted' || i.review_status === 'manual')
    : items

  return filteredItems.map((item) => {
    const match = getSelectedMatch(item)
    const hasAnyMatch = item.rfp_match_suggestions.length > 0

    return {
      lote: item.lote_pedido,
      posicao: item.posicao_pedido,
      artigo_pedido: item.artigo_pedido,
      descricao_pedido: item.descricao_pedido,
      quantidade: item.quantidade_pedido,
      codigo_spms: match?.codigo_spms || null,
      artigo_match: match?.artigo || null,
      descricao_match: match?.descricao || null,
      preco_unit: match?.preco || null,
      similaridade: match ? `${Math.round(match.similarity_score * 100)}%` : '-',
      tipo_match: match?.match_type || null,
      status: getStatusLabel(item.review_status, hasAnyMatch),
    }
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
 */
export function exportRFPToExcel(
  items: RFPItemWithMatches[],
  confirmedOnly: boolean = false,
  filename: string = 'RFP_Resultados'
): void {
  const exportRows = transformToExportRows(items, confirmedOnly)

  // Transform to include only specified columns with custom headers
  const exportData = exportRows.map((row) => {
    const exportRow: Record<string, unknown> = {}
    RFP_EXPORT_COLUMNS.forEach((col) => {
      exportRow[col.header] = row[col.key]
    })
    return exportRow
  })

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados RFP')

  // Auto-size columns based on content
  const maxWidths = RFP_EXPORT_COLUMNS.map((col) => {
    const headerWidth = col.header.length
    const dataWidths = exportData.map((row) => String(row[col.header] ?? '').length)
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
 * @returns Base64 encoded Excel file
 */
export function generateExcelBase64(
  items: RFPItemWithMatches[],
  confirmedOnly: boolean = false
): string {
  const exportRows = transformToExportRows(items, confirmedOnly)

  // Transform to include only specified columns with custom headers
  const exportData = exportRows.map((row) => {
    const exportRow: Record<string, unknown> = {}
    RFP_EXPORT_COLUMNS.forEach((col) => {
      exportRow[col.header] = row[col.key]
    })
    return exportRow
  })

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultados RFP')

  // Auto-size columns
  const maxWidths = RFP_EXPORT_COLUMNS.map((col) => {
    const headerWidth = col.header.length
    const dataWidths = exportData.map((row) => String(row[col.header] ?? '').length)
    return Math.min(Math.max(headerWidth, ...dataWidths) + 2, 50)
  })
  worksheet['!cols'] = maxWidths.map((w) => ({ wch: w }))

  // Generate as base64
  const excelBase64 = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'base64',
  })

  return excelBase64
}

/**
 * Generate filename for export
 */
export function generateExportFilename(prefix: string = 'RFP_Resultados'): string {
  const dateStr = new Date().toISOString().split('T')[0]
  return `${prefix}_${dateStr}.xlsx`
}

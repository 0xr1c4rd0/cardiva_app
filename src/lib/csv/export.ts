import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export interface ExportColumn<T> {
  key: keyof T
  header: string
}

export interface ExportOptions {
  filename?: string
  sheetName?: string
}

/**
 * Export data to Excel (.xlsx) format
 * Generates file in browser and triggers download
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions = {}
): void {
  const { filename = 'export', sheetName = 'Data' } = options

  // Transform data to include only specified columns with custom headers
  const exportData = data.map((row) => {
    const exportRow: Record<string, unknown> = {}
    columns.forEach((col) => {
      exportRow[col.header] = row[col.key]
    })
    return exportRow
  })

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Auto-size columns based on content
  const maxWidths = columns.map((col) => {
    const headerWidth = col.header.length
    const dataWidths = exportData.map((row) =>
      String(row[col.header] ?? '').length
    )
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
  saveAs(blob, `${filename}-${dateStr}.xlsx`)
}

/**
 * Export data to CSV format
 * Generates file in browser and triggers download
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename = 'export'
): void {
  // Transform data to include only specified columns with custom headers
  const exportData = data.map((row) => {
    const exportRow: Record<string, unknown> = {}
    columns.forEach((col) => {
      exportRow[col.header] = row[col.key]
    })
    return exportRow
  })

  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const csv = XLSX.utils.sheet_to_csv(worksheet)

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const dateStr = new Date().toISOString().split('T')[0]
  saveAs(blob, `${filename}-${dateStr}.csv`)
}

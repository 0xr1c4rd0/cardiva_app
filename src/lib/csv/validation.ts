import { z } from 'zod'

// Inventory row schema - adapt field names to match artigos table
// Using flexible schema since column structure is dynamic
export const inventoryRowSchema = z.object({
  codigo: z.string().min(1, 'Code is required').optional(),
  nome: z.string().min(1, 'Name is required').optional(),
  // Accept both number and string for price/stock (CSV parsing may vary)
  preco: z.union([
    z.number().positive('Price must be positive'),
    z.string().transform((val) => {
      const num = parseFloat(val.replace(',', '.'))
      if (isNaN(num) || num < 0) return null
      return num
    }),
    z.null(),
  ]).optional(),
  stock: z.union([
    z.number().int().min(0, 'Stock cannot be negative'),
    z.string().transform((val) => {
      const num = parseInt(val, 10)
      if (isNaN(num) || num < 0) return null
      return num
    }),
    z.null(),
  ]).optional(),
}).passthrough() // Allow additional fields

export type InventoryRow = z.infer<typeof inventoryRowSchema>

export interface ValidationError {
  row: number
  field: string
  message: string
}

export interface ValidationWarning {
  row: number
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  validRowCount: number
  totalRowCount: number
}

export function validateCSVData(
  data: Record<string, unknown>[]
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  let validRowCount = 0

  // Check for empty file
  if (data.length === 0) {
    errors.push({ row: 0, field: 'file', message: 'CSV file is empty' })
    return { valid: false, errors, warnings, validRowCount: 0, totalRowCount: 0 }
  }

  // Check for headers
  const headers = Object.keys(data[0] || {})
  if (headers.length === 0) {
    errors.push({ row: 0, field: 'headers', message: 'No columns found in CSV' })
    return { valid: false, errors, warnings, validRowCount: 0, totalRowCount: 0 }
  }

  // Validate each row (basic validation - n8n does full processing)
  data.forEach((row, index) => {
    const rowNumber = index + 2 // +2: index 0 = row 2 (after header)

    // Check if row has any data
    const hasData = Object.values(row).some(
      (v) => v !== null && v !== undefined && v !== ''
    )

    if (!hasData) {
      warnings.push({
        row: rowNumber,
        field: 'row',
        message: 'Empty row detected',
      })
    } else {
      validRowCount++
    }
  })

  // Check for duplicate codes if 'codigo' column exists
  if (headers.includes('codigo')) {
    const codes = data.map((r) => r.codigo).filter(Boolean) as string[]
    const duplicates = findDuplicates(codes)
    duplicates.forEach((code) => {
      warnings.push({
        row: 0,
        field: 'codigo',
        message: `Duplicate code found: ${code}`,
      })
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validRowCount,
    totalRowCount: data.length,
  }
}

function findDuplicates(arr: string[]): string[] {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  arr.forEach((item) => {
    if (item && seen.has(item)) {
      duplicates.add(item)
    }
    seen.add(item)
  })

  return Array.from(duplicates)
}

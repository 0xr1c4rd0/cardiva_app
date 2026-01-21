# Phase 4: Inventory Management - Research

**Researched:** 2026-01-21
**Domain:** CSV file upload, client-side validation, n8n webhook integration, Excel export, permission-based UI
**Confidence:** HIGH

## Summary

Phase 4 implements inventory management features: CSV upload with validation, n8n webhook integration for processing, Excel export, and permission-based access control. The research reveals a clear standard approach for each component.

Key findings:
- **CSV Upload**: react-dropzone provides drag-and-drop file selection with validation; Papa Parse handles client-side CSV parsing with comprehensive error handling
- **CSV Validation**: Zod schemas validate parsed CSV data before submission; client-side validation catches errors early
- **n8n Integration**: Fire-and-forget pattern with immediate response mode; webhook triggers workflow without waiting for completion
- **Excel Export**: SheetJS (xlsx) library for browser-side Excel generation; file-saver for download trigger
- **Permission UI**: JWT role extraction already implemented; conditional rendering based on `getUserRole()` utility

**Key insight**: CSV upload does NOT directly insert into database - it creates a job record, triggers n8n webhook, and shows processing status. This fire-and-forget pattern keeps the UI responsive while n8n handles the heavy lifting asynchronously.

**Primary recommendation**: Implement react-dropzone + Papa Parse for upload/parsing, Zod for validation schema, fetch with fire-and-forget for n8n webhook, SheetJS for export, and role-based conditional rendering using existing auth utilities.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-dropzone | ^14.2+ | Drag-and-drop file upload | Industry standard for file upload UX, hooks-based API, file validation built-in |
| papaparse | ^5.4+ | CSV parsing | Fastest browser CSV parser, handles edge cases, streaming for large files |
| xlsx (SheetJS) | ^0.18+ | Excel export | Most widely used JS spreadsheet library, browser-native, no server needed |
| file-saver | ^2.0+ | File download trigger | Standard companion to xlsx for browser downloads |
| zod | ^4.3+ | CSV validation schemas | Already in project, type-safe validation, composable schemas |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn-dropzone | latest | Pre-built dropzone UI | Optional: if want styled dropzone matching shadcn design |
| csv-file-validator | latest | Header/column validation | Optional: if need complex column mapping validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-dropzone | native HTML5 input | More work for drag-drop UX, less validation options |
| Papa Parse | d3-dsv | Papa Parse faster, better error handling, streaming support |
| SheetJS | ExcelJS | ExcelJS has more styling options but larger bundle, more complex API |
| Zod schemas | csv-file-validator | Zod already in project, consistent with other validation |

**Installation:**
```bash
npm install react-dropzone papaparse xlsx file-saver
npm install -D @types/papaparse
```

**Note on React 19 Compatibility:** react-dropzone currently supports React 18. For React 19 (used in Next.js 16), installation may require `--legacy-peer-deps` flag until the library updates its peer dependencies.

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (dashboard)/
│   └── inventory/
│       ├── page.tsx                    # Server Component: inventory list + actions
│       ├── components/
│       │   ├── inventory-table.tsx     # Existing table component
│       │   ├── csv-upload-dialog.tsx   # Client: upload modal with dropzone
│       │   ├── csv-preview.tsx         # Client: validation results preview
│       │   ├── csv-dropzone.tsx        # Client: drag-drop file input
│       │   ├── export-button.tsx       # Client: Excel export trigger
│       │   └── permission-gate.tsx     # Client: conditional render wrapper
│       └── actions.ts                  # Server Actions for upload job creation
lib/
├── csv/
│   ├── validation.ts                   # Zod schemas for CSV validation
│   ├── parser.ts                       # Papa Parse wrapper with type safety
│   └── export.ts                       # SheetJS export utilities
├── n8n/
│   └── webhook.ts                      # n8n webhook client
└── auth/
    └── utils.ts                        # Existing: getUserRole(), isAdmin()
```

### Pattern 1: CSV Upload with Client-Side Validation
**What:** User drops CSV, client parses and validates, preview shown, then triggers server action
**When to use:** CSV upload flow (INV-06, INV-07)

**Example:**
```typescript
// app/(dashboard)/inventory/components/csv-upload-dialog.tsx
'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import { validateCSVData } from '@/lib/csv/validation'
import { triggerInventoryUpload } from '../actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'

interface CSVUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ValidationResult {
  valid: boolean
  data: Record<string, unknown>[]
  errors: Array<{ row: number; field: string; message: string }>
  warnings: Array<{ row: number; field: string; message: string }>
}

export function CSVUploadDialog({ open, onOpenChange }: CSVUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0]
    if (!csvFile) return

    setFile(csvFile)
    setIsValidating(true)

    // Parse CSV client-side
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        // Validate parsed data
        const validation = validateCSVData(results.data as Record<string, unknown>[])
        setValidationResult({
          valid: validation.errors.length === 0,
          data: results.data as Record<string, unknown>[],
          errors: validation.errors,
          warnings: validation.warnings,
        })
        setIsValidating(false)
      },
      error: (error) => {
        setValidationResult({
          valid: false,
          data: [],
          errors: [{ row: 0, field: 'file', message: error.message }],
          warnings: [],
        })
        setIsValidating(false)
      },
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  })

  const handleUpload = async () => {
    if (!file || !validationResult?.valid) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('rowCount', String(validationResult.data.length))

      const result = await triggerInventoryUpload(formData)

      if (result.success) {
        onOpenChange(false)
        // Show success toast - job created, processing started
      } else {
        // Show error
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Inventory CSV</DialogTitle>
        </DialogHeader>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${file ? 'border-green-500 bg-green-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center justify-center gap-2">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <span className="font-medium">{file.name}</span>
            </div>
          ) : isDragActive ? (
            <p>Drop the CSV file here...</p>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <p>Drag and drop a CSV file, or click to select</p>
              <p className="text-sm text-muted-foreground">Max file size: 10MB</p>
            </div>
          )}
        </div>

        {/* Validation Results */}
        {isValidating && <p>Validating...</p>}

        {validationResult && !isValidating && (
          <div className="space-y-4">
            {validationResult.valid ? (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  {validationResult.data.length} rows validated successfully
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {validationResult.errors.length} validation errors found
                </AlertDescription>
              </Alert>
            )}

            {/* Error details */}
            {validationResult.errors.length > 0 && (
              <div className="max-h-48 overflow-y-auto text-sm">
                {validationResult.errors.slice(0, 10).map((error, i) => (
                  <p key={i} className="text-red-600">
                    Row {error.row}: {error.field} - {error.message}
                  </p>
                ))}
                {validationResult.errors.length > 10 && (
                  <p className="text-muted-foreground">
                    ...and {validationResult.errors.length - 10} more errors
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!validationResult?.valid || isUploading}
          >
            {isUploading ? 'Processing...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Pattern 2: Zod Schema for CSV Validation
**What:** Define expected CSV structure with Zod, validate each row
**When to use:** Validating parsed CSV data before upload

**Example:**
```typescript
// lib/csv/validation.ts
import { z } from 'zod'

// Define expected CSV row schema
// Adapt field names to match your artigos table structure
export const inventoryRowSchema = z.object({
  codigo: z.string().min(1, 'Code is required'),
  nome: z.string().min(1, 'Name is required'),
  preco: z.union([
    z.number().positive('Price must be positive'),
    z.string().transform((val) => {
      const num = parseFloat(val.replace(',', '.'))
      if (isNaN(num)) throw new Error('Invalid price')
      return num
    }),
  ]).optional(),
  stock: z.union([
    z.number().int().min(0, 'Stock cannot be negative'),
    z.string().transform((val) => {
      const num = parseInt(val, 10)
      if (isNaN(num)) throw new Error('Invalid stock')
      return num
    }),
  ]).optional(),
  // Add more fields as needed based on your schema
})

export type InventoryRow = z.infer<typeof inventoryRowSchema>

interface ValidationError {
  row: number
  field: string
  message: string
}

interface ValidationWarning {
  row: number
  field: string
  message: string
}

interface ValidationResult {
  errors: ValidationError[]
  warnings: ValidationWarning[]
  validRows: InventoryRow[]
}

export function validateCSVData(
  data: Record<string, unknown>[]
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const validRows: InventoryRow[] = []

  // Check for required headers
  if (data.length === 0) {
    errors.push({ row: 0, field: 'file', message: 'CSV file is empty' })
    return { errors, warnings, validRows }
  }

  const headers = Object.keys(data[0])
  const requiredHeaders = ['codigo', 'nome']
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

  if (missingHeaders.length > 0) {
    errors.push({
      row: 0,
      field: 'headers',
      message: `Missing required columns: ${missingHeaders.join(', ')}`,
    })
    return { errors, warnings, validRows }
  }

  // Validate each row
  data.forEach((row, index) => {
    const rowNumber = index + 2 // +2 because index 0 = row 2 (after header)

    const result = inventoryRowSchema.safeParse(row)

    if (!result.success) {
      result.error.errors.forEach((err) => {
        errors.push({
          row: rowNumber,
          field: err.path.join('.') || 'row',
          message: err.message,
        })
      })
    } else {
      validRows.push(result.data)
    }
  })

  // Add warnings for common issues
  const duplicateCodes = findDuplicates(data.map((r) => r.codigo as string))
  duplicateCodes.forEach((code) => {
    warnings.push({
      row: 0,
      field: 'codigo',
      message: `Duplicate code found: ${code}`,
    })
  })

  return { errors, warnings, validRows }
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
```

### Pattern 3: Fire-and-Forget n8n Webhook Integration
**What:** Create job record, trigger webhook without waiting, return immediately
**When to use:** CSV upload triggers n8n workflow (INV-08)

**Example:**
```typescript
// app/(dashboard)/inventory/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserRole } from '@/lib/auth/utils'
import { triggerN8nWebhook } from '@/lib/n8n/webhook'

export async function triggerInventoryUpload(formData: FormData) {
  const supabase = await createClient()

  // Check permission
  const role = await getUserRole()
  if (role !== 'admin') {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const file = formData.get('file') as File
  const rowCount = parseInt(formData.get('rowCount') as string, 10)

  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  // Read file content
  const fileContent = await file.text()

  // Create upload job record
  const { data: job, error: jobError } = await supabase
    .from('inventory_upload_jobs')
    .insert({
      user_id: user.id,
      file_name: file.name,
      row_count: rowCount,
      status: 'pending',
    })
    .select()
    .single()

  if (jobError) {
    return { success: false, error: 'Failed to create upload job' }
  }

  // Fire-and-forget: trigger n8n webhook without awaiting
  // The webhook will update job status when complete
  triggerN8nWebhook({
    jobId: job.id,
    csvContent: fileContent,
    fileName: file.name,
    userId: user.id,
  }).catch((error) => {
    // Log error but don't fail the request
    console.error('Failed to trigger n8n webhook:', error)
  })

  revalidatePath('/inventory')

  return {
    success: true,
    jobId: job.id,
    message: 'Upload started. Processing in background.',
  }
}

// lib/n8n/webhook.ts
interface WebhookPayload {
  jobId: string
  csvContent: string
  fileName: string
  userId: string
}

export async function triggerN8nWebhook(payload: WebhookPayload): Promise<void> {
  const webhookUrl = process.env.N8N_INVENTORY_WEBHOOK_URL

  if (!webhookUrl) {
    throw new Error('N8N_INVENTORY_WEBHOOK_URL not configured')
  }

  // Fire-and-forget: don't await the response
  // n8n webhook is configured to respond "immediately"
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Optional: add authentication header if n8n webhook requires it
      // 'Authorization': `Bearer ${process.env.N8N_WEBHOOK_SECRET}`,
    },
    body: JSON.stringify(payload),
  })
}
```

### Pattern 4: Excel Export with SheetJS
**What:** Generate Excel file in browser, trigger download
**When to use:** Export inventory to Excel (INV-09)

**Example:**
```typescript
// lib/csv/export.ts
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface ExportOptions {
  filename?: string
  sheetName?: string
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[],
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

  // Auto-size columns
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

  saveAs(blob, `${filename}.xlsx`)
}

// Export to CSV (simpler alternative)
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[],
  filename = 'export'
): void {
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
  saveAs(blob, `${filename}.csv`)
}
```

```typescript
// app/(dashboard)/inventory/components/export-button.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { exportToExcel, exportToCSV } from '@/lib/csv/export'
import { Artigo, InventoryColumnConfig } from '@/lib/supabase/types'

interface ExportButtonProps {
  data: Artigo[]
  columnConfig: InventoryColumnConfig[]
  disabled?: boolean
}

export function ExportButton({ data, columnConfig, disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const columns = columnConfig.map((col) => ({
    key: col.column_name as keyof Artigo,
    header: col.display_name,
  }))

  const handleExportExcel = () => {
    setIsExporting(true)
    try {
      exportToExcel(data, columns, {
        filename: `inventory-${new Date().toISOString().split('T')[0]}`,
        sheetName: 'Inventory',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = () => {
    setIsExporting(true)
    try {
      exportToCSV(
        data,
        columns,
        `inventory-${new Date().toISOString().split('T')[0]}`
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled || isExporting}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export as Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Pattern 5: Permission-Based UI Rendering
**What:** Conditionally render UI elements based on user role
**When to use:** Show upload/modify features only to authorized users (INV-10)

**Example:**
```typescript
// app/(dashboard)/inventory/components/permission-gate.tsx
'use client'

import { ReactNode } from 'react'

interface PermissionGateProps {
  children: ReactNode
  requiredRole: 'admin' | 'user'
  userRole: string | null
  fallback?: ReactNode
}

export function PermissionGate({
  children,
  requiredRole,
  userRole,
  fallback = null,
}: PermissionGateProps) {
  // Admin can access everything
  if (userRole === 'admin') {
    return <>{children}</>
  }

  // Check specific role requirement
  if (requiredRole === 'user' && userRole === 'user') {
    return <>{children}</>
  }

  // Not authorized - return fallback or nothing
  return <>{fallback}</>
}
```

```typescript
// app/(dashboard)/inventory/page.tsx - Updated with permission check
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/utils'
import { InventoryTable } from './components/inventory-table'
import { CSVUploadButton } from './components/csv-upload-button'
import { ExportButton } from './components/export-button'
import { PermissionGate } from './components/permission-gate'

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  // ... existing data fetching code ...

  const userRole = await getUserRole()

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <p className="text-muted-foreground">
            Browse and manage your product catalog
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export available to all authenticated users */}
          <ExportButton data={data ?? []} columnConfig={visibleColumns} />

          {/* Upload only for admin users */}
          <PermissionGate requiredRole="admin" userRole={userRole}>
            <CSVUploadButton />
          </PermissionGate>
        </div>
      </div>

      <InventoryTable
        data={data ?? []}
        totalCount={count ?? 0}
        categories={categories}
        columnConfig={visibleColumns}
        categoryColumnName={categoryColumn?.column_name}
        initialState={initialState}
      />
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Anti-pattern: Uploading CSV directly to database from client**: Never let client-side code insert directly into production tables. Always go through server action that validates and triggers n8n workflow.

- **Anti-pattern: Awaiting n8n webhook response**: n8n workflows can take minutes. Fire-and-forget pattern returns immediately; poll job status separately.

- **Anti-pattern: Server-side CSV parsing for large files**: Parse CSV on client side with Papa Parse. Server receives validated, pre-parsed data or triggers n8n to process.

- **Anti-pattern: Checking permissions only in UI**: Always verify permissions in server actions. UI hiding is for UX, not security.

- **Anti-pattern: Loading entire dataset for export**: For very large datasets, implement server-side export or paginated export. For 20k items, client-side export is still feasible.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag-and-drop file upload | Custom drag/drop handlers | react-dropzone | Handles all browser quirks, file type validation, multiple files |
| CSV parsing | String.split() or regex | Papa Parse | Edge cases (quotes, escapes, delimiters), streaming, error reporting |
| CSV validation | Manual field checking | Zod schemas | Type-safe, composable, consistent with other validation |
| Excel generation | Manual XML building | SheetJS (xlsx) | Handles all Excel format complexity, cross-browser compatible |
| File download | Creating blob manually | file-saver | Browser compatibility, proper MIME types, filename handling |
| Permission checking | Custom role flags | JWT role extraction | Already implemented in auth/utils.ts, consistent with RBAC pattern |

**Key insight:** Client-side validation with Papa Parse + Zod catches 90% of user errors before hitting the server. This provides instant feedback and reduces unnecessary n8n workflow triggers.

## Common Pitfalls

### Pitfall 1: Not Handling CSV Encoding Issues
**What goes wrong:** Portuguese characters (accents, cedilla) appear corrupted. File shows wrong data.

**Why it happens:** CSV files may have different encodings (UTF-8, ISO-8859-1, Windows-1252). Papa Parse defaults to UTF-8.

**How to avoid:**
```typescript
Papa.parse(file, {
  encoding: 'UTF-8', // Try UTF-8 first
  complete: (results, file) => {
    // Check for encoding issues (replacement characters)
    const hasEncodingIssues = JSON.stringify(results.data).includes('\uFFFD')
    if (hasEncodingIssues) {
      // Retry with different encoding
      Papa.parse(file, {
        encoding: 'ISO-8859-1',
        complete: (retryResults) => {
          // Use retry results
        }
      })
    }
  }
})
```

**Warning signs:** Characters like "Descri????o" instead of "Descricao", or "?" symbols in text.

### Pitfall 2: n8n Webhook Timeout on Large Files
**What goes wrong:** Webhook call fails with timeout error. Job never starts processing.

**Why it happens:** n8n Cloud has 100-second timeout via Cloudflare. Large CSVs take longer to transmit.

**How to avoid:**
- Don't send CSV content in webhook body
- Store CSV in Supabase Storage, send URL to n8n
- n8n workflow fetches file from storage

```typescript
// Better pattern: Upload to storage first
const { data: storageData } = await supabase.storage
  .from('csv-uploads')
  .upload(`${job.id}.csv`, file)

// Webhook receives URL, not content
triggerN8nWebhook({
  jobId: job.id,
  fileUrl: storageData.path,
  // Not: csvContent
})
```

**Warning signs:** 524 timeout errors, inconsistent job creation, large files failing.

### Pitfall 3: Client Memory Issues with Very Large CSVs
**What goes wrong:** Browser tab crashes or becomes unresponsive when parsing large CSV.

**Why it happens:** Papa Parse loads entire file into memory by default.

**How to avoid:** Use streaming for large files:
```typescript
Papa.parse(file, {
  step: (row, parser) => {
    // Process row by row
    // Can pause/resume
    if (rowCount > 100000) {
      parser.abort()
      // Show error: file too large
    }
  },
  complete: () => {
    // All rows processed
  }
})
```

**Warning signs:** Browser freezing, "Page unresponsive" dialogs, memory warnings.

### Pitfall 4: Export Button Blocking UI
**What goes wrong:** Page freezes during Excel export. User thinks app crashed.

**Why it happens:** SheetJS export is CPU-intensive for large datasets.

**How to avoid:**
```typescript
const handleExport = async () => {
  setIsExporting(true)
  // Use setTimeout to let React update UI first
  setTimeout(() => {
    try {
      exportToExcel(data, columns)
    } finally {
      setIsExporting(false)
    }
  }, 0)
}
```

Or use Web Worker for very large exports (>50k rows).

**Warning signs:** Export button shows loading but page unresponsive, no visual feedback.

### Pitfall 5: Permission Check Only in Client Component
**What goes wrong:** User with modified JWT or direct API access can trigger upload.

**Why it happens:** UI hides button but server action doesn't verify.

**How to avoid:**
```typescript
// ALWAYS check in server action
export async function triggerInventoryUpload(formData: FormData) {
  const role = await getUserRole()
  if (role !== 'admin') {
    return { success: false, error: 'Unauthorized' }
  }
  // Proceed with upload
}
```

**Warning signs:** Security audit failures, unauthorized data modifications.

### Pitfall 6: Not Tracking Upload Job Status
**What goes wrong:** User uploads CSV, sees success, but doesn't know when processing completes.

**Why it happens:** Fire-and-forget means no immediate feedback on processing status.

**How to avoid:**
- Create job status table
- Show pending jobs in UI
- n8n workflow updates job status on completion
- Optional: Poll job status or use Supabase real-time

```sql
CREATE TABLE inventory_upload_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  row_count INTEGER,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Warning signs:** Users confused about upload status, duplicate uploads, support tickets.

## Code Examples

Verified patterns from official sources:

### Papa Parse with Error Handling
```typescript
// Source: Papa Parse documentation
import Papa from 'papaparse'

function parseCSVFile(
  file: File,
  onComplete: (data: unknown[], errors: Papa.ParseError[]) => void
) {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: true,
    transformHeader: (header) => header.trim().toLowerCase(),
    complete: (results) => {
      onComplete(results.data, results.errors)
    },
    error: (error) => {
      onComplete([], [error])
    },
  })
}
```

### react-dropzone with Validation
```typescript
// Source: react-dropzone documentation
import { useDropzone, FileRejection } from 'react-dropzone'

function CSVDropzone({ onFileDrop }: { onFileDrop: (file: File) => void }) {
  const onDrop = useCallback((
    acceptedFiles: File[],
    rejectedFiles: FileRejection[]
  ) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      const error = rejection.errors[0]
      // Handle error: file-too-large, file-invalid-type, etc.
      console.error(error.code, error.message)
      return
    }

    if (acceptedFiles.length > 0) {
      onFileDrop(acceptedFiles[0])
    }
  }, [onFileDrop])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div
      {...getRootProps()}
      className={`
        dropzone
        ${isDragActive ? 'active' : ''}
        ${isDragReject ? 'reject' : ''}
      `}
    >
      <input {...getInputProps()} />
      {/* Content */}
    </div>
  )
}
```

### SheetJS Export with Formatting
```typescript
// Source: SheetJS documentation
import * as XLSX from 'xlsx'

function createFormattedWorkbook(data: Record<string, unknown>[]) {
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Format currency columns (assumes column B is price)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    const cellRef = XLSX.utils.encode_cell({ r: row, c: 1 }) // Column B
    if (worksheet[cellRef]) {
      worksheet[cellRef].z = '#,##0.00 "EUR"' // Currency format
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

  return workbook
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side CSV parsing | Client-side with Papa Parse | Standard practice | Faster validation feedback, reduced server load |
| Direct database insert from CSV | Workflow trigger (n8n) | Architecture decision | Better error handling, async processing, audit trail |
| Sync webhook calls | Fire-and-forget + job tracking | Performance optimization | Non-blocking UI, scalable processing |
| Manual permission flags | JWT role claims | Phase 2 implementation | Consistent RBAC, secure authorization |
| react-csv-exporter | SheetJS (xlsx) | Bundle size optimization | Smaller, more features, better Excel compatibility |

**Deprecated/outdated:**
- **Sync file processing**: Block UI until processing complete - Use async job pattern instead
- **Server-side CSV parsing**: Parsing large files on server increases response time - Validate client-side
- **Direct API calls for export**: Generating exports on server - Use client-side generation for better UX

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal file size limit for client-side parsing**
   - What we know: Papa Parse handles large files with streaming
   - What's unclear: Performance threshold for this specific use case
   - Recommendation: Start with 10MB limit, monitor performance, adjust based on user feedback

2. **CSV template format for users**
   - What we know: Need to provide downloadable template
   - What's unclear: Exact columns required by n8n workflow
   - Recommendation: Create template based on artigos table schema, provide sample data

3. **n8n workflow error handling**
   - What we know: n8n will update job status
   - What's unclear: Specific error scenarios and recovery procedures
   - Recommendation: Define status enum (pending, processing, completed, failed, partial), n8n updates accordingly

4. **Export all pages vs current page**
   - What we know: Current page data is available client-side
   - What's unclear: Whether users need full dataset export
   - Recommendation: Start with current view export, add "Export All" option that fetches paginated data in chunks

5. **Permission granularity**
   - What we know: admin/user roles implemented
   - What's unclear: Whether "inventory" specific permission is needed vs admin role
   - Recommendation: Start with admin role check, add granular permissions if needed later

## Sources

### Primary (HIGH confidence)
- [react-dropzone Documentation](https://react-dropzone.js.org/) - useDropzone API, file validation
- [Papa Parse Documentation](https://www.papaparse.com/docs) - CSV parsing, streaming, error handling
- [SheetJS Documentation](https://docs.sheetjs.com/docs/) - Workbook creation, browser export
- [n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) - Response modes
- [n8n Respond to Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/) - Fire-and-forget pattern

### Secondary (MEDIUM confidence)
- [shadcn-dropzone GitHub](https://github.com/diragb/shadcn-dropzone) - shadcn-styled dropzone component
- [CSV validation with Zod - DEV Community](https://dev.to/bartoszgolebiowski/csv-validation-with-zod-h4b) - Zod validation patterns
- [react-papaparse Documentation](https://react-papaparse.js.org/) - React wrapper for Papa Parse
- [Implementing RBAC in React - Permit.io](https://www.permit.io/blog/implementing-react-rbac-authorization) - Permission-based UI patterns

### Tertiary (LOW confidence)
- Community tutorials on n8n + Next.js integration
- Various blog posts on Excel export patterns

## Metadata

**Confidence breakdown:**
- CSV Upload/Parsing: HIGH - react-dropzone and Papa Parse are industry standards with official docs
- CSV Validation: HIGH - Zod already in project, well-documented patterns
- n8n Integration: MEDIUM - Fire-and-forget pattern documented but specific integration untested
- Excel Export: HIGH - SheetJS is the standard, well-documented
- Permission UI: HIGH - Using existing getUserRole() utility from Phase 2

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable ecosystem, no major library changes expected)

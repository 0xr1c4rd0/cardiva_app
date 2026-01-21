'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CSVDropzone } from './csv-dropzone'
import { CSVPreview } from './csv-preview'
import { parseCSVFile } from '@/lib/csv/parser'
import { validateCSVData, ValidationResult } from '@/lib/csv/validation'

interface CSVUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (file: File, rowCount: number) => Promise<{ success: boolean; error?: string }>
}

export function CSVUploadDialog({ open, onOpenChange, onUpload }: CSVUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile)
    setValidation(null)
    setUploadError(null)
    setIsValidating(true)

    try {
      const parseResult = await parseCSVFile(selectedFile)

      if (parseResult.errors.length > 0) {
        setValidation({
          valid: false,
          errors: parseResult.errors.map((e) => ({
            row: e.row ?? 0,
            field: 'parse',
            message: e.message,
          })),
          warnings: [],
          validRowCount: 0,
          totalRowCount: 0,
        })
      } else {
        const result = validateCSVData(parseResult.data)
        setValidation(result)
      }
    } catch {
      setValidation({
        valid: false,
        errors: [{ row: 0, field: 'file', message: 'Failed to parse CSV file' }],
        warnings: [],
        validRowCount: 0,
        totalRowCount: 0,
      })
    } finally {
      setIsValidating(false)
    }
  }, [])

  const handleUpload = async () => {
    if (!file || !validation?.valid) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const result = await onUpload(file, validation.validRowCount)

      if (result.success) {
        // Reset state and close dialog
        setFile(null)
        setValidation(null)
        onOpenChange(false)
      } else {
        setUploadError(result.error ?? 'Upload failed')
      }
    } catch {
      setUploadError('An unexpected error occurred')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = (newOpen: boolean) => {
    if (!isUploading) {
      if (!newOpen) {
        // Reset state when closing
        setFile(null)
        setValidation(null)
        setUploadError(null)
      }
      onOpenChange(newOpen)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Inventory CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to update your inventory. The file will be validated before processing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <CSVDropzone
            onFileSelect={handleFileSelect}
            file={file}
            disabled={isUploading}
          />

          {(validation || isValidating) && (
            <CSVPreview validation={validation!} isValidating={isValidating} />
          )}

          {uploadError && (
            <p className="text-sm text-destructive">{uploadError}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!validation?.valid || isUploading || isValidating}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

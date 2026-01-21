'use client'

import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CSVDropzoneProps {
  onFileSelect: (file: File) => void
  file: File | null
  disabled?: boolean
}

export function CSVDropzone({ onFileSelect, file, disabled }: CSVDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        const error = rejection.errors[0]
        console.error('File rejected:', error.code, error.message)
        return
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive && !isDragReject && 'border-primary bg-primary/5',
        isDragReject && 'border-destructive bg-destructive/5',
        file && 'border-green-500 bg-green-50 dark:bg-green-950/20',
        disabled && 'opacity-50 cursor-not-allowed',
        !isDragActive && !file && 'border-muted-foreground/25 hover:border-muted-foreground/50'
      )}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="flex items-center justify-center gap-2">
          <FileSpreadsheet className="h-8 w-8 text-green-600 dark:text-green-400" />
          <div className="text-left">
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      ) : isDragActive ? (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-primary" />
          <p className="text-primary font-medium">Drop the CSV file here...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <p>Drag and drop a CSV file, or click to select</p>
          <p className="text-sm text-muted-foreground">Max file size: 10MB</p>
        </div>
      )}
    </div>
  )
}

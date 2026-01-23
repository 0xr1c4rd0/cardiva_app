'use client'

import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Upload, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PDFDropzoneProps {
  onFileSelect: (file: File) => void
  file: File | null
  disabled?: boolean
}

export function PDFDropzone({ onFileSelect, file, disabled }: PDFDropzoneProps) {
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
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB max for PDFs
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
          <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
          <div className="text-left">
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      ) : isDragActive ? (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-primary" />
          <p className="text-primary font-medium">Largue o ficheiro PDF aqui...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <p>Arraste e largue um ficheiro PDF, ou clique para selecionar</p>
          <p className="text-sm text-muted-foreground">Tamanho máximo: 50MB</p>
        </div>
      )}
    </div>
  )
}

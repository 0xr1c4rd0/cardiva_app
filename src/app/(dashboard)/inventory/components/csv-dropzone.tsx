'use client'

import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { CloudUpload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CSVDropzoneProps {
  onFileSelect: (file: File | null) => void
  file: File | null
  disabled?: boolean
}

/**
 * CSV Thumbnail component - displays a spreadsheet-like visual
 */
function CSVThumbnail() {
  return (
    <div className="w-full h-full bg-white p-1.5 flex flex-col gap-0.5">
      {/* Header row */}
      <div className="flex gap-0.5 h-2">
        <div className="flex-1 bg-primary/30 rounded-sm" />
        <div className="flex-1 bg-primary/30 rounded-sm" />
        <div className="flex-1 bg-primary/30 rounded-sm" />
      </div>
      {/* Data rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-0.5 h-1.5">
          <div className="flex-1 bg-muted rounded-sm" />
          <div className="flex-1 bg-muted rounded-sm" />
          <div className="flex-1 bg-muted rounded-sm" />
        </div>
      ))}
    </div>
  )
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

  const removeFile = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onFileSelect(null)
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
        'border-[3px] border-dashed rounded p-8 text-center cursor-pointer transition-colors',
        isDragActive && !isDragReject && 'border-primary bg-primary/5',
        isDragReject && 'border-destructive bg-destructive/5',
        file && 'border-primary/30 bg-white',
        disabled && 'opacity-50 cursor-not-allowed',
        !isDragActive && !file && 'border-primary/30 hover:border-primary/50'
      )}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="space-y-3">
          <div className="flex flex-wrap justify-center gap-3">
            <div className="group flex flex-col items-center gap-1.5 p-2 rounded bg-white">
              {/* Thumbnail container */}
              <div className="relative">
                {/* Remove button */}
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                  aria-label={`Remover ${file.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
                {/* CSV Thumbnail */}
                <div className="w-24 h-30 flex items-center justify-center rounded border border-primary/30 bg-white overflow-hidden shadow-sm">
                  <CSVThumbnail />
                </div>
              </div>

              {/* File name */}
              <p className="text-xs font-medium">
                {file.name}
              </p>
            </div>
          </div>
          <p className="text-xs">
            <span className="text-primary">1 ficheiro selecionado</span>
            <span className="text-muted-foreground"> • Clique para substituir</span>
          </p>
        </div>
      ) : isDragActive ? (
        <div className="space-y-2">
          <CloudUpload className="h-10 w-10 mx-auto text-primary" />
          <p className="text-primary font-medium">Largue o ficheiro CSV aqui...</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <CloudUpload className="h-10 w-10 mx-auto text-muted-foreground/70" />
          <div className="space-y-1.5">
            <p className="text-[15px] text-primary font-medium">Carregar inventário e atualizar produtos</p>
            <p className="text-sm text-foreground">Arraste e largue ou clique para carregar</p>
            <p className="text-xs text-muted-foreground">
              Ficheiro suportado: CSV • Tamanho máx: 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

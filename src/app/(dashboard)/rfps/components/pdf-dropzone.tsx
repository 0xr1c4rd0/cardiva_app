'use client'

import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Upload, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PDFDropzoneProps {
  onFilesSelect: (files: File[]) => void
  files: File[]
  disabled?: boolean
}

const MAX_FILES = 10

export function PDFDropzone({ onFilesSelect, files, disabled }: PDFDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        const error = rejection.errors[0]
        console.error('File rejected:', error.code, error.message)
        // Continue with accepted files even if some were rejected
      }

      if (acceptedFiles.length > 0) {
        // Combine with existing files, up to MAX_FILES
        const combined = [...files, ...acceptedFiles].slice(0, MAX_FILES)
        onFilesSelect(combined)
      }
    },
    [onFilesSelect, files]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    maxFiles: MAX_FILES,
    maxSize: 50 * 1024 * 1024, // 50MB max per PDF
    disabled,
    noClick: true, // Disable default click, we'll handle it manually
  })

  const handleClick = useCallback(() => {
    if (!disabled) {
      open()
    }
  }, [disabled, open])

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  return (
    <div
      {...getRootProps()}
      onClick={handleClick}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        isDragActive && !isDragReject && 'border-primary bg-primary/5',
        isDragReject && 'border-destructive bg-destructive/5',
        files.length > 0 && 'border-green-500 bg-green-50 dark:bg-green-950/20',
        disabled && 'opacity-50 cursor-not-allowed',
        !isDragActive && files.length === 0 && 'border-muted-foreground/25 hover:border-muted-foreground/50'
      )}
    >
      <input {...getInputProps()} />
      {files.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="text-left">
              <p className="font-medium">
                {files.length === 1
                  ? files[0].name
                  : `${files.length} ficheiros selecionados`
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {(totalSize / 1024 / 1024).toFixed(2)} MB total
              </p>
            </div>
          </div>
          {files.length > 1 && (
            <div className="text-xs text-muted-foreground max-h-20 overflow-auto">
              {files.map((f, i) => (
                <div key={i} className="truncate">{f.name}</div>
              ))}
            </div>
          )}
        </div>
      ) : isDragActive ? (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-primary" />
          <p className="text-primary font-medium">Largue os ficheiros PDF aqui...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
          <p>Arraste e largue ficheiros PDF, ou clique para selecionar</p>
          <p className="text-sm text-muted-foreground">
            Ate {MAX_FILES} ficheiros, 50MB max cada
          </p>
        </div>
      )}
    </div>
  )
}

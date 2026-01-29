'use client'

import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { CloudUpload, FileText, Sparkles } from 'lucide-react'
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

  return (
    <div
      {...getRootProps()}
      onClick={handleClick}
      className={cn(
        'border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors',
        isDragActive && !isDragReject && 'border-primary bg-primary/5',
        isDragReject && 'border-destructive bg-destructive/5',
        files.length > 0 && 'border-primary bg-primary/5',
        disabled && 'opacity-50 cursor-not-allowed',
        !isDragActive && files.length === 0 && 'border-primary/30 hover:border-primary/50'
      )}
    >
      <input {...getInputProps()} />
      {files.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-primary shrink-0" strokeWidth={1.5} />
            <p className="font-medium text-left text-sm">
              {files.length === 1
                ? files[0].name
                : `${files.length} ficheiros selecionados`
              }
            </p>
          </div>
          {files.length > 1 && (
            <div className="text-xs text-muted-foreground max-h-24 overflow-auto">
              {files.map((f, i) => (
                <div key={i} className="truncate">{f.name}</div>
              ))}
            </div>
          )}
        </div>
      ) : isDragActive ? (
        <div className="space-y-2">
          <CloudUpload className="h-10 w-10 mx-auto text-primary" />
          <p className="text-primary font-medium">Largue os ficheiros PDF aqui...</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <CloudUpload className="h-10 w-10 mx-auto text-muted-foreground/70" />
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 fill-primary" />
              <p className="text-[15px] text-primary font-medium">Carregar concursos e fazer match com inventário</p>
            </div>
            <p className="text-sm text-foreground">Arraste e largue ou clique para carregar</p>
            <p className="text-xs text-muted-foreground">
              Ficheiros suportados: PDF • Tamanho máx: 50MB • Até {MAX_FILES} ficheiros
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

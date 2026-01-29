'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { CloudUpload, FileText, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generatePDFThumbnail } from '@/lib/pdf-thumbnail'

interface PDFDropzoneProps {
  onFilesSelect: (files: File[]) => void
  files: File[]
  disabled?: boolean
}

const MAX_FILES = 10

export function PDFDropzone({ onFilesSelect, files, disabled }: PDFDropzoneProps) {
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map())
  const [loadingThumbnails, setLoadingThumbnails] = useState<Set<string>>(new Set())

  // Generate thumbnails when files change
  useEffect(() => {
    const generateThumbnails = async () => {
      for (const file of files) {
        // Skip if already have thumbnail or currently loading
        if (thumbnails.has(file.name) || loadingThumbnails.has(file.name)) {
          continue
        }

        // Mark as loading
        setLoadingThumbnails(prev => new Set(prev).add(file.name))

        try {
          const thumbnail = await generatePDFThumbnail(file, 120)
          setThumbnails(prev => new Map(prev).set(file.name, thumbnail))
        } catch (error) {
          console.error(`Failed to generate thumbnail for ${file.name}:`, error)
        } finally {
          setLoadingThumbnails(prev => {
            const next = new Set(prev)
            next.delete(file.name)
            return next
          })
        }
      }
    }

    if (files.length > 0) {
      generateThumbnails()
    }
  }, [files, thumbnails, loadingThumbnails])

  // Clean up thumbnails for removed files
  useEffect(() => {
    const fileNames = new Set(files.map(f => f.name))
    setThumbnails(prev => {
      const next = new Map(prev)
      for (const key of next.keys()) {
        if (!fileNames.has(key)) {
          next.delete(key)
        }
      }
      return next
    })
  }, [files])

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

  const removeFile = useCallback(
    (fileName: string, e: React.MouseEvent) => {
      e.stopPropagation()
      const filtered = files.filter(f => f.name !== fileName)
      onFilesSelect(filtered)
    },
    [files, onFilesSelect]
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
        'border-[3px] border-dashed rounded p-8 text-center cursor-pointer transition-colors',
        isDragActive && !isDragReject && 'border-primary bg-primary/5',
        isDragReject && 'border-destructive bg-destructive/5',
        files.length > 0 && 'border-primary/30 bg-white',
        disabled && 'opacity-50 cursor-not-allowed',
        !isDragActive && files.length === 0 && 'border-primary/30 hover:border-primary/50'
      )}
    >
      <input {...getInputProps()} />
      {files.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-wrap justify-center gap-3">
            {files.map((file) => (
              <div
                key={file.name}
                className="group flex flex-col items-center gap-1.5 p-2 rounded bg-white"
              >
                {/* Thumbnail or loading state */}
                <div className="relative">
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => removeFile(file.name, e)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                    aria-label={`Remover ${file.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {/* Thumbnail container */}
                  <div className="w-24 h-30 flex items-center justify-center rounded border border-primary/30 bg-white overflow-hidden shadow-sm">
                    {loadingThumbnails.has(file.name) ? (
                      <div className="animate-pulse bg-muted w-full h-full" />
                    ) : thumbnails.has(file.name) ? (
                      <img
                        src={thumbnails.get(file.name)}
                        alt={`Pré-visualização de ${file.name}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                    )}
                  </div>
                </div>

                {/* File name */}
                <p className="text-xs font-medium max-w-24 truncate" title={file.name}>
                  {file.name}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs">
            <span className="text-primary">{files.length} {files.length === 1 ? 'ficheiro selecionado' : 'ficheiros selecionados'}</span>
            <span className="text-muted-foreground"> • Clique para adicionar mais</span>
          </p>
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

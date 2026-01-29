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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { CSVDropzone } from './csv-dropzone'
import { CSVPreview } from './csv-preview'
import { parseCSVFile } from '@/lib/csv/parser'
import { validateCSVData, ValidationResult } from '@/lib/csv/validation'
import { ChevronDown, Mail, Forward, Copy } from 'lucide-react'
import { toast } from 'sonner'

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
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(true)

  const EMAIL_ADDRESS = 'cardiva.automation@gmail.com'

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL_ADDRESS)
    toast.success('Email copiado', {
      description: 'O endereço de email foi copiado para a área de transferência.',
    })
  }

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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Carregar CSV de Inventário</DialogTitle>
          <DialogDescription>
            Carregue um ficheiro CSV para atualizar o seu inventário. O ficheiro será validado antes do processamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <CSVDropzone
            onFileSelect={handleFileSelect}
            file={file}
            disabled={isUploading}
          />

          <Collapsible
            open={isCollapsibleOpen}
            onOpenChange={setIsCollapsibleOpen}
            className="border-t border-border pt-4"
          >
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors w-full justify-center group">
              <span className="font-medium">Outras formas de adicionar inventário</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsibleOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              {/* Email option */}
              <div className="flex gap-3">
                <div className="shrink-0 mt-0.5">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Enviar inventário por email</p>
                  <p className="text-xs text-muted-foreground">
                    Envie ficheiros CSV para{' '}
                    <button
                      onClick={copyEmail}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                      {EMAIL_ADDRESS}
                      <Copy className="h-3 w-3" />
                    </button>
                  </p>
                </div>
              </div>

              {/* Auto-forwarding option */}
              <div className="flex gap-3">
                <div className="shrink-0 mt-0.5">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Forward className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Reencaminhamento automático de email</p>
                  <p className="text-xs text-muted-foreground">
                    Configure o seu email para reencaminhar automaticamente inventário do Google ou Outlook
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

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
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!validation?.valid || isUploading || isValidating}
            >
              {isUploading ? 'A carregar...' : 'Carregar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

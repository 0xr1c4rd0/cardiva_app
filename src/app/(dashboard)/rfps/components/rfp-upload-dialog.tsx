'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { PDFDropzone } from './pdf-dropzone'
import { Upload, ChevronDown, Mail, Forward, Copy } from 'lucide-react'
import { useRFPUploadStatus } from '@/contexts/rfp-upload-status-context'
import { toast } from 'sonner'

interface RFPUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RFPUploadDialog({ open, onOpenChange }: RFPUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(true)
  const { queueFiles } = useRFPUploadStatus()

  const EMAIL_ADDRESS = 'cardiva.automation@gmail.com'

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL_ADDRESS)
    toast.success('Email copiado', {
      description: 'O endereço de email foi copiado para a área de transferência.',
    })
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)

    try {
      // Queue all selected files for processing (checks for duplicates)
      await queueFiles(files)

      // Clear selection and close dialog
      setFiles([])
      onOpenChange(false)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setFiles([])
    onOpenChange(false)
  }

  const buttonLabel = files.length === 0
    ? 'Carregar'
    : files.length === 1
      ? 'Carregar 1 concurso'
      : `Carregar ${files.length} concursos`

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Carregar Concursos</DialogTitle>
          <DialogDescription>
            Carregue ficheiros PDF com os concursos. O sistema ira extrair e comparar os produtos
            com o seu inventario.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <PDFDropzone
            onFilesSelect={setFiles}
            files={files}
          />

          <Collapsible
            open={isCollapsibleOpen}
            onOpenChange={setIsCollapsibleOpen}
            className="border-t border-border pt-4"
          >
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center group">
              <span className="font-medium">Outras formas de adicionar concursos</span>
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
                  <p className="text-sm font-medium">Enviar concursos por email</p>
                  <p className="text-xs text-muted-foreground">
                    Envie ficheiros PDF para{' '}
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
                    Configure o seu email para reencaminhar automaticamente concursos do Google ou Outlook
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'A verificar...' : buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

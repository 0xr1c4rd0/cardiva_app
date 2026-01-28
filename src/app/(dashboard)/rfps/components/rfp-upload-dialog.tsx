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
import { PDFDropzone } from './pdf-dropzone'
import { Upload } from 'lucide-react'
import { useRFPUploadStatus } from '@/contexts/rfp-upload-status-context'

interface RFPUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RFPUploadDialog({ open, onOpenChange }: RFPUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { queueFiles } = useRFPUploadStatus()

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

        <div className="py-4 space-y-3">
          <PDFDropzone
            onFilesSelect={setFiles}
            files={files}
          />
          <p className="text-xs text-muted-foreground text-center">
            Pode carregar ate 10 ficheiros de cada vez
          </p>
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

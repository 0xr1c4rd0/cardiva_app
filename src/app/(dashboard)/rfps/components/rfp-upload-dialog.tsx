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
import { Loader2 } from 'lucide-react'

interface RFPUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (file: File) => Promise<{ success: boolean; error?: string }>
}

export function RFPUploadDialog({ open, onOpenChange, onUpload }: RFPUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const result = await onUpload(file)
      if (result.success) {
        setFile(null)
        onOpenChange(false)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      setFile(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Carregar Concurso</DialogTitle>
          <DialogDescription>
            Carregue um ficheiro PDF com o concurso. O sistema irá extrair e comparar os produtos
            com o seu inventário.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <PDFDropzone
            onFileSelect={setFile}
            file={file}
            disabled={isUploading}
          />
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
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A carregar...
              </>
            ) : (
              'Carregar Concurso'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

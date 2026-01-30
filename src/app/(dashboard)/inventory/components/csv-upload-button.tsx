'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'
import { CSVUploadDialog } from './csv-upload-dialog'
import { triggerInventoryUpload } from '../actions'
import { toast } from 'sonner'
import { useInventoryUploadStatus } from '@/contexts/inventory-upload-status-context'

export function CSVUploadButton() {
  const [open, setOpen] = useState(false)
  const { isProcessing, activeJob, refetch } = useInventoryUploadStatus()

  const handleUpload = async (file: File, rowCount: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('rowCount', String(rowCount))

    const result = await triggerInventoryUpload(formData)

    if (result.success) {
      toast.success('Carregamento iniciado', {
        description: `A processar ${rowCount} linhas em segundo plano. Será notificado quando concluir.`,
      })
      // Refresh upload status to track the new job
      refetch()
    } else {
      toast.error('Carregamento falhou', {
        description: result.error,
      })
    }

    return result
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={isProcessing}
        className="relative"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            A processar...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Carregar CSV
          </>
        )}
      </Button>
      {isProcessing && activeJob && (
        <span className="sr-only">
          A processar {activeJob.file_name}
        </span>
      )}
      <CSVUploadDialog
        open={open}
        onOpenChange={setOpen}
        onUpload={handleUpload}
      />
    </>
  )
}

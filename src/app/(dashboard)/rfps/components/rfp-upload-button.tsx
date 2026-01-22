'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'
import { RFPUploadDialog } from './rfp-upload-dialog'
import { triggerRFPUpload } from '../actions'
import { toast } from 'sonner'
import { useRFPUploadStatus } from '@/contexts/rfp-upload-status-context'

export function RFPUploadButton() {
  const [open, setOpen] = useState(false)
  const { isProcessing, activeJob, refetch } = useRFPUploadStatus()

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const result = await triggerRFPUpload(formData)

    if (result.success) {
      // Toast is handled by RFPUploadStatusContext via realtime subscription
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
            Carregar Concurso
          </>
        )}
      </Button>
      {isProcessing && activeJob && (
        <span className="sr-only">
          A processar {activeJob.file_name}
        </span>
      )}
      <RFPUploadDialog
        open={open}
        onOpenChange={setOpen}
        onUpload={handleUpload}
      />
    </>
  )
}

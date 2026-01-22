'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'
import { CSVUploadDialog } from './csv-upload-dialog'
import { triggerInventoryUpload } from '../actions'
import { toast } from 'sonner'
import { useUploadStatus } from '@/hooks/use-upload-status'

export function CSVUploadButton() {
  const [open, setOpen] = useState(false)
  const { isProcessing, activeJob, refetch } = useUploadStatus()

  const handleUpload = async (file: File, rowCount: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('rowCount', String(rowCount))

    const result = await triggerInventoryUpload(formData)

    if (result.success) {
      toast.success('Upload started', {
        description: `Processing ${rowCount} rows in background. You'll be notified when complete.`,
      })
      // Refresh upload status to track the new job
      refetch()
    } else {
      toast.error('Upload failed', {
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
            Processing...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </>
        )}
      </Button>
      {isProcessing && activeJob && (
        <span className="sr-only">
          Processing {activeJob.file_name}
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

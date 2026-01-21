'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { CSVUploadDialog } from './csv-upload-dialog'
import { triggerInventoryUpload } from '../actions'
import { toast } from 'sonner'

export function CSVUploadButton() {
  const [open, setOpen] = useState(false)

  const handleUpload = async (file: File, rowCount: number) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('rowCount', String(rowCount))

    const result = await triggerInventoryUpload(formData)

    if (result.success) {
      toast.success('Upload started', {
        description: `Processing ${rowCount} rows in background. You'll be notified when complete.`,
      })
    } else {
      toast.error('Upload failed', {
        description: result.error,
      })
    }

    return result
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Upload CSV
      </Button>
      <CSVUploadDialog
        open={open}
        onOpenChange={setOpen}
        onUpload={handleUpload}
      />
    </>
  )
}

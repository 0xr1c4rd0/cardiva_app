'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { RFPUploadDialog } from './rfp-upload-dialog'
import { useRFPUploadStatus } from '@/contexts/rfp-upload-status-context'

export function RFPUploadButton() {
  const [open, setOpen] = useState(false)
  const { queuedCount, processingCount } = useRFPUploadStatus()

  // Total items in queue (queued + processing)
  const totalInQueue = queuedCount + processingCount

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="relative"
        data-rfp-upload-trigger
      >
        <Upload className="mr-2 h-4 w-4" />
        Carregar Concurso
        {totalInQueue > 0 && (
          <Badge
            variant="secondary"
            className="ml-2 h-5 min-w-5 px-1.5 text-xs"
          >
            {totalInQueue}
          </Badge>
        )}
      </Button>
      <RFPUploadDialog
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

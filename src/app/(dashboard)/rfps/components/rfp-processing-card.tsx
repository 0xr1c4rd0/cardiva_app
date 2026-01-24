'use client'

import { useState, useEffect, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Loader2, Clock, FileText, ChevronDown, ChevronUp, Upload } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRFPUploadStatus, type QueuedUpload } from '@/contexts/rfp-upload-status-context'

// Estimated processing time: 3 minutes
const ESTIMATED_TIME_MS = 3 * 60 * 1000
const MAX_VISIBLE_PROGRESS = 3

interface UploadProgressItemProps {
  upload: QueuedUpload
}

function UploadProgressItem({ upload }: UploadProgressItemProps) {
  const [elapsedTime, setElapsedTime] = useState(0)

  // Update elapsed time every second when processing
  useEffect(() => {
    if (!upload.startedAt || upload.status === 'completed' || upload.status === 'failed') {
      return
    }

    const startTime = upload.startedAt.getTime()
    const initialElapsed = Date.now() - startTime
    setElapsedTime(initialElapsed)

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [upload.startedAt, upload.status])

  // Calculate time-based progress (capped at 98%)
  const progressPercent = Math.min(98, (elapsedTime / ESTIMATED_TIME_MS) * 100)

  // Determine status text and icon behavior
  const isUploading = upload.status === 'uploading'
  const isProcessing = upload.status === 'processing'
  const isQueued = upload.status === 'queued'

  return (
    <div className="space-y-2 py-2 border-b last:border-b-0">
      {/* File info row */}
      <div className="flex items-center gap-2">
        {isQueued ? (
          <Clock className="h-4 w-4 text-muted-foreground" />
        ) : isUploading ? (
          <Upload className="h-4 w-4 text-green-600 animate-pulse" />
        ) : (
          <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
        )}
        <span className="font-medium text-sm truncate flex-1" title={upload.file.name}>
          {upload.file.name}
        </span>
        {upload.startedAt && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            ha {formatDistanceToNow(upload.startedAt, { locale: pt })}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {isQueued ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Em fila...</span>
        </div>
      ) : isUploading ? (
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
          <div
            className="bg-primary h-full w-1/3"
            style={{
              animation: 'indeterminate 1.5s ease-in-out infinite',
            }}
          />
        </div>
      ) : (
        <div className="space-y-0.5">
          <Progress
            value={progressPercent}
            className="h-1.5"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(progressPercent)}%</span>
            <span>~2-3 min</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function RFPProcessingCard() {
  const { uploadQueue, queuedCount } = useRFPUploadStatus()
  const [showOverflow, setShowOverflow] = useState(false)

  // Filter to active uploads (uploading or processing)
  const activeUploads = useMemo(() =>
    uploadQueue.filter(q => q.status === 'uploading' || q.status === 'processing'),
    [uploadQueue]
  )

  // Queued uploads (waiting to start)
  const queuedUploads = useMemo(() =>
    uploadQueue.filter(q => q.status === 'queued'),
    [uploadQueue]
  )

  // Split visible vs overflow
  const visibleUploads = activeUploads.slice(0, MAX_VISIBLE_PROGRESS)
  const overflowActiveCount = activeUploads.length - MAX_VISIBLE_PROGRESS
  const overflowCount = Math.max(0, overflowActiveCount) + queuedUploads.length

  // Don't render if nothing to show
  if (activeUploads.length === 0 && queuedUploads.length === 0) {
    return null
  }

  const totalCount = activeUploads.length + queuedUploads.length
  const description = totalCount === 1
    ? 'A processar 1 concurso...'
    : `A processar ${totalCount} concursos...`

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
          <CardTitle className="text-lg">A Processar Concursos</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Visible progress bars (max 3) */}
        {visibleUploads.map((upload) => (
          <UploadProgressItem key={upload.id} upload={upload} />
        ))}

        {/* Overflow section */}
        {overflowCount > 0 && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              onClick={() => setShowOverflow(!showOverflow)}
            >
              <span>
                Mais {overflowCount} em fila
              </span>
              {showOverflow ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showOverflow && (
              <div className="mt-2 space-y-1 max-h-40 overflow-auto">
                {/* Overflow active uploads */}
                {activeUploads.slice(MAX_VISIBLE_PROGRESS).map((upload) => (
                  <div key={upload.id} className="flex items-center gap-2 text-sm py-1">
                    <Loader2 className="h-3 w-3 text-green-600 animate-spin" />
                    <span className="truncate">{upload.file.name}</span>
                  </div>
                ))}
                {/* Queued uploads */}
                {queuedUploads.map((upload) => (
                  <div key={upload.id} className="flex items-center gap-2 text-sm py-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="truncate">{upload.file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation info */}
        <p className="text-xs text-muted-foreground pt-3 mt-2">
          Pode navegar para outra pagina. Recebera uma notificacao quando o processamento terminar.
        </p>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Loader2, Clock, FileText } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useRFPUploadStatus } from '@/contexts/rfp-upload-status-context'

// Estimated processing time: 2m45s (midpoint of 2:30-3 minute range)
const ESTIMATED_TIME_MS = 2.75 * 60 * 1000

export function RFPProcessingCard() {
  const { activeJob, isProcessing } = useRFPUploadStatus()
  const [elapsedTime, setElapsedTime] = useState(0)

  // Update elapsed time every second when processing
  useEffect(() => {
    if (!isProcessing || !activeJob) {
      setElapsedTime(0)
      return
    }

    // Calculate initial elapsed time from job creation
    const startTime = new Date(activeJob.created_at).getTime()
    const initialElapsed = Date.now() - startTime
    setElapsedTime(initialElapsed)

    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [isProcessing, activeJob])

  // Don't render if no active job or not processing
  if (!isProcessing || !activeJob) {
    return null
  }

  // Calculate progress percentage (capped at 95% to indicate ongoing work)
  const progressPercent = Math.min(95, (elapsedTime / ESTIMATED_TIME_MS) * 100)

  // Determine description based on status
  const description =
    activeJob.status === 'pending'
      ? 'Em fila para processamento...'
      : 'A analisar documento e a comparar com o inventário...'

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          <CardTitle className="text-lg">A Processar Concurso</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File info */}
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{activeJob.file_name}</span>
        </div>

        {/* Progress bar */}
        {activeJob.status === 'pending' ? (
          // Indeterminate progress for pending status
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
            <div
              className="bg-primary h-full w-1/4"
              style={{
                animation: 'indeterminate 1.5s ease-in-out infinite',
              }}
            />
          </div>
        ) : (
          // Time-based progress for processing status
          <div className="space-y-1">
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progressPercent)}%</span>
              <span>~2-3 minutos no total</span>
            </div>
          </div>
        )}

        {/* Time started */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Iniciado há{' '}
            {formatDistanceToNow(new Date(activeJob.created_at), { locale: pt })}
          </span>
        </div>

        {/* Navigation info */}
        <p className="text-xs text-muted-foreground border-t pt-3">
          Pode navegar para outra página. Receberá uma notificação quando o processamento
          terminar.
        </p>
      </CardContent>
    </Card>
  )
}

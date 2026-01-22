'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Loader2, Clock, FileText, CheckCircle2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useRFPUploadStatus } from '@/contexts/rfp-upload-status-context'

// Estimated processing time: 3 minutes
const ESTIMATED_TIME_MS = 3 * 60 * 1000

export function RFPProcessingCard() {
  const { activeJob, lastCompletedJob, isProcessing } = useRFPUploadStatus()
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const completionTimerRef = useRef<NodeJS.Timeout | null>(null)

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

  // Detect completion and trigger smooth animation
  useEffect(() => {
    if (lastCompletedJob && activeJob && lastCompletedJob.id === activeJob.id) {
      // Start the completion animation
      setIsCompleting(true)

      // After animation to 100%, start fade out
      completionTimerRef.current = setTimeout(() => {
        setIsFadingOut(true)
      }, 1000) // 1s for progress to reach 100%
    }

    return () => {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current)
      }
    }
  }, [lastCompletedJob, activeJob])

  // Reset states when no longer processing
  useEffect(() => {
    if (!isProcessing && !activeJob) {
      setIsCompleting(false)
      setIsFadingOut(false)
    }
  }, [isProcessing, activeJob])

  // Don't render if no active job or not processing (unless completing)
  if ((!isProcessing || !activeJob) && !isCompleting) {
    return null
  }

  // Calculate time-based progress (capped at 98% to indicate ongoing work)
  const timeBasedProgress = Math.min(98, (elapsedTime / ESTIMATED_TIME_MS) * 100)

  // Use 100% when completing, otherwise use time-based progress
  const progressPercent = isCompleting ? 100 : timeBasedProgress

  // Determine description based on status
  const description = isCompleting
    ? 'Processamento concluído!'
    : activeJob?.status === 'pending'
      ? 'Em fila para processamento...'
      : 'A analisar documento e a comparar com o inventário...'

  return (
    <Card
      className={cn(
        'border-green-200 bg-green-50/50 transition-all duration-500',
        isFadingOut && 'opacity-0'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {isCompleting ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
          )}
          <CardTitle className="text-lg">
            {isCompleting ? 'Concurso Processado' : 'A Processar Concurso'}
          </CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File info */}
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{activeJob?.file_name}</span>
        </div>

        {/* Progress bar */}
        {activeJob?.status === 'pending' && !isCompleting ? (
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
          // Time-based progress for processing status (with smooth transition)
          <div className="space-y-1">
            <Progress
              value={progressPercent}
              className={cn(
                'h-2 transition-all duration-1000',
                isCompleting && '[&>div]:bg-green-600'
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{Math.round(progressPercent)}%</span>
              <span>{isCompleting ? 'Concluído' : '~2-3 minutos no total'}</span>
            </div>
          </div>
        )}

        {/* Time started */}
        {activeJob && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Iniciado há{' '}
              {formatDistanceToNow(new Date(activeJob.created_at), { locale: pt })}
            </span>
          </div>
        )}

        {/* Navigation info */}
        {!isCompleting && (
          <p className="text-xs text-muted-foreground border-t pt-3">
            Pode navegar para outra página. Receberá uma notificação quando o processamento
            terminar.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

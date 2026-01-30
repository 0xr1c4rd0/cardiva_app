'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Loader2, XCircle, CheckCircle2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useInventoryUploadStatus, type InventoryUploadJob } from '@/contexts/inventory-upload-status-context'

// Estimated processing time: 60 seconds (midpoint of 30s-1m30s)
const ESTIMATED_TIME_MS = 60 * 1000

// Animation durations (ms)
const FILL_TO_100_DURATION = 600 // Smooth fill to 100%
const SHOW_100_DURATION = 800    // Brief pause at 100%
const COLLAPSE_DURATION = 400    // Collapse out

type AnimationPhase = 'active' | 'filling' | 'showing' | 'collapsing' | 'removed'

interface ProcessingContentProps {
  job: InventoryUploadJob
  onRemoved: () => void
}

function ProcessingContent({ job, onRemoved }: ProcessingContentProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('active')

  // Use ref to track if we've started the completion animation
  const hasStartedCompletionRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)

  const startTime = new Date(job.created_at).getTime()

  // Calculate base progress (time-based, capped at 98%)
  const baseProgress = Math.min(98, (elapsedTime / ESTIMATED_TIME_MS) * 100)

  // Update elapsed time every second when processing
  useEffect(() => {
    if (job.status === 'completed' || job.status === 'failed' || job.status === 'partial') {
      return
    }

    const initialElapsed = Date.now() - startTime
    setElapsedTime(initialElapsed)

    const initialProgress = Math.min(98, (initialElapsed / ESTIMATED_TIME_MS) * 100)
    setAnimatedProgress(initialProgress)

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      setElapsedTime(elapsed)
      const progress = Math.min(98, (elapsed / ESTIMATED_TIME_MS) * 100)
      setAnimatedProgress(progress)
    }, 1000)

    return () => clearInterval(interval)
  }, [job.status, startTime])

  // Trigger smooth fill to 100% when completed
  useEffect(() => {
    if (job.status !== 'completed' && job.status !== 'partial') return
    if (hasStartedCompletionRef.current) return

    hasStartedCompletionRef.current = true
    setAnimationPhase('filling')

    const startProgress = animatedProgress
    const animStartTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - animStartTime
      const progress = Math.min(1, elapsed / FILL_TO_100_DURATION)

      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      const newProgress = startProgress + (100 - startProgress) * eased

      setAnimatedProgress(newProgress)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setAnimatedProgress(100)
        setAnimationPhase('showing')

        setTimeout(() => {
          setAnimationPhase('collapsing')
        }, SHOW_100_DURATION)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [job.status])

  // Handle collapse transition end
  const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.propertyName === 'opacity' && animationPhase === 'collapsing') {
      setAnimationPhase('removed')
      onRemoved()
    }
  }, [animationPhase, onRemoved])

  const isFailed = job.status === 'failed'
  const isCompleted = job.status === 'completed' || job.status === 'partial'
  const isAnimatingCompletion = animationPhase === 'filling' || animationPhase === 'showing'
  const isCollapsing = animationPhase === 'collapsing'

  if (animationPhase === 'removed') return null

  const displayProgress = isCompleted ? animatedProgress : baseProgress

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        "transition-all ease-out",
        isCollapsing && "opacity-0 max-h-0 overflow-hidden"
      )}
      style={{
        transitionDuration: isCollapsing ? `${COLLAPSE_DURATION}ms` : '150ms',
        maxHeight: isCollapsing ? 0 : 500,
      }}
    >
      <Card className={cn(
        "py-6",
        isFailed
          ? "border-red-200 bg-red-50/50"
          : "border-green-200 bg-green-50/50"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {isFailed ? (
              <XCircle className="h-5 w-5 text-destructive" />
            ) : isAnimatingCompletion ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
            )}
            <CardTitle className="text-lg">
              {isFailed ? 'Processamento Falhou' : isAnimatingCompletion ? 'Processamento Concluído' : 'A Processar Inventário'}
            </CardTitle>
          </div>
          <CardDescription>
            {job.file_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* File info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {job.row_count > 0 ? `${job.row_count} linhas` : 'A calcular linhas...'}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              há {formatDistanceToNow(new Date(job.created_at), { locale: pt })}
            </span>
          </div>

          {/* Progress bar or error */}
          {isFailed ? (
            <div className="text-sm text-destructive">
              {job.error_message || 'Processamento falhou'}
            </div>
          ) : (
            <div className="space-y-1">
              <Progress
                value={displayProgress}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(displayProgress)}%</span>
                {!isAnimatingCompletion && !isCollapsing && <span>~30s-1m30s</span>}
              </div>
            </div>
          )}

          {/* Info text */}
          {!isFailed && !isAnimatingCompletion && (
            <p className="text-xs text-muted-foreground pt-2">
              Pode navegar para outra página. A tabela será atualizada automaticamente quando concluir.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function InventoryProcessingCard() {
  const { activeJob } = useInventoryUploadStatus()
  const [displayJob, setDisplayJob] = useState<InventoryUploadJob | null>(null)

  // Track the job to display (keep showing completed job during animation)
  useEffect(() => {
    if (activeJob) {
      setDisplayJob(activeJob)
    }
  }, [activeJob])

  // Clear displayJob after animation completes
  const handleRemoved = useCallback(() => {
    setDisplayJob(null)
  }, [])

  if (!displayJob) {
    return null
  }

  return (
    <ProcessingContent
      key={displayJob.id}
      job={displayJob}
      onRemoved={handleRemoved}
    />
  )
}

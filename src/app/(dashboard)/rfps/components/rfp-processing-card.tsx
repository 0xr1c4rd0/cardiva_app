'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Loader2, Clock, ChevronDown, ChevronUp, Upload, XCircle } from 'lucide-react'
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

// Animation durations (ms)
const FILL_TO_100_DURATION = 600 // Smooth fill to 100%
const SHOW_100_DURATION = 400    // Brief pause at 100%
const COLLAPSE_DURATION = 400    // Collapse out

interface UploadProgressItemProps {
  upload: QueuedUpload
  onRemoveComplete?: (id: string) => void
}

function UploadProgressItem({ upload, onRemoveComplete }: UploadProgressItemProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [animationPhase, setAnimationPhase] = useState<'active' | 'filling' | 'showing' | 'collapsing' | 'removed'>('active')

  // Use ref to track if we've started the completion animation
  // This prevents the effect from re-triggering and cancelling the animation
  const hasStartedCompletionRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)

  // Calculate base progress (time-based, capped at 98%)
  const baseProgress = Math.min(98, (elapsedTime / ESTIMATED_TIME_MS) * 100)

  // Update elapsed time every second when processing
  useEffect(() => {
    if (!upload.startedAt || upload.status === 'completed' || upload.status === 'failed') {
      return
    }

    const startTime = upload.startedAt.getTime()
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
  }, [upload.startedAt, upload.status])

  // Trigger smooth fill to 100% when completed
  // Using ref to prevent re-triggering and cancellation
  useEffect(() => {
    if (upload.status !== 'completed') return
    if (hasStartedCompletionRef.current) return // Already started, don't restart

    hasStartedCompletionRef.current = true
    setAnimationPhase('filling')

    // Capture current progress at the moment of completion
    const startProgress = animatedProgress
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(1, elapsed / FILL_TO_100_DURATION)

      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      const newProgress = startProgress + (100 - startProgress) * eased

      setAnimatedProgress(newProgress)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Reached 100%, move to showing phase
        setAnimatedProgress(100)
        setAnimationPhase('showing')

        // After showing, start collapse
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
  }, [upload.status]) // Only depend on upload.status, not animationPhase

  // Handle collapse transition end
  const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.propertyName === 'opacity' && animationPhase === 'collapsing') {
      setAnimationPhase('removed')
      onRemoveComplete?.(upload.id)
    }
  }, [animationPhase, upload.id, onRemoveComplete])

  // Determine base status (ignoring animation phases)
  const isUploading = upload.status === 'uploading'
  const isQueued = upload.status === 'queued'
  const isFailed = upload.status === 'failed'

  // During 'filling' and 'showing' phases, we're visually still "processing"
  const isAnimatingCompletion = animationPhase === 'filling' || animationPhase === 'showing'
  const isCollapsing = animationPhase === 'collapsing'

  // Don't render if removed
  if (animationPhase === 'removed') return null

  // Display progress: use animated value when completing, otherwise base progress
  const displayProgress = (upload.status === 'completed')
    ? animatedProgress
    : baseProgress

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        "space-y-2 py-2 border-b last:border-b-0 transition-all ease-out",
        isCollapsing && "opacity-0 max-h-0 py-0 overflow-hidden border-b-0"
      )}
      style={{
        transitionDuration: isCollapsing ? `${COLLAPSE_DURATION}ms` : '150ms',
        maxHeight: isCollapsing ? 0 : 100,
      }}
    >
      {/* File info row */}
      <div className="flex items-center gap-2">
        {isQueued ? (
          <Clock className="h-4 w-4 text-muted-foreground" />
        ) : isUploading ? (
          <Upload className="h-4 w-4 text-green-600 animate-pulse" />
        ) : isFailed ? (
          <XCircle className="h-4 w-4 text-destructive" />
        ) : (
          // Processing or completing - keep spinner
          <Loader2 className="h-4 w-4 text-green-600 animate-spin" />
        )}
        <span className="font-medium text-sm truncate flex-1" title={upload.fileName || upload.file?.name}>
          {upload.fileName || upload.file?.name || 'Ficheiro'}
        </span>
        {upload.startedAt && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            há {formatDistanceToNow(upload.startedAt, { locale: pt })}
          </span>
        )}
      </div>

      {/* Progress bar - same style during fill animation */}
      {isQueued ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Em fila...</span>
        </div>
      ) : isUploading ? (
        <div className="relative h-1.5 w-full overflow-hidden rounded-md bg-primary/20">
          <div
            className="bg-primary h-full w-1/3"
            style={{
              animation: 'indeterminate 1.5s ease-in-out infinite',
            }}
          />
        </div>
      ) : isFailed ? (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <span>Falhou: {upload.error || 'Processamento falhou'}</span>
        </div>
      ) : (
        // Processing OR filling to 100% - same visual style
        <div className="space-y-0.5">
          <Progress
            value={displayProgress}
            className="h-1.5"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(displayProgress)}%</span>
            {!isAnimatingCompletion && !isCollapsing && <span>~2-3 min</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export function RFPProcessingCard() {
  const { uploadQueue } = useRFPUploadStatus()
  const [showOverflow, setShowOverflow] = useState(false)
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())

  // Handle when an item finishes its collapse animation
  const handleRemoveComplete = useCallback((id: string) => {
    setRemovedIds(prev => new Set(prev).add(id))
  }, [])

  // Filter to active uploads (uploading, processing, failed, or recently completed for animation)
  // Exclude items that have completed their removal animation
  const activeUploads = useMemo(() =>
    uploadQueue.filter(q =>
      (q.status === 'uploading' || q.status === 'processing' || q.status === 'failed' || q.status === 'completed') &&
      !removedIds.has(q.id)
    ),
    [uploadQueue, removedIds]
  )

  // Check for failure states
  const hasFailures = useMemo(() =>
    activeUploads.some(u => u.status === 'failed'),
    [activeUploads]
  )
  const allFailed = useMemo(() =>
    activeUploads.length > 0 && activeUploads.every(u => u.status === 'failed'),
    [activeUploads]
  )
  const someActive = useMemo(() =>
    activeUploads.some(u => u.status === 'uploading' || u.status === 'processing'),
    [activeUploads]
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
    <Card className={cn(
      "py-6",
      hasFailures
        ? "border-red-200 bg-red-50/50"
        : "border-green-200 bg-green-50/50"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {someActive ? (
            <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
          ) : hasFailures ? (
            <XCircle className="h-5 w-5 text-destructive" />
          ) : null}
          <CardTitle className="text-lg">
            {allFailed ? 'Processamento Falhou' : 'A Processar Concursos'}
          </CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Visible progress bars (max 3) */}
        {visibleUploads.map((upload) => (
          <UploadProgressItem
            key={upload.id}
            upload={upload}
            onRemoveComplete={handleRemoveComplete}
          />
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
                  <div key={upload.id} className={cn(
                    "flex items-center gap-2 text-sm py-1",
                    upload.status === 'failed' && "text-destructive"
                  )}>
                    {upload.status === 'failed' ? (
                      <XCircle className="h-3 w-3 text-destructive" />
                    ) : (
                      <Loader2 className="h-3 w-3 text-green-600 animate-spin" />
                    )}
                    <span className="truncate">{upload.fileName || upload.file?.name}</span>
                  </div>
                ))}
                {/* Queued uploads */}
                {queuedUploads.map((upload) => (
                  <div key={upload.id} className="flex items-center gap-2 text-sm py-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="truncate">{upload.fileName || upload.file?.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation info */}
        <p className="text-xs text-muted-foreground pt-3 mt-2">
          Pode navegar para outra página. Receberá uma notificação quando o processamento terminar.
        </p>
      </CardContent>
    </Card>
  )
}

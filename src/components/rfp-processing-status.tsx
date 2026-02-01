'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RFPProcessingStatusProps {
  jobId: string
  onComplete?: () => void
  onError?: (error: string) => void
}

export function RFPProcessingStatus({
  jobId,
  onComplete,
  onError
}: RFPProcessingStatusProps) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('A iniciar...')
  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending')
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial state
    const fetchInitialState = async () => {
      const { data, error } = await supabase
        .from('rfp_upload_jobs')
        .select('processing_progress, processing_stage, status')
        .eq('id', jobId)
        .single()

      if (error) {
        console.error('Error fetching job status:', error)
        return
      }

      if (data) {
        setProgress(data.processing_progress || 0)
        setStage(data.processing_stage || 'A iniciar...')
        setStatus(data.status)

        // Check if already completed
        if (data.status === 'completed') {
          onComplete?.()
        } else if (data.status === 'failed') {
          onError?.('Processamento falhou')
        }
      }
    }

    fetchInitialState()

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`rfp-job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rfp_upload_jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          const newData = payload.new as {
            processing_progress: number
            processing_stage: string
            status: string
            error_message?: string
          }

          setProgress(newData.processing_progress || 0)
          setStage(newData.processing_stage || '')
          setStatus(newData.status as any)

          // Handle completion
          if (newData.status === 'completed') {
            onComplete?.()
          } else if (newData.status === 'failed') {
            onError?.(newData.error_message || 'Processamento falhou')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [jobId, onComplete, onError])

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress
          value={progress}
          className={cn(
            "h-2 transition-all duration-500",
            status === 'completed' && "bg-green-100",
            status === 'failed' && "bg-red-100"
          )}
        />

        {/* Progress Percentage */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{progress}%</span>

          {/* Status Icon */}
          {status === 'processing' && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>A processar...</span>
            </div>
          )}

          {status === 'completed' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Concluído</span>
            </div>
          )}

          {status === 'failed' && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Falhou</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Stage Description */}
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">{stage}</p>

        {/* Estimated Time Remaining (optional) */}
        {status === 'processing' && progress > 0 && progress < 100 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Tempo estimado: {Math.ceil((100 - progress) / 20)} minutos
          </p>
        )}
      </div>
    </div>
  )
}

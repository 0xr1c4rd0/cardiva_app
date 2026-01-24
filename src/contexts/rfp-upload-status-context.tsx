'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface RFPUploadJob {
  id: string
  user_id: string
  file_name: string
  file_path: string | null
  file_size: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

interface RFPUploadStatusContextValue {
  activeJob: RFPUploadJob | null
  lastCompletedJob: RFPUploadJob | null
  isProcessing: boolean
  refetch: () => Promise<void>
}

const RFPUploadStatusContext = createContext<RFPUploadStatusContextValue | null>(null)

interface RFPUploadStatusProviderProps {
  children: ReactNode
}

/**
 * Provider that manages RFP upload job status via Supabase Realtime
 * Shares state across all consuming components
 */
export function RFPUploadStatusProvider({ children }: RFPUploadStatusProviderProps) {
  const [activeJob, setActiveJob] = useState<RFPUploadJob | null>(null)
  const [lastCompletedJob, setLastCompletedJob] = useState<RFPUploadJob | null>(null)
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const userIdRef = useRef<string | null>(null)
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch any pending/processing jobs (all users can see all jobs)
  const fetchActiveJob = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    userIdRef.current = user.id

    const { data, error } = await supabase
      .from('rfp_upload_jobs')
      .select('*')
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // maybeSingle returns null (not error) when no rows found
    if (!error) {
      setActiveJob(data as RFPUploadJob | null)
    }
  }, [supabase])

  // Handle job status updates (all jobs, not just user's own)
  const handleJobUpdate = useCallback((payload: { new: RFPUploadJob; old: RFPUploadJob }) => {
    const newJob = payload.new
    const oldJob = payload.old

    // Clear any pending completion timeout
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current)
      completionTimeoutRef.current = null
    }

    // Update local state
    if (newJob.status === 'pending' || newJob.status === 'processing') {
      setActiveJob(newJob)
      setLastCompletedJob(null)
    } else {
      // Job completed/failed - set lastCompletedJob FIRST for smooth transition
      setLastCompletedJob(newJob)
      // Then clear activeJob after a delay (1s animation + 500ms pause)
      completionTimeoutRef.current = setTimeout(() => {
        setActiveJob(null)
      }, 1500)
    }

    // Enhanced toast notifications for status changes
    if (oldJob.status !== newJob.status) {
      switch (newJob.status) {
        case 'processing':
          toast.loading('A processar concurso', {
            id: `rfp-job-${newJob.id}`,
            description: `A analisar ${newJob.file_name}... Pode demorar 2-3 minutos.`,
            duration: Infinity,
          })
          break
        case 'completed':
          toast.success('Concurso processado com sucesso', {
            id: `rfp-job-${newJob.id}`,
            description: `${newJob.file_name} está pronto para revisão.`,
            duration: 10000,
            action: {
              label: 'Ver Resultados',
              onClick: () => {
                window.location.href = `/rfps/${newJob.id}/matches`
              },
            },
          })
          break
        case 'failed':
          toast.error('Processamento falhou', {
            id: `rfp-job-${newJob.id}`,
            description: newJob.error_message
              ? `${newJob.error_message}. Por favor, tente carregar novamente.`
              : `Falha ao processar ${newJob.file_name}. Por favor, tente carregar novamente.`,
            duration: 15000,
          })
          break
      }
    }
  }, [])

  // Handle new job insertions (when upload is triggered)
  // Show toasts only for user's own uploads, but track all jobs
  const handleJobInsert = useCallback((payload: { new: RFPUploadJob }) => {
    const newJob = payload.new
    const isOwnJob = userIdRef.current && newJob.user_id === userIdRef.current

    if (newJob.status === 'pending' || newJob.status === 'processing') {
      setActiveJob(newJob)
      // Show initial upload confirmation toast only for user's own uploads
      if (isOwnJob) {
        toast.loading('Concurso recebido', {
          id: `rfp-job-${newJob.id}`,
          description: `${newJob.file_name} em fila para processamento...`,
          duration: 5000,
        })
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const setupSubscription = async () => {
      // Get current user for filtering
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !isMounted) return

      userIdRef.current = user.id

      // Fetch initial state
      await fetchActiveJob()

      if (!isMounted) return

      // Clean up any existing channel before creating new one
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }

      // Subscribe to realtime changes for all jobs (no user_id filter)
      // This enables multi-user collaboration where all users see all job updates
      const channel = supabase
        .channel('rfp_jobs_all')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'rfp_upload_jobs',
          },
          (payload) => {
            if (isMounted) {
              handleJobUpdate(payload as unknown as { new: RFPUploadJob; old: RFPUploadJob })
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'rfp_upload_jobs',
          },
          (payload) => {
            if (isMounted) {
              handleJobInsert(payload as unknown as { new: RFPUploadJob })
            }
          }
        )
        .subscribe()

      channelRef.current = channel
    }

    setupSubscription()

    return () => {
      isMounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current)
        completionTimeoutRef.current = null
      }
    }
  }, [supabase, fetchActiveJob, handleJobUpdate, handleJobInsert])

  const value: RFPUploadStatusContextValue = {
    activeJob,
    lastCompletedJob,
    isProcessing: activeJob?.status === 'pending' || activeJob?.status === 'processing',
    refetch: fetchActiveJob,
  }

  return (
    <RFPUploadStatusContext.Provider value={value}>
      {children}
    </RFPUploadStatusContext.Provider>
  )
}

/**
 * Hook to access RFP upload status from context
 * Must be used within RFPUploadStatusProvider
 */
export function useRFPUploadStatus(): RFPUploadStatusContextValue {
  const context = useContext(RFPUploadStatusContext)
  if (!context) {
    throw new Error('useRFPUploadStatus must be used within RFPUploadStatusProvider')
  }
  return context
}

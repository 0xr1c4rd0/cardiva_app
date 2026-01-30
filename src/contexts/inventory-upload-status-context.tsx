'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export interface InventoryUploadJob {
  id: string
  user_id: string
  file_name: string
  row_count: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial'
  error_message: string | null
  processed_rows: number
  created_at: string
  updated_at: string
  completed_at: string | null
}

interface InventoryUploadStatusContextValue {
  activeJob: InventoryUploadJob | null
  isProcessing: boolean
  refetch: () => Promise<void>
}

const InventoryUploadStatusContext = createContext<InventoryUploadStatusContextValue | null>(null)

interface InventoryUploadStatusProviderProps {
  children: ReactNode
}

/**
 * Provider that manages inventory upload job status via Supabase Realtime
 * Automatically refreshes the page when upload completes
 */
export function InventoryUploadStatusProvider({ children }: InventoryUploadStatusProviderProps) {
  const [activeJob, setActiveJob] = useState<InventoryUploadJob | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Fetch any pending/processing jobs for current user
  const fetchActiveJob = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('inventory_upload_jobs')
      .select('id, user_id, file_name, row_count, status, error_message, processed_rows, created_at, updated_at, completed_at')
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setActiveJob(data as InventoryUploadJob | null)
  }, [supabase])

  // Handle job status updates
  const handleJobUpdate = useCallback((payload: { new: InventoryUploadJob; old: InventoryUploadJob }) => {
    const newJob = payload.new
    const oldJob = payload.old

    // Update local state
    if (newJob.status === 'pending' || newJob.status === 'processing') {
      setActiveJob(newJob)
    } else {
      // Job completed/failed - clear active job after a brief delay for animation
      // The InventoryProcessingCard handles the animation, then we clear state
      setActiveJob({ ...newJob }) // Update with final status for animation
    }

    // Show toast notifications and refresh page on status changes
    if (oldJob.status !== newJob.status) {
      switch (newJob.status) {
        case 'processing':
          toast.info('A processar inventário', {
            description: `A processar ${newJob.file_name}...`,
            id: `inventory-job-${newJob.id}`,
          })
          break
        case 'completed':
          toast.success('Carregamento concluído', {
            description: newJob.processed_rows > 0
              ? `Importadas ${newJob.processed_rows} linhas de ${newJob.file_name}`
              : `Sem dados novos em ${newJob.file_name}`,
            id: `inventory-job-${newJob.id}`,
          })
          // Refresh the page to show new data
          router.refresh()
          break
        case 'failed':
          toast.error('Carregamento falhou', {
            description: newJob.error_message || `Falha ao processar ${newJob.file_name}`,
            id: `inventory-job-${newJob.id}`,
          })
          break
        case 'partial':
          toast.warning('Importação parcial', {
            description: `Importadas ${newJob.processed_rows} de ${newJob.row_count} linhas de ${newJob.file_name}`,
            id: `inventory-job-${newJob.id}`,
          })
          // Refresh the page to show partial data
          router.refresh()
          break
      }
    }
  }, [router])

  // Handle new job insertions (when upload is triggered)
  const handleJobInsert = useCallback((payload: { new: InventoryUploadJob }) => {
    const newJob = payload.new
    if (newJob.status === 'pending' || newJob.status === 'processing') {
      setActiveJob(newJob)
    }
  }, [])

  useEffect(() => {
    const setupSubscription = async () => {
      // Get current user for filtering
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch initial state
      await fetchActiveJob()

      // Subscribe to realtime changes - filter by user_id to reduce network traffic
      channelRef.current = supabase
        .channel(`inventory_upload_jobs_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'inventory_upload_jobs',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => handleJobUpdate(payload as unknown as { new: InventoryUploadJob; old: InventoryUploadJob })
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'inventory_upload_jobs',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => handleJobInsert(payload as unknown as { new: InventoryUploadJob })
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [supabase, fetchActiveJob, handleJobUpdate, handleJobInsert])

  const value: InventoryUploadStatusContextValue = {
    activeJob,
    isProcessing: activeJob?.status === 'pending' || activeJob?.status === 'processing',
    refetch: fetchActiveJob,
  }

  return (
    <InventoryUploadStatusContext.Provider value={value}>
      {children}
    </InventoryUploadStatusContext.Provider>
  )
}

export function useInventoryUploadStatus() {
  const context = useContext(InventoryUploadStatusContext)
  if (!context) {
    throw new Error('useInventoryUploadStatus must be used within InventoryUploadStatusProvider')
  }
  return context
}

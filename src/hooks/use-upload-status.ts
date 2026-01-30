'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface UploadJob {
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

interface UseUploadStatusReturn {
  activeJob: UploadJob | null
  isProcessing: boolean
  refetch: () => Promise<void>
}

/**
 * Hook to track inventory upload job status via Supabase Realtime
 * Shows toast notifications when job status changes
 */
export function useUploadStatus(): UseUploadStatusReturn {
  const [activeJob, setActiveJob] = useState<UploadJob | null>(null)
  const supabase = createClient()

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
      .single()

    setActiveJob(data as UploadJob | null)
  }, [supabase])

  // Handle job status updates
  const handleJobUpdate = useCallback((payload: { new: UploadJob; old: UploadJob }) => {
    const newJob = payload.new
    const oldJob = payload.old

    // Update local state
    if (newJob.status === 'pending' || newJob.status === 'processing') {
      setActiveJob(newJob)
    } else {
      setActiveJob(null)
    }

    // Show toast notifications for status changes
    if (oldJob.status !== newJob.status) {
      switch (newJob.status) {
        case 'processing':
          toast.info('Processing inventory', {
            description: `Processing ${newJob.file_name}...`,
            id: `job-${newJob.id}`,
          })
          break
        case 'completed':
          toast.success('Upload complete', {
            description: newJob.processed_rows > 0
              ? `Successfully imported ${newJob.processed_rows} rows from ${newJob.file_name}`
              : `No new data found in ${newJob.file_name}`,
            id: `job-${newJob.id}`,
          })
          break
        case 'failed':
          toast.error('Upload failed', {
            description: newJob.error_message || `Failed to process ${newJob.file_name}`,
            id: `job-${newJob.id}`,
          })
          break
        case 'partial':
          toast.warning('Partial import', {
            description: `Imported ${newJob.processed_rows} of ${newJob.row_count} rows from ${newJob.file_name}`,
            id: `job-${newJob.id}`,
          })
          break
      }
    }
  }, [])

  // Handle new job insertions (when upload is triggered)
  const handleJobInsert = useCallback((payload: { new: UploadJob }) => {
    const newJob = payload.new
    if (newJob.status === 'pending' || newJob.status === 'processing') {
      setActiveJob(newJob)
    }
  }, [])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const setupSubscription = async () => {
      // Get current user for filtering
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch initial state
      await fetchActiveJob()

      // Subscribe to realtime changes - filter by user_id to reduce network traffic
      channel = supabase
        .channel(`inventory_upload_jobs_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'inventory_upload_jobs',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => handleJobUpdate(payload as unknown as { new: UploadJob; old: UploadJob })
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'inventory_upload_jobs',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => handleJobInsert(payload as unknown as { new: UploadJob })
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase, fetchActiveJob, handleJobUpdate, handleJobInsert])

  return {
    activeJob,
    isProcessing: activeJob?.status === 'pending' || activeJob?.status === 'processing',
    refetch: fetchActiveJob,
  }
}

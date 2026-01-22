'use client'

import { useEffect, useState, useCallback } from 'react'
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

interface UseRFPUploadStatusReturn {
  activeJob: RFPUploadJob | null
  isProcessing: boolean
  refetch: () => Promise<void>
}

/**
 * Hook to track RFP upload job status via Supabase Realtime
 * Shows toast notifications when job status changes
 */
export function useRFPUploadStatus(): UseRFPUploadStatusReturn {
  const [activeJob, setActiveJob] = useState<RFPUploadJob | null>(null)
  const supabase = createClient()

  // Fetch any pending/processing jobs for current user
  const fetchActiveJob = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('rfp_upload_jobs')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setActiveJob(data as RFPUploadJob | null)
  }, [supabase])

  // Handle job status updates
  const handleJobUpdate = useCallback((payload: { new: RFPUploadJob; old: RFPUploadJob }) => {
    const newJob = payload.new
    const oldJob = payload.old

    // Update local state
    if (newJob.status === 'pending' || newJob.status === 'processing') {
      setActiveJob(newJob)
    } else {
      setActiveJob(null)
    }

    // Enhanced toast notifications for status changes
    if (oldJob.status !== newJob.status) {
      switch (newJob.status) {
        case 'processing':
          toast.loading('Processing RFP', {
            id: `rfp-job-${newJob.id}`,
            description: `Analyzing ${newJob.file_name}... This may take 3-5 minutes.`,
            duration: Infinity,
          })
          break
        case 'completed':
          toast.success('RFP processed successfully', {
            id: `rfp-job-${newJob.id}`,
            description: `${newJob.file_name} is ready for review.`,
            duration: 10000,
            action: {
              label: 'View Results',
              onClick: () => {
                window.location.href = `/rfps/${newJob.id}/matches`
              },
            },
          })
          break
        case 'failed':
          toast.error('RFP processing failed', {
            id: `rfp-job-${newJob.id}`,
            description: newJob.error_message
              ? `${newJob.error_message}. Please try uploading again.`
              : `Failed to process ${newJob.file_name}. Please try uploading again.`,
            duration: 15000,
          })
          break
      }
    }
  }, [])

  // Handle new job insertions (when upload is triggered)
  const handleJobInsert = useCallback((payload: { new: RFPUploadJob }) => {
    const newJob = payload.new
    if (newJob.status === 'pending' || newJob.status === 'processing') {
      setActiveJob(newJob)
      // Show initial upload confirmation toast
      toast.loading('Upload received', {
        id: `rfp-job-${newJob.id}`,
        description: `${newJob.file_name} queued for processing...`,
        duration: 5000, // Will be replaced by processing toast
      })
    }
  }, [])

  useEffect(() => {
    // Fetch initial state
    fetchActiveJob()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('rfp_upload_jobs_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rfp_upload_jobs',
        },
        (payload) => handleJobUpdate(payload as unknown as { new: RFPUploadJob; old: RFPUploadJob })
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rfp_upload_jobs',
        },
        (payload) => handleJobInsert(payload as unknown as { new: RFPUploadJob })
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchActiveJob, handleJobUpdate, handleJobInsert])

  return {
    activeJob,
    isProcessing: activeJob?.status === 'pending' || activeJob?.status === 'processing',
    refetch: fetchActiveJob,
  }
}

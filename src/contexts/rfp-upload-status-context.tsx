'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { triggerRFPUpload, getJobReviewStatus } from '@/app/(dashboard)/rfps/actions'

export type ReviewStatus = 'por_rever' | 'revisto' | 'confirmado' | null

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
  last_edited_by: string | null
  review_status?: ReviewStatus
}

// Multi-upload queue types
export interface QueuedUpload {
  id: string              // Temporary ID until job created
  file: File | null       // Null for restored jobs (after page refresh)
  status: 'queued' | 'uploading' | 'processing' | 'completed' | 'failed'
  jobId?: string          // Set after job created in DB
  startedAt?: Date
  error?: string
  isRestored?: boolean    // True when restored from DB after page refresh
  fileName?: string       // For display when file is null (restored jobs)
}

interface RFPUploadStatusContextValue {
  // Existing (keep for backward compat with single-job display)
  activeJob: RFPUploadJob | null
  lastCompletedJob: RFPUploadJob | null
  isProcessing: boolean
  refetch: () => Promise<void>

  // New for multi-upload
  uploadQueue: QueuedUpload[]
  queueFiles: (files: File[]) => void
  processingCount: number
  queuedCount: number

  // Refresh trigger - increments when data should be refreshed (e.g., job completed, deleted)
  refreshTrigger: number
  // Manual trigger for KPI refresh (call after delete, confirm, etc.)
  triggerKPIRefresh: () => void
}

const RFPUploadStatusContext = createContext<RFPUploadStatusContextValue | null>(null)

interface RFPUploadStatusProviderProps {
  children: ReactNode
}

// Multi-upload constants
const MAX_CONCURRENT = 10
const MAX_PARALLEL_UPLOADS = 3 // Max simultaneous uploads showing progress animation
const UPLOAD_STAGGER_MS = 2000 // 2s delay between starting each upload
const WEBHOOK_DELAY_MS = 2500 // 2.5s between n8n triggers
const COMPLETED_CLEANUP_DELAY_MS = 5000 // Remove completed items after 5s

/**
 * Provider that manages RFP upload job status via Supabase Realtime
 * Shares state across all consuming components
 * Supports multi-file upload queue with sequential processing
 */
export function RFPUploadStatusProvider({ children }: RFPUploadStatusProviderProps) {
  const [activeJob, setActiveJob] = useState<RFPUploadJob | null>(null)
  const [lastCompletedJob, setLastCompletedJob] = useState<RFPUploadJob | null>(null)
  const [uploadQueue, setUploadQueue] = useState<QueuedUpload[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const userIdRef = useRef<string | null>(null)
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingQueueRef = useRef(false)

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
  const handleJobUpdate = useCallback(async (payload: { new: RFPUploadJob; old: RFPUploadJob }) => {
    const newJob = payload.new
    const oldJob = payload.old

    // Clear any pending completion timeout
    if (completionTimeoutRef.current) {
      clearTimeout(completionTimeoutRef.current)
      completionTimeoutRef.current = null
    }

    // When job completes or fails, trigger refresh for KPIs
    let jobWithReviewStatus = newJob
    if (newJob.status === 'completed' && oldJob.status !== 'completed') {
      const result = await getJobReviewStatus(newJob.id)
      if (result.success && result.reviewStatus) {
        jobWithReviewStatus = { ...newJob, review_status: result.reviewStatus }
      }
      // Trigger refresh for KPIs
      setRefreshTrigger(prev => prev + 1)
    } else if (newJob.status === 'failed' && oldJob.status !== 'failed') {
      // Also trigger refresh for failed jobs
      setRefreshTrigger(prev => prev + 1)
    }

    // Update queue item if this job matches one in the queue
    setUploadQueue(prev => prev.map(q => {
      if (q.jobId === newJob.id) {
        if (newJob.status === 'completed') {
          return { ...q, status: 'completed' as const }
        } else if (newJob.status === 'failed') {
          return { ...q, status: 'failed' as const, error: newJob.error_message || 'Processing failed' }
        } else if (newJob.status === 'processing') {
          return { ...q, status: 'processing' as const }
        }
      }
      return q
    }))

    // Schedule cleanup of completed/failed items
    if (newJob.status === 'completed' || newJob.status === 'failed') {
      setTimeout(() => {
        setUploadQueue(prev => prev.filter(q => q.jobId !== newJob.id))
      }, COMPLETED_CLEANUP_DELAY_MS)
    }

    // Update local state
    if (newJob.status === 'pending' || newJob.status === 'processing') {
      setActiveJob(newJob)
      setLastCompletedJob(null)
    } else {
      // Job completed/failed - set lastCompletedJob with review_status
      setLastCompletedJob(jobWithReviewStatus)
      // Then clear activeJob after a delay (1s animation + 500ms pause)
      completionTimeoutRef.current = setTimeout(() => {
        setActiveJob(null)
      }, 1500)
    }

  }, [])

  // Handle new job insertions (when upload is triggered)
  const handleJobInsert = useCallback((payload: { new: RFPUploadJob }) => {
    const newJob = payload.new

    if (newJob.status === 'pending' || newJob.status === 'processing') {
      setActiveJob(newJob)
    }
  }, [])

  // Queue files for upload (max 10 total active)
  const queueFiles = useCallback((files: File[]) => {
    setUploadQueue(prev => {
      // Count current active uploads (queued + uploading + processing)
      const currentCount = prev.filter(
        q => q.status === 'queued' || q.status === 'uploading' || q.status === 'processing'
      ).length
      const available = MAX_CONCURRENT - currentCount
      const filesToQueue = files.slice(0, Math.max(0, available))

      if (filesToQueue.length < files.length) {
        toast.warning('Limite de ficheiros', {
          description: `Apenas ${filesToQueue.length} de ${files.length} ficheiros foram adicionados. Maximo de ${MAX_CONCURRENT} em processamento simultaneo.`,
        })
      }

      const newItems: QueuedUpload[] = filesToQueue.map(file => ({
        id: crypto.randomUUID(),
        file,
        status: 'queued' as const
      }))

      return [...prev, ...newItems]
    })
  }, [])

  // Restore processing jobs from DB on mount (for page refresh persistence)
  useEffect(() => {
    const restoreActiveJobs = async () => {
      const { data: activeJobs, error } = await supabase
        .from('rfp_upload_jobs')
        .select('*')
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false })
        .limit(MAX_PARALLEL_UPLOADS)

      if (error || !activeJobs || activeJobs.length === 0) return

      setUploadQueue(prev => {
        // Don't add duplicates - check by jobId
        const existingJobIds = new Set(prev.filter(q => q.jobId).map(q => q.jobId))
        const newItems: QueuedUpload[] = activeJobs
          .filter(job => !existingJobIds.has(job.id))
          .map(job => ({
            id: job.id,
            file: null,
            status: job.status === 'pending' ? 'uploading' as const : 'processing' as const,
            jobId: job.id,
            startedAt: new Date(job.created_at),
            isRestored: true,
            fileName: job.file_name,
          }))

        return newItems.length > 0 ? [...newItems, ...prev] : prev
      })
    }

    restoreActiveJobs()
  }, [supabase])

  // Process queue - triggered when queue changes
  // Allows up to MAX_PARALLEL_UPLOADS concurrent uploads with staggered start times
  useEffect(() => {
    const processNext = async () => {
      // Prevent concurrent processing of the same queue iteration
      if (isProcessingQueueRef.current) return

      const nextQueued = uploadQueue.find(q => q.status === 'queued')
      if (!nextQueued) return

      // Count active uploads (uploading or processing)
      const activeCount = uploadQueue.filter(q =>
        q.status === 'uploading' || q.status === 'processing'
      ).length

      // Only allow up to MAX_PARALLEL_UPLOADS concurrent
      if (activeCount >= MAX_PARALLEL_UPLOADS) return

      isProcessingQueueRef.current = true

      // Mark as uploading FIRST (before stagger delay)
      setUploadQueue(prev => prev.map(q =>
        q.id === nextQueued.id ? { ...q, status: 'uploading' as const, startedAt: new Date() } : q
      ))

      // Stagger uploads - wait if there are other active uploads
      if (activeCount > 0) {
        await new Promise(resolve => setTimeout(resolve, UPLOAD_STAGGER_MS))
      }

      // RELEASE LOCK before the actual upload call
      // This allows next queued item to start processing while this one uploads
      // The item is already marked 'uploading' so it won't be picked up again
      isProcessingQueueRef.current = false

      // Now do the actual upload (without holding the lock)
      // Skip if no file (restored jobs don't have files, but they also won't be 'queued')
      if (!nextQueued.file) return

      try {
        const formData = new FormData()
        formData.append('file', nextQueued.file)
        const result = await triggerRFPUpload(formData)

        if (result.success && result.jobId) {
          // Update queue with job ID and mark as processing
          setUploadQueue(prev => prev.map(q =>
            q.id === nextQueued.id ? { ...q, jobId: result.jobId, status: 'processing' as const } : q
          ))
        } else {
          setUploadQueue(prev => prev.map(q =>
            q.id === nextQueued.id ? { ...q, status: 'failed' as const, error: result.error || 'Upload failed' } : q
          ))
          // Schedule cleanup of failed item
          setTimeout(() => {
            setUploadQueue(prev => prev.filter(q => q.id !== nextQueued.id))
          }, COMPLETED_CLEANUP_DELAY_MS)
        }
      } catch (error) {
        setUploadQueue(prev => prev.map(q =>
          q.id === nextQueued.id ? { ...q, status: 'failed' as const, error: 'Upload failed' } : q
        ))
        // Schedule cleanup of failed item
        setTimeout(() => {
          setUploadQueue(prev => prev.filter(q => q.id !== nextQueued.id))
        }, COMPLETED_CLEANUP_DELAY_MS)
      }
    }

    processNext()
  }, [uploadQueue])

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

  // Compute derived values
  const processingCount = uploadQueue.filter(
    q => q.status === 'uploading' || q.status === 'processing'
  ).length

  const queuedCount = uploadQueue.filter(q => q.status === 'queued').length

  // Manual trigger for KPI refresh (call after delete, confirm, etc.)
  const triggerKPIRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  const value: RFPUploadStatusContextValue = {
    activeJob,
    lastCompletedJob,
    isProcessing: activeJob?.status === 'pending' || activeJob?.status === 'processing',
    refetch: fetchActiveJob,
    // Multi-upload
    uploadQueue,
    queueFiles,
    processingCount,
    queuedCount,
    // Refresh trigger for KPIs
    refreshTrigger,
    triggerKPIRefresh,
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

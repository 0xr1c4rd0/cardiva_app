'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { triggerRFPUpload, getJobReviewStatus, checkDuplicateFileName } from '@/app/(dashboard)/rfps/actions'

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
  progress_percent: number | null  // 0-90 from n8n, null when not started
  items_total: number | null       // Total items from n8n, used for linear progress animation
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
  uploadingUntil?: Date   // Minimum time to show 'uploading' state (for pulsing animation)
  progressPercent?: number  // Last known progress from DB (0-90)
  itemsTotal?: number      // Total items from n8n, cached for linear animation
}

// Split contexts for performance - components only re-render when their specific data changes

// Context for upload queue operations
interface UploadQueueContextValue {
  uploadQueue: QueuedUpload[]
  queueFiles: (files: File[]) => void
  processingCount: number
  queuedCount: number
}

// Context for active job display
interface ActiveJobContextValue {
  activeJob: RFPUploadJob | null
  lastCompletedJob: RFPUploadJob | null
  isProcessing: boolean
  refetch: () => Promise<void>
}

// Context for refresh triggers (KPIs, stats)
interface RefreshContextValue {
  refreshTrigger: number
  triggerKPIRefresh: () => void
}

// Legacy combined interface (for backward compat)
interface RFPUploadStatusContextValue extends UploadQueueContextValue, ActiveJobContextValue, RefreshContextValue {}

// Split contexts
const UploadQueueContext = createContext<UploadQueueContextValue | null>(null)
const ActiveJobContext = createContext<ActiveJobContextValue | null>(null)
const RefreshContext = createContext<RefreshContextValue | null>(null)

// Legacy combined context (for backward compat - consumers that need everything)
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
const MIN_UPLOADING_DURATION_MS = 800 // Minimum time to show pulsing 'uploading' state

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
      .select('id, user_id, file_name, file_path, file_size, status, error_message, created_at, updated_at, completed_at, last_edited_by, progress_percent, items_total')
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
          // Check if minimum uploading duration has elapsed
          if (q.uploadingUntil && new Date() < q.uploadingUntil) {
            // Not enough time has passed, schedule transition for later
            const remainingMs = q.uploadingUntil.getTime() - Date.now()
            setTimeout(() => {
              setUploadQueue(prevQueue => prevQueue.map(item =>
                item.jobId === newJob.id ? {
                  ...item,
                  status: 'processing' as const,
                  progressPercent: newJob.progress_percent ?? item.progressPercent ?? 0,
                  itemsTotal: newJob.items_total ?? item.itemsTotal
                } : item
              ))
            }, remainingMs)
            // Keep current status for now, but update progress and itemsTotal
            return {
              ...q,
              progressPercent: newJob.progress_percent ?? q.progressPercent ?? 0,
              itemsTotal: newJob.items_total ?? q.itemsTotal
            }
          }
          return {
            ...q,
            status: 'processing' as const,
            progressPercent: newJob.progress_percent ?? q.progressPercent ?? 0,
            itemsTotal: newJob.items_total ?? q.itemsTotal
          }
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

      // Also add to upload queue so the processing animation shows
      // This handles email-triggered uploads that didn't go through queueFiles
      setUploadQueue(prev => {
        // Check if job already exists in queue (avoid duplicates)
        // Check both by jobId AND by fileName + uploading status (for race condition with manual uploads)
        const exists = prev.some(q =>
          q.jobId === newJob.id ||
          (q.fileName === newJob.file_name && (q.status === 'uploading' || q.status === 'processing'))
        )

        if (exists) {
          return prev
        }

        // Add new item to queue for display in processing card
        const startTime = new Date(newJob.created_at)
        const newItem: QueuedUpload = {
          id: newJob.id,
          file: null,
          status: newJob.status === 'pending' ? 'uploading' as const : 'processing' as const,
          jobId: newJob.id,
          startedAt: startTime,
          isRestored: false,
          fileName: newJob.file_name,
          // Set minimum duration for 'uploading' state (for pulsing animation visibility)
          uploadingUntil: newJob.status === 'pending'
            ? new Date(startTime.getTime() + MIN_UPLOADING_DURATION_MS)
            : undefined,
        }

        return [newItem, ...prev]
      })
    }
  }, [])

  // Queue files for upload (max 10 total active)
  const queueFiles = useCallback(async (files: File[]) => {
    // Check for duplicates in queue first
    const queuedFileNames = new Set(uploadQueue.map(q => q.fileName))
    const duplicatesInQueue = files.filter(f => queuedFileNames.has(f.name))

    if (duplicatesInQueue.length > 0) {
      toast.error('Ficheiros duplicados na fila', {
        description: `Os seguintes ficheiros já estão em processamento: ${duplicatesInQueue.map(f => f.name).join(', ')}`,
      })
    }

    // Filter out duplicates already in queue
    const uniqueFiles = files.filter(f => !queuedFileNames.has(f.name))

    if (uniqueFiles.length === 0) return

    // Check for duplicates in database
    const duplicateChecks = await Promise.all(
      uniqueFiles.map(file => checkDuplicateFileName(file.name))
    )

    const duplicatesInDB: string[] = []
    const filesToQueue: File[] = []

    uniqueFiles.forEach((file, index) => {
      if (duplicateChecks[index].isDuplicate) {
        duplicatesInDB.push(file.name)
      } else {
        filesToQueue.push(file)
      }
    })

    // Show error for database duplicates
    if (duplicatesInDB.length > 0) {
      toast.error('Ficheiros já carregados', {
        description: duplicatesInDB.length === 1
          ? `O ficheiro "${duplicatesInDB[0]}" já foi carregado anteriormente.`
          : `${duplicatesInDB.length} ficheiros já foram carregados: ${duplicatesInDB.slice(0, 3).join(', ')}${duplicatesInDB.length > 3 ? '...' : ''}`,
      })
    }

    if (filesToQueue.length === 0) return

    setUploadQueue(prev => {
      // Count current active uploads (queued + uploading + processing)
      const currentCount = prev.filter(
        q => q.status === 'queued' || q.status === 'uploading' || q.status === 'processing'
      ).length
      const available = MAX_CONCURRENT - currentCount
      const finalFilesToQueue = filesToQueue.slice(0, Math.max(0, available))

      if (finalFilesToQueue.length < filesToQueue.length) {
        toast.warning('Limite de ficheiros', {
          description: `Apenas ${finalFilesToQueue.length} de ${filesToQueue.length} ficheiros foram adicionados. Máximo de ${MAX_CONCURRENT} em processamento simultâneo.`,
        })
      }

      const newItems: QueuedUpload[] = finalFilesToQueue.map(file => ({
        id: crypto.randomUUID(),
        file,
        fileName: file.name,
        status: 'queued' as const
      }))

      return [...prev, ...newItems]
    })
  }, [uploadQueue])

  // Restore processing jobs from DB on mount (for page refresh persistence)
  useEffect(() => {
    const restoreActiveJobs = async () => {
      const { data: activeJobs, error } = await supabase
        .from('rfp_upload_jobs')
        .select('id, file_name, status, created_at, progress_percent, items_total')
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false })
        .limit(MAX_PARALLEL_UPLOADS)

      if (error || !activeJobs || activeJobs.length === 0) return

      setUploadQueue(prev => {
        // Don't add duplicates - check by jobId
        const existingJobIds = new Set(prev.filter(q => q.jobId).map(q => q.jobId))
        const newItems: QueuedUpload[] = activeJobs
          .filter(job => !existingJobIds.has(job.id))
          .map(job => {
            const startTime = new Date(job.created_at)
            return {
              id: job.id,
              file: null,
              status: job.status === 'pending' ? 'uploading' as const : 'processing' as const,
              jobId: job.id,
              startedAt: startTime,
              isRestored: true,
              fileName: job.file_name,
              // Set minimum duration for 'uploading' state (for pulsing animation visibility)
              uploadingUntil: job.status === 'pending'
                ? new Date(startTime.getTime() + MIN_UPLOADING_DURATION_MS)
                : undefined,
              // Restore progress and itemsTotal from DB
              progressPercent: job.progress_percent ?? 0,
              itemsTotal: job.items_total ?? undefined,
            }
          })

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
      const uploadStartTime = new Date()
      setUploadQueue(prev => prev.map(q =>
        q.id === nextQueued.id ? {
          ...q,
          status: 'uploading' as const,
          startedAt: uploadStartTime,
          uploadingUntil: new Date(uploadStartTime.getTime() + MIN_UPLOADING_DURATION_MS),
        } : q
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

  // Compute derived values with useMemo to prevent unnecessary re-renders
  const processingCount = useMemo(
    () => uploadQueue.filter(q => q.status === 'uploading' || q.status === 'processing').length,
    [uploadQueue]
  )

  const queuedCount = useMemo(
    () => uploadQueue.filter(q => q.status === 'queued').length,
    [uploadQueue]
  )

  // Manual trigger for KPI refresh (call after delete, confirm, etc.)
  const triggerKPIRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  // Memoize context values to prevent unnecessary re-renders
  const uploadQueueValue = useMemo<UploadQueueContextValue>(() => ({
    uploadQueue,
    queueFiles,
    processingCount,
    queuedCount,
  }), [uploadQueue, queueFiles, processingCount, queuedCount])

  const activeJobValue = useMemo<ActiveJobContextValue>(() => ({
    activeJob,
    lastCompletedJob,
    isProcessing: activeJob?.status === 'pending' || activeJob?.status === 'processing',
    refetch: fetchActiveJob,
  }), [activeJob, lastCompletedJob, fetchActiveJob])

  const refreshValue = useMemo<RefreshContextValue>(() => ({
    refreshTrigger,
    triggerKPIRefresh,
  }), [refreshTrigger, triggerKPIRefresh])

  // Legacy combined value (for backward compat)
  const combinedValue = useMemo<RFPUploadStatusContextValue>(() => ({
    ...uploadQueueValue,
    ...activeJobValue,
    ...refreshValue,
  }), [uploadQueueValue, activeJobValue, refreshValue])

  return (
    <UploadQueueContext.Provider value={uploadQueueValue}>
      <ActiveJobContext.Provider value={activeJobValue}>
        <RefreshContext.Provider value={refreshValue}>
          <RFPUploadStatusContext.Provider value={combinedValue}>
            {children}
          </RFPUploadStatusContext.Provider>
        </RefreshContext.Provider>
      </ActiveJobContext.Provider>
    </UploadQueueContext.Provider>
  )
}

/**
 * Hook to access RFP upload status from context (all data)
 * Use specialized hooks below for better performance when you only need a subset
 * Must be used within RFPUploadStatusProvider
 */
export function useRFPUploadStatus(): RFPUploadStatusContextValue {
  const context = useContext(RFPUploadStatusContext)
  if (!context) {
    throw new Error('useRFPUploadStatus must be used within RFPUploadStatusProvider')
  }
  return context
}

/**
 * Hook for upload queue operations only
 * Components using this won't re-render when activeJob or refreshTrigger changes
 */
export function useUploadQueue(): UploadQueueContextValue {
  const context = useContext(UploadQueueContext)
  if (!context) {
    throw new Error('useUploadQueue must be used within RFPUploadStatusProvider')
  }
  return context
}

/**
 * Hook for active job display only
 * Components using this won't re-render when uploadQueue or refreshTrigger changes
 */
export function useActiveJob(): ActiveJobContextValue {
  const context = useContext(ActiveJobContext)
  if (!context) {
    throw new Error('useActiveJob must be used within RFPUploadStatusProvider')
  }
  return context
}

/**
 * Hook for refresh triggers only (KPIs, stats)
 * Components using this won't re-render when uploadQueue or activeJob changes
 */
export function useRefreshTrigger(): RefreshContextValue {
  const context = useContext(RefreshContext)
  if (!context) {
    throw new Error('useRefreshTrigger must be used within RFPUploadStatusProvider')
  }
  return context
}

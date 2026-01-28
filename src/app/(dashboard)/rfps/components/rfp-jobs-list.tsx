'use client'

import { useState, useEffect, useTransition, useCallback, useRef } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { FileText, Clock, CheckCircle2, XCircle, Loader2, FileDown, Trash2, Upload, SearchX } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/empty-state'
import { useRFPUploadStatus, type RFPUploadJob } from '@/contexts/rfp-upload-status-context'
import { DeleteRFPDialog } from './delete-rfp-dialog'
import { RFPListToolbar } from './rfp-list-toolbar'
import { RFPListPagination } from './rfp-list-pagination'
import { RFPListSkeleton } from './rfp-list-skeleton'
import { getRFPFileUrl } from '../actions'

import type { ReviewStatus } from '../page'

// Animation duration for deletion (ms)
const DELETE_ANIMATION_DURATION = 400

interface ProfileInfo {
  email: string
  first_name: string
  last_name: string
  role?: 'user' | 'admin' | 'automation'
}

interface RFPJob {
  id: string
  file_name: string
  file_size: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  confirmed_at?: string | null
  review_status?: ReviewStatus
  // Optional fields for uploader/editor tracking (joined from profiles)
  user_id?: string
  last_edited_by?: string | null
  uploader?: ProfileInfo | null
  last_editor?: ProfileInfo | null
}

interface RFPListState {
  page: number
  pageSize: number
  search: string
  sortBy: 'file_name' | 'created_at'
  sortOrder: 'asc' | 'desc'
}

interface RFPJobsListProps {
  initialJobs: RFPJob[]
  totalCount: number
  initialState: RFPListState
}

// Helper to format user name
// - Automation accounts: "FirstName LastName" (full name)
// - Regular users: "FirstName L." (first name + last initial + dot)
function formatUserName(profile: ProfileInfo | null | undefined): string | null {
  if (!profile) return null

  // If we have first and last name
  if (profile.first_name && profile.last_name) {
    const firstName = profile.first_name.charAt(0).toUpperCase() + profile.first_name.slice(1).toLowerCase()

    // For automation accounts, show full name (e.g., "Gmail Bot")
    if (profile.role === 'automation') {
      const lastName = profile.last_name.charAt(0).toUpperCase() + profile.last_name.slice(1).toLowerCase()
      return `${firstName} ${lastName}`
    }

    // For regular users, show first name + last initial (e.g., "Ricardo C.")
    const lastInitial = profile.last_name.charAt(0).toUpperCase()
    return `${firstName} ${lastInitial}.`
  }

  // Fallback to email if names not available
  const emailName = profile.email.split('@')[0]
  return emailName
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

// Helper to format relative time without "aproximadamente"
function formatRelativeTime(date: Date): string {
  const result = formatDistanceToNow(date, { addSuffix: true, locale: pt })
  // Remove "aproximadamente " or "cerca de " prefixes
  return result.replace(/aproximadamente |cerca de /gi, '')
}

// Helper to fetch profile data for user IDs
async function fetchProfilesForUserIds(userIds: string[]): Promise<Map<string, ProfileInfo>> {
  const profilesMap = new Map<string, ProfileInfo>()
  if (userIds.length === 0) return profilesMap

  const supabase = createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name')
    .in('id', userIds)

  for (const profile of profiles ?? []) {
    profilesMap.set(profile.id, {
      email: profile.email,
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
    })
  }

  return profilesMap
}

// Processing status config (for pending/processing/failed jobs)
const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    variant: 'secondary' as const,
    className: 'text-muted-foreground',
    badgeClassName: '',
    dotVariant: 'pending' as const,
  },
  processing: {
    label: 'A processar',
    icon: Loader2,
    variant: 'default' as const,
    className: 'text-white animate-spin',
    badgeClassName: '',
    dotVariant: 'processing' as const,
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle2,
    variant: 'success' as const,
    className: 'text-emerald-600',
    badgeClassName: '',
    dotVariant: 'success' as const,
  },
  failed: {
    label: 'Falhou',
    icon: XCircle,
    variant: 'destructive' as const,
    className: 'text-destructive',
    badgeClassName: '',
    dotVariant: 'error' as const,
  },
}

// Review status config (for completed jobs - 3-state model)
const reviewStatusConfig = {
  por_rever: {
    label: 'Por Rever',
    icon: Clock,
    variant: 'warning' as const,
    className: 'text-amber-600',
    badgeClassName: '',
    dotVariant: 'warning' as const,
  },
  revisto: {
    label: 'Revisto',
    icon: CheckCircle2,
    variant: 'info' as const,
    className: 'text-blue-600',
    badgeClassName: '',
    dotVariant: 'info' as const,
  },
  confirmado: {
    label: 'Confirmado',
    icon: CheckCircle2,
    variant: 'success' as const,
    className: 'text-emerald-600',
    badgeClassName: '',
    dotVariant: 'success' as const,
  },
}

// Individual job row component with animation support
interface RFPJobRowProps {
  job: RFPJob
  isDeleting: boolean
  onViewPDF: (e: React.MouseEvent, jobId: string) => void
  onDeleteClick: (e: React.MouseEvent, job: RFPJob) => void
  onAnimationComplete: (jobId: string) => void
}

function RFPJobRow({ job, isDeleting, onViewPDF, onDeleteClick, onAnimationComplete }: RFPJobRowProps) {
  const [animationPhase, setAnimationPhase] = useState<'normal' | 'collapsing'>('normal')

  // Start collapse animation when isDeleting becomes true
  useEffect(() => {
    if (isDeleting && animationPhase === 'normal') {
      // Small delay to ensure state update, then start collapsing
      requestAnimationFrame(() => {
        setAnimationPhase('collapsing')
      })
    }
  }, [isDeleting, animationPhase])

  // Handle transition end
  const handleTransitionEnd = useCallback((e: React.TransitionEvent) => {
    if (e.propertyName === 'opacity' && animationPhase === 'collapsing') {
      onAnimationComplete(job.id)
    }
  }, [animationPhase, job.id, onAnimationComplete])

  // For completed jobs, use review status; otherwise use processing status
  const isCompleted = job.status === 'completed'
  const reviewStatus = job.review_status && reviewStatusConfig[job.review_status]
  const processingStatus = statusConfig[job.status]

  // Use review status for completed jobs, processing status otherwise
  const displayStatus = isCompleted && reviewStatus ? reviewStatus : processingStatus
  const StatusIcon = displayStatus.icon
  const isClickable = job.status === 'completed'
  const showActions = job.status === 'completed' || job.status === 'failed'

  const content = (
    <div
      onTransitionEnd={handleTransitionEnd}
      className={cn(
        "flex items-center justify-between px-4 py-2 border rounded transition-all ease-out",
        isClickable ? "hover:bg-muted/50 cursor-pointer" : "",
        animationPhase === 'collapsing' && "opacity-0 max-h-0 py-0 px-4 my-0 overflow-hidden border-transparent"
      )}
      style={{
        transitionDuration: animationPhase === 'collapsing' ? `${DELETE_ANIMATION_DURATION}ms` : '150ms',
        maxHeight: animationPhase === 'collapsing' ? 0 : 200,
        marginBottom: animationPhase === 'collapsing' ? 0 : undefined,
      }}
    >
      <div className="flex items-center gap-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="font-medium">{job.file_name}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Criado {formatRelativeTime(new Date(job.created_at))}
              {job.uploader && ` por ${formatUserName(job.uploader)}`}
            </span>
            {job.last_editor && job.last_edited_by && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span>
                  Editado {formatRelativeTime(new Date(job.updated_at))}
                  {` por ${formatUserName(job.last_editor)}`}
                </span>
              </>
            )}
          </div>
          {job.error_message && (
            <p className="text-sm text-destructive mt-1">{job.error_message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant={displayStatus.variant}
          className={cn("flex items-center gap-1.5", displayStatus.badgeClassName)}
        >
          <StatusIcon className={cn("h-4 w-4", displayStatus.className)} />
          {displayStatus.label}
        </Badge>

        {showActions && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => onViewPDF(e, job.id)}
              title="Ver PDF"
              aria-label="Ver PDF"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hover:bg-destructive hover:text-white hover:border-destructive"
              onClick={(e) => onDeleteClick(e, job)}
              title="Eliminar"
              aria-label="Eliminar"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </>
        )}
      </div>
    </div>
  )

  return isClickable ? (
    <Link href={`/rfps/${job.id}/matches`}>
      {content}
    </Link>
  ) : (
    <div>{content}</div>
  )
}

export function RFPJobsList({ initialJobs, totalCount, initialState }: RFPJobsListProps) {
  const [jobs, setJobs] = useState<RFPJob[]>(initialJobs)
  const [currentTotalCount, setCurrentTotalCount] = useState(totalCount)
  const { activeJob, lastCompletedJob, triggerKPIRefresh } = useRFPUploadStatus()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<{ id: string; name: string } | null>(null)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  // URL state management
  // shallow: false means setParams updates URL via Next.js router and triggers server re-render
  const [{ page, pageSize, search, sortBy, sortOrder }, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(initialState.page),
      pageSize: parseAsInteger.withDefault(initialState.pageSize),
      search: parseAsString.withDefault(initialState.search),
      sortBy: parseAsString.withDefault(initialState.sortBy),
      sortOrder: parseAsString.withDefault(initialState.sortOrder),
    },
    { shallow: false }
  )

  // Update local state when props change (server data refresh)
  // Include initialState params to ensure sync when URL params change
  useEffect(() => {
    setJobs(initialJobs)
    setCurrentTotalCount(totalCount)
  }, [initialJobs, totalCount, initialState.search, initialState.sortBy, initialState.sortOrder, initialState.page])

  // Helper to sort jobs: processing/pending at top, then by specified field/order
  const sortJobs = (jobsList: RFPJob[], field: 'file_name' | 'created_at' = 'created_at', order: 'asc' | 'desc' = 'desc'): RFPJob[] => {
    return [...jobsList].sort((a, b) => {
      // Processing/pending jobs go to top
      const aIsProcessing = a.status === 'processing' || a.status === 'pending'
      const bIsProcessing = b.status === 'processing' || b.status === 'pending'

      if (aIsProcessing && !bIsProcessing) return -1
      if (!aIsProcessing && bIsProcessing) return 1

      // Within same category, sort by specified field
      let comparison: number
      if (field === 'file_name') {
        comparison = a.file_name.localeCompare(b.file_name, 'pt')
      } else {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }

      return order === 'asc' ? comparison : -comparison
    })
  }

  // Track pending profile fetches to avoid duplicate requests
  const pendingProfileFetches = useRef<Set<string>>(new Set())

  // Track current jobs in a ref to avoid dependency issues in callbacks
  const jobsRef = useRef<RFPJob[]>(jobs)
  useEffect(() => {
    jobsRef.current = jobs
  }, [jobs])

  // Helper to add a new job with fetched profile data (async)
  const addNewJobWithProfiles = useCallback(async (job: RFPUploadJob) => {
    // Collect user IDs that need profile fetching
    const userIds: string[] = []
    if (job.user_id) userIds.push(job.user_id)
    if (job.last_edited_by) userIds.push(job.last_edited_by)

    // Fetch profiles for these user IDs
    const profilesMap = await fetchProfilesForUserIds(userIds)

    // Create job with profile data
    const jobWithProfiles: RFPJob = {
      ...job,
      uploader: job.user_id ? profilesMap.get(job.user_id) ?? null : null,
      last_editor: job.last_edited_by ? profilesMap.get(job.last_edited_by) ?? null : null,
    }

    // Add to list
    setJobs((prev) => {
      // Double-check job wasn't added while we were fetching
      if (prev.some((j) => j.id === job.id)) return prev

      const updated = [jobWithProfiles, ...prev.slice(0, pageSize - 1)]
      return sortJobs(updated, sortBy as 'file_name' | 'created_at', sortOrder as 'asc' | 'desc')
    })
  }, [pageSize, sortBy, sortOrder])

  // Handle real-time job updates (both activeJob and lastCompletedJob)
  // Always checks for existing job inside setJobs for accurate state
  const handleJobUpdate = useCallback(async (job: RFPUploadJob) => {
    // Check if last_edited_by changed - need to fetch new profile
    const existingJob = jobsRef.current.find((j) => j.id === job.id)
    const lastEditorChanged = existingJob && job.last_edited_by && job.last_edited_by !== existingJob.last_edited_by

    // Fetch new editor profile if needed
    let newEditorProfile: ReturnType<typeof fetchProfilesForUserIds> extends Promise<infer T> ? T extends Map<string, infer V> ? V | null : null : null = null
    if (lastEditorChanged) {
      const profilesMap = await fetchProfilesForUserIds([job.last_edited_by!])
      newEditorProfile = profilesMap.get(job.last_edited_by!) ?? null
    }

    // Update or add job - always check existence inside setJobs for race condition safety
    setJobs((prev) => {
      const index = prev.findIndex((j) => j.id === job.id)

      if (index >= 0) {
        // Job exists - update it
        const updated = [...prev]
        updated[index] = {
          ...prev[index],
          ...job,
          // Preserve or update editor profile
          last_editor: lastEditorChanged ? newEditorProfile : prev[index].last_editor,
        }
        return sortJobs(updated, sortBy as 'file_name' | 'created_at', sortOrder as 'asc' | 'desc')
      } else if (page === 1 && !search) {
        // Job doesn't exist yet - add it (only on first page without search)
        // This handles the case where UPDATE event arrives before INSERT finishes processing
        // For new jobs from email, we'll add them without profile data initially
        // (profile will be added when INSERT completes)
        const jobWithProfile: RFPJob = {
          ...job,
          uploader: existingJob?.uploader ?? null,
          last_editor: existingJob?.last_editor ?? null,
        }
        const updated = [jobWithProfile, ...prev.slice(0, pageSize - 1)]
        return sortJobs(updated, sortBy as 'file_name' | 'created_at', sortOrder as 'asc' | 'desc')
      }

      return prev
    })
  }, [page, search, sortBy, sortOrder, pageSize])

  // Update jobs list in real-time when activeJob changes (processing jobs)
  useEffect(() => {
    if (activeJob) {
      handleJobUpdate(activeJob)
    }
  }, [activeJob, handleJobUpdate])

  // Update jobs list when lastCompletedJob changes (completed/failed jobs)
  useEffect(() => {
    if (lastCompletedJob) {
      handleJobUpdate(lastCompletedJob)
    }
  }, [lastCompletedJob, handleJobUpdate])

  const handleViewPDF = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault()
    e.stopPropagation()

    const result = await getRFPFileUrl(jobId)
    if (result.success && result.url) {
      window.open(result.url, '_blank')
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, job: RFPJob) => {
    e.preventDefault()
    e.stopPropagation()
    setJobToDelete({ id: job.id, name: job.file_name })
    setDeleteDialogOpen(true)
  }

  // Called when delete dialog confirms deletion
  const handleDeleted = () => {
    if (jobToDelete) {
      // Start the deletion animation
      setDeletingIds(prev => new Set(prev).add(jobToDelete.id))
      setDeleteDialogOpen(false)
      // Note: actual removal happens in handleAnimationComplete
    }
  }

  // Called when the delete animation completes
  const handleAnimationComplete = useCallback((jobId: string) => {
    // Remove from jobs list
    setJobs((prev) => prev.filter((j) => j.id !== jobId))
    setCurrentTotalCount((prev) => Math.max(0, prev - 1))
    // Clean up deleting state
    setDeletingIds(prev => {
      const next = new Set(prev)
      next.delete(jobId)
      return next
    })
    setJobToDelete(null)
    // Trigger KPI refresh
    triggerKPIRefresh()
  }, [triggerKPIRefresh])

  // Store original jobs for filtering (reset when initialJobs changes)
  const [originalJobs, setOriginalJobs] = useState<RFPJob[]>(initialJobs)

  // Update original jobs when server data arrives
  useEffect(() => {
    setOriginalJobs(initialJobs)
  }, [initialJobs])

  // URL state handlers - shallow: false automatically triggers server re-render
  const handleSearchChange = (value: string) => {
    // Filter immediately for instant feedback
    if (value) {
      const searchLower = value.toLowerCase()
      const filtered = originalJobs.filter(job =>
        job.file_name.toLowerCase().includes(searchLower)
      )
      setJobs(sortJobs(filtered, sortBy as 'file_name' | 'created_at', sortOrder as 'asc' | 'desc'))
    } else {
      // Clear filter - restore original jobs
      setJobs(sortJobs(originalJobs, sortBy as 'file_name' | 'created_at', sortOrder as 'asc' | 'desc'))
    }
    // Update URL (server will refetch with full results across all pages)
    startTransition(() => {
      setParams({ search: value || null, page: 1 })
    })
  }

  const handleSortChange = (newSortBy: 'file_name' | 'created_at', newSortOrder: 'asc' | 'desc') => {
    // Sort immediately for instant feedback
    setJobs(prev => sortJobs(prev, newSortBy, newSortOrder))
    // Update URL (will also trigger server refresh for pagination correctness)
    startTransition(() => {
      setParams({ sortBy: newSortBy, sortOrder: newSortOrder, page: 1 })
    })
  }

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setParams({ page: newPage })
    })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    startTransition(() => {
      setParams({ pageSize: newPageSize, page: 1 })
    })
  }

  const handleClearSearch = () => {
    // Restore original jobs immediately
    setJobs(sortJobs(originalJobs, sortBy as 'file_name' | 'created_at', sortOrder as 'asc' | 'desc'))
    // Update URL
    startTransition(() => {
      setParams({ search: null, page: 1 })
    })
  }

  // Handle upload button click for empty state
  const handleUploadClick = () => {
    const uploadButton = document.querySelector('[data-rfp-upload-trigger]') as HTMLButtonElement
    if (uploadButton) {
      uploadButton.click()
    }
  }

  // Empty state when no jobs exist at all (not just filtered)
  const isEmptyState = currentTotalCount === 0 && !search
  // Empty state for search results
  const isSearchEmpty = jobs.length === 0 && search

  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle>Histórico de Concursos</CardTitle>
        <CardDescription>Os seus documentos de concurso carregados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toolbar - always show unless completely empty */}
        {!isEmptyState && (
          <RFPListToolbar
            search={search}
            onSearchChange={handleSearchChange}
            sortBy={sortBy as 'file_name' | 'created_at'}
            sortOrder={sortOrder as 'asc' | 'desc'}
            onSortChange={handleSortChange}
            isPending={isPending}
          />
        )}

        {/* Loading skeleton */}
        {isPending ? (
          <RFPListSkeleton />
        ) : isEmptyState ? (
          // Empty state - no jobs at all
          <EmptyState
            icon={FileText}
            title="Ainda não há concursos"
            description="Carregue o seu primeiro documento de concurso para começar a encontrar correspondências no inventário."
            action={
              <Button onClick={handleUploadClick}>
                <Upload className="mr-2 h-4 w-4" />
                Carregar primeiro concurso
              </Button>
            }
          />
        ) : isSearchEmpty ? (
          // Search empty state
          <EmptyState
            icon={SearchX}
            title="Nenhum concurso encontrado"
            description={`Não foram encontrados concursos para "${search}". Tente outro termo de pesquisa.`}
            action={
              <Button variant="outline" onClick={handleClearSearch}>
                Limpar pesquisa
              </Button>
            }
          />
        ) : (
          // Jobs list
          <div className="flex flex-col gap-2">
            {jobs.map((job) => (
              <RFPJobRow
                key={job.id}
                job={job}
                isDeleting={deletingIds.has(job.id)}
                onViewPDF={handleViewPDF}
                onDeleteClick={handleDeleteClick}
                onAnimationComplete={handleAnimationComplete}
              />
            ))}
          </div>
        )}

        {/* Pagination - show when there are jobs and not in empty state */}
        {!isEmptyState && !isSearchEmpty && jobs.length > 0 && (
          <RFPListPagination
            page={page}
            pageSize={pageSize}
            totalCount={currentTotalCount}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isPending={isPending}
          />
        )}
      </CardContent>

      <DeleteRFPDialog
        jobId={jobToDelete?.id ?? null}
        jobName={jobToDelete?.name}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={handleDeleted}
      />
    </Card>
  )
}

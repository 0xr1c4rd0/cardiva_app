'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { FileText, Clock, CheckCircle2, XCircle, Loader2, FileDown, Trash2, Upload, SearchX } from 'lucide-react'
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
import { useRFPUploadStatus, type RFPUploadJob } from '@/contexts/rfp-upload-status-context'
import { DeleteRFPDialog } from './delete-rfp-dialog'
import { RFPListToolbar } from './rfp-list-toolbar'
import { RFPListPagination } from './rfp-list-pagination'
import { RFPListSkeleton } from './rfp-list-skeleton'
import { getRFPFileUrl } from '../actions'

import type { ReviewStatus } from '../page'

// Animation duration for deletion (ms)
const DELETE_ANIMATION_DURATION = 400

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
  uploader?: {
    email: string
  } | null
  last_editor?: {
    email: string
  } | null
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

// Helper to format user email as readable name
function formatUserEmail(profile: { email: string } | null | undefined): string | null {
  if (!profile) return null
  // Extract name portion before @ for cleaner display
  const emailName = profile.email.split('@')[0]
  // Capitalize first letter of each word (split on . _ -)
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

// Processing status config (for pending/processing/failed jobs)
const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    variant: 'secondary' as const,
    className: 'text-muted-foreground',
    badgeClassName: '',
  },
  processing: {
    label: 'A processar',
    icon: Loader2,
    variant: 'default' as const,
    className: 'text-white animate-spin',
    badgeClassName: '',
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle2,
    variant: 'default' as const,
    className: 'text-green-600',
    badgeClassName: '',
  },
  failed: {
    label: 'Falhou',
    icon: XCircle,
    variant: 'destructive' as const,
    className: 'text-destructive',
    badgeClassName: '',
  },
}

// Review status config (for completed jobs - 3-state model)
const reviewStatusConfig = {
  por_rever: {
    label: 'Por Rever',
    icon: Clock,
    variant: 'secondary' as const,
    className: 'text-amber-600',
    badgeClassName: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  },
  revisto: {
    label: 'Revisto',
    icon: CheckCircle2,
    variant: 'secondary' as const,
    className: 'text-blue-600',
    badgeClassName: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  confirmado: {
    label: 'Confirmado',
    icon: CheckCircle2,
    variant: 'secondary' as const,
    className: 'text-emerald-600',
    badgeClassName: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
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
        "flex items-center justify-between p-4 border rounded-lg transition-all ease-out",
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
              {job.uploader && ` por ${formatUserEmail(job.uploader)}`}
            </span>
            {job.last_editor && job.last_edited_by && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span>
                  Editado {formatRelativeTime(new Date(job.updated_at))}
                  {` por ${formatUserEmail(job.last_editor)}`}
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
          className={cn("flex items-center gap-1", displayStatus.badgeClassName)}
        >
          <StatusIcon className={cn('h-3 w-3', displayStatus.className)} />
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
            >
              <FileDown className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hover:bg-destructive hover:text-white hover:border-destructive"
              onClick={(e) => onDeleteClick(e, job)}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
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

  // Helper to update a job in the list (real-time updates from context)
  // RFPUploadJob from context may not have uploader/editor profile joins,
  // so we merge with existing data to preserve those fields
  const updateJobInList = (job: RFPUploadJob) => {
    setJobs((prev) => {
      const index = prev.findIndex((j) => j.id === job.id)
      let updated: RFPJob[]

      if (index >= 0) {
        // Update existing job - preserve profile data from initial server fetch
        updated = [...prev]
        updated[index] = {
          ...prev[index],  // Keep existing uploader/last_editor profile data
          ...job,          // Overlay with real-time status updates
        }
      } else if (page === 1 && !search) {
        // New job - prepend to list (only if on first page with no search filter)
        // Note: new real-time jobs won't have profile data until page refresh
        updated = [{ ...job } as RFPJob, ...prev.slice(0, pageSize - 1)]
      } else {
        return prev
      }

      // Sort to keep processing jobs at top, respecting current sort settings
      return sortJobs(updated, sortBy as 'file_name' | 'created_at', sortOrder as 'asc' | 'desc')
    })
  }

  // Update jobs list in real-time when activeJob changes (processing jobs)
  useEffect(() => {
    if (activeJob) {
      updateJobInList(activeJob)
    }
  }, [activeJob])

  // Update jobs list when lastCompletedJob changes (completed/failed jobs)
  useEffect(() => {
    if (lastCompletedJob) {
      updateJobInList(lastCompletedJob)
    }
  }, [lastCompletedJob])

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
    <Card>
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 rounded-full bg-muted p-6">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Ainda não há concursos</h3>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Carregue o seu primeiro documento de concurso para começar a encontrar correspondências no inventário.
            </p>
            <Button onClick={handleUploadClick}>
              <Upload className="mr-2 h-4 w-4" />
              Carregar primeiro concurso
            </Button>
          </div>
        ) : isSearchEmpty ? (
          // Search empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 rounded-full bg-muted p-6">
              <SearchX className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Nenhum concurso encontrado</h3>
            <p className="mb-6 max-w-sm text-muted-foreground">
              Não foram encontrados concursos para &quot;{search}&quot;. Tente outro termo de pesquisa.
            </p>
            <Button variant="outline" onClick={handleClearSearch}>
              Limpar pesquisa
            </Button>
          </div>
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

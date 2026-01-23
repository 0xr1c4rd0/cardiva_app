'use client'

import { useState, useEffect, useTransition } from 'react'
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

interface RFPJob {
  id: string
  file_name: string
  file_size: number | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  completed_at: string | null
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

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    variant: 'secondary' as const,
    className: 'text-muted-foreground',
  },
  processing: {
    label: 'A processar',
    icon: Loader2,
    variant: 'default' as const,
    className: 'text-white animate-spin',
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle2,
    variant: 'default' as const,
    className: 'text-green-600',
  },
  failed: {
    label: 'Falhou',
    icon: XCircle,
    variant: 'destructive' as const,
    className: 'text-destructive',
  },
}

export function RFPJobsList({ initialJobs, totalCount, initialState }: RFPJobsListProps) {
  const [jobs, setJobs] = useState<RFPJob[]>(initialJobs)
  const [currentTotalCount, setCurrentTotalCount] = useState(totalCount)
  const { activeJob, lastCompletedJob } = useRFPUploadStatus()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  // URL state management
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
  useEffect(() => {
    setJobs(initialJobs)
    setCurrentTotalCount(totalCount)
  }, [initialJobs, totalCount])

  // Helper to update a job in the list
  const updateJobInList = (job: RFPUploadJob) => {
    setJobs((prev) => {
      const index = prev.findIndex((j) => j.id === job.id)
      if (index >= 0) {
        // Update existing job
        const updated = [...prev]
        updated[index] = job as RFPJob
        return updated
      }
      // New job - prepend to list (only if on first page with no search filter)
      if (page === 1 && !search) {
        return [job as RFPJob, ...prev.slice(0, pageSize - 1)]
      }
      return prev
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

  const handleDeleted = () => {
    if (jobToDelete) {
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id))
      setCurrentTotalCount((prev) => Math.max(0, prev - 1))
      setJobToDelete(null)
    }
  }

  // URL state handlers
  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setParams({ search: value || null, page: 1 })
    })
  }

  const handleSortChange = (newSortBy: 'file_name' | 'created_at', newSortOrder: 'asc' | 'desc') => {
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
            {jobs.map((job) => {
              const status = statusConfig[job.status]
              const StatusIcon = status.icon
              const isClickable = job.status === 'completed'
              const showActions = job.status === 'completed' || job.status === 'failed'

              const content = (
                <div
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-lg transition-colors",
                    isClickable ? "hover:bg-muted/50 cursor-pointer" : ""
                  )}
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{job.file_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {job.file_size && (
                          <span>{(job.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        )}
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: pt })}
                        </span>
                      </div>
                      {job.error_message && (
                        <p className="text-sm text-destructive mt-1">{job.error_message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={status.variant} className="flex items-center gap-1">
                      <StatusIcon className={cn('h-3 w-3', status.className)} />
                      {status.label}
                    </Badge>

                    {showActions && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleViewPDF(e, job.id)}
                          title="Ver PDF"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive hover:text-white hover:border-destructive"
                          onClick={(e) => handleDeleteClick(e, job)}
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
                <Link key={job.id} href={`/rfps/${job.id}/matches`}>
                  {content}
                </Link>
              ) : (
                <div key={job.id}>{content}</div>
              )
            })}
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

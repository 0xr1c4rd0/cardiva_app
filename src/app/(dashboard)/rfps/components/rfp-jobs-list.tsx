'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { FileText, Clock, CheckCircle2, XCircle, Loader2, FileDown, Trash2 } from 'lucide-react'
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

interface RFPJobsListProps {
  initialJobs: RFPJob[]
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

export function RFPJobsList({ initialJobs }: RFPJobsListProps) {
  const [jobs, setJobs] = useState<RFPJob[]>(initialJobs)
  const { activeJob } = useRFPUploadStatus()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<{ id: string; name: string } | null>(null)

  // Update jobs list in real-time when activeJob changes
  useEffect(() => {
    if (activeJob) {
      setJobs((prev) => {
        const index = prev.findIndex((j) => j.id === activeJob.id)
        if (index >= 0) {
          // Update existing job
          const updated = [...prev]
          updated[index] = activeJob as RFPJob
          return updated
        }
        // New job - prepend to list
        return [activeJob as RFPJob, ...prev]
      })
    }
  }, [activeJob])

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
      setJobToDelete(null)
    }
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-center">
            Ainda não há concursos carregados. Carregue o seu primeiro concurso para começar.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carregamentos Recentes</CardTitle>
        <CardDescription>Os seus documentos de concurso carregados recentemente</CardDescription>
      </CardHeader>
      <CardContent>
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

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { FileText, Clock, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RecentRFP {
  id: string
  file_name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  review_status: 'por_rever' | 'revisto' | 'confirmado' | null
  created_at: string
}

interface DashboardRecentRFPsProps {
  rfps: RecentRFP[]
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
    variant: 'success' as const,
    className: 'text-emerald-600',
  },
  failed: {
    label: 'Falhou',
    icon: XCircle,
    variant: 'destructive' as const,
    className: 'text-destructive',
  },
}

const reviewStatusConfig = {
  por_rever: {
    label: 'Por Rever',
    icon: Clock,
    variant: 'warning' as const,
    className: 'text-amber-600',
  },
  revisto: {
    label: 'Revisto',
    icon: CheckCircle2,
    variant: 'info' as const,
    className: 'text-blue-600',
  },
  confirmado: {
    label: 'Confirmado',
    icon: CheckCircle2,
    variant: 'success' as const,
    className: 'text-emerald-600',
  },
}

function formatRelativeTime(date: Date): string {
  const result = formatDistanceToNow(date, { addSuffix: true, locale: pt })
  return result.replace(/aproximadamente |cerca de /gi, '')
}

export function DashboardRecentRFPs({ rfps }: DashboardRecentRFPsProps) {
  if (rfps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Concursos Recentes</CardTitle>
          <CardDescription>Os seus últimos documentos carregados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Ainda não há concursos</p>
            <Button asChild className="mt-4">
              <Link href="/rfps">Carregar primeiro concurso</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Concursos Recentes</CardTitle>
          <CardDescription>Os seus últimos documentos carregados</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/rfps" className="flex items-center gap-1">
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rfps.map((rfp) => {
            const isCompleted = rfp.status === 'completed'
            const reviewStatus = rfp.review_status && reviewStatusConfig[rfp.review_status]
            const processingStatus = statusConfig[rfp.status]
            const displayStatus = isCompleted && reviewStatus ? reviewStatus : processingStatus
            const StatusIcon = displayStatus.icon
            const isClickable = rfp.status === 'completed'

            const content = (
              <div
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  isClickable && "hover:bg-muted/50 cursor-pointer"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{rfp.file_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatRelativeTime(new Date(rfp.created_at))}
                    </p>
                  </div>
                </div>
                <Badge variant={displayStatus.variant} className="flex items-center gap-1.5 flex-shrink-0">
                  <StatusIcon className={cn("h-3.5 w-3.5", displayStatus.className)} />
                  {displayStatus.label}
                </Badge>
              </div>
            )

            return isClickable ? (
              <Link key={rfp.id} href={`/rfps/${rfp.id}/matches`}>
                {content}
              </Link>
            ) : (
              <div key={rfp.id}>{content}</div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

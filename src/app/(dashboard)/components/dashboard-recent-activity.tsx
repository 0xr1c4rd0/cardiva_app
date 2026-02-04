import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { FileText, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RecentActivityItem {
  id: string
  file_name: string
  status: 'queued' | 'pending' | 'processing' | 'completed' | 'failed'
  review_status: 'por_rever' | 'revisto' | 'confirmado' | null
  created_at: string
}

interface DashboardRecentActivityProps {
  items: RecentActivityItem[]
}

const statusConfig = {
  queued: {
    label: 'Na fila',
    icon: Clock,
    variant: 'secondary' as const,
    className: 'text-muted-foreground',
  },
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

export function DashboardRecentActivity({ items }: DashboardRecentActivityProps) {
  if (items.length === 0) {
    return (
      <Card className="py-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Atividade Recente</CardTitle>
          <CardDescription>Últimos concursos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Ainda não há atividade</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Atividade Recente</CardTitle>
        <CardDescription>Últimos concursos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => {
            const isCompleted = item.status === 'completed'
            const reviewStatus = item.review_status && item.review_status !== 'por_rever'
              ? reviewStatusConfig[item.review_status as 'revisto' | 'confirmado']
              : null
            const processingStatus = statusConfig[item.status]
            const displayStatus = isCompleted && reviewStatus ? reviewStatus : processingStatus
            const StatusIcon = displayStatus.icon
            const isClickable = item.status === 'completed'

            const innerContent = (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(item.created_at))}
                    </p>
                  </div>
                </div>
                <Badge variant={displayStatus.variant} className="flex items-center gap-1.5 flex-shrink-0">
                  <StatusIcon className={cn("h-3 w-3", displayStatus.className)} />
                  {displayStatus.label}
                </Badge>
              </>
            )

            return isClickable ? (
              <Link
                key={item.id}
                href={`/rfps/${item.id}/matches`}
                className="flex items-center justify-between p-3 rounded border transition-colors hover:bg-muted/50"
              >
                {innerContent}
              </Link>
            ) : (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded border transition-colors"
              >
                {innerContent}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

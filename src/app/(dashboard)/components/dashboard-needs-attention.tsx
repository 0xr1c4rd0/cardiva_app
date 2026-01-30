import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'
import { AlertCircle, CheckCircle2, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface NeedsAttentionItem {
  id: string
  file_name: string
  created_at: string
}

interface DashboardNeedsAttentionProps {
  items: NeedsAttentionItem[]
}

function formatRelativeTime(date: Date): string {
  const result = formatDistanceToNow(date, { addSuffix: true, locale: pt })
  return result.replace(/aproximadamente |cerca de /gi, '')
}

export function DashboardNeedsAttention({ items }: DashboardNeedsAttentionProps) {
  if (items.length === 0) {
    return (
      <Card className="py-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">A Necessitar Atenção</CardTitle>
          <CardDescription>Concursos por rever</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="rounded-full bg-emerald-100 p-3 mb-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm text-muted-foreground">Nenhum concurso pendente</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-6">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">A Necessitar Atenção</CardTitle>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        </div>
        <CardDescription>Concursos por rever</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/rfps/${item.id}/matches`}
              className="flex items-center justify-between p-3 rounded border transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(new Date(item.created_at))}
                  </p>
                </div>
              </div>
              <Badge variant="warning" className="flex items-center gap-1.5 flex-shrink-0">
                <AlertCircle className="h-3 w-3" />
                Por Rever
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

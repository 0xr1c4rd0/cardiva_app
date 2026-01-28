import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function RFPsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Processamento de Concursos</h1>
          <p className="text-muted-foreground">
            Carregar e processar documentos de concursos para correspondência com o inventário
          </p>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Jobs list skeleton */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>Histórico de Concursos</CardTitle>
          <CardDescription>Os seus documentos de concurso carregados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toolbar skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>

          {/* List skeleton */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="flex items-center justify-between px-4 py-2 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-sm" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20 rounded-sm" />
                  <Skeleton className="h-8 w-8 rounded-sm" />
                  <Skeleton className="h-8 w-8 rounded-sm" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="flex items-center justify-between px-2 py-4">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ChartData } from './dashboard-chart-content'

// Dynamic import with ssr: false to prevent recharts from being included in the initial bundle
// Recharts (~900KB) is only loaded when this component mounts
const DashboardChartContent = dynamic(
  () => import('./dashboard-chart-content').then((mod) => mod.DashboardChartContent),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
)

function ChartSkeleton() {
  return (
    <div className="flex h-[300px] flex-col gap-4 p-4">
      {/* Y-axis and bars skeleton */}
      <div className="flex flex-1 gap-4">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between py-2">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-6" />
        </div>
        {/* Bars area */}
        <div className="flex flex-1 items-end gap-8 px-4">
          {[65, 45, 80, 55, 70, 40].map((height, i) => (
            <div key={i} className="flex flex-1 items-end gap-1">
              <Skeleton className="flex-1" style={{ height: `${height}%` }} />
              <Skeleton className="flex-1" style={{ height: `${height * 0.7}%` }} />
            </div>
          ))}
        </div>
      </div>
      {/* X-axis labels */}
      <div className="ml-10 flex justify-between px-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

interface DashboardChartProps {
  data: ChartData[]
}

export function DashboardChart({ data }: DashboardChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividade Mensal</CardTitle>
          <CardDescription>Concursos e correspondências nos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Sem dados para exibir
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Mensal</CardTitle>
        <CardDescription>Concursos e correspondências nos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <DashboardChartContent data={data} />
      </CardContent>
    </Card>
  )
}

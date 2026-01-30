'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { VolumeData } from './dashboard-volume-chart'
import type { EfficiencyData } from './dashboard-efficiency-chart'

// Dynamic imports for chart components (Recharts is ~900KB)
const DashboardVolumeChart = dynamic(
  () => import('./dashboard-volume-chart').then((mod) => mod.DashboardVolumeChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
)

const DashboardEfficiencyChart = dynamic(
  () => import('./dashboard-efficiency-chart').then((mod) => mod.DashboardEfficiencyChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
)

function ChartSkeleton() {
  return (
    <Card className="py-6">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="h-[180px] flex items-end gap-4 pt-4">
          {[40, 65, 45, 80, 55, 70].map((height, i) => (
            <Skeleton key={i} className="flex-1" style={{ height: `${height}%` }} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardChartsProps {
  volumeData: VolumeData[]
  efficiencyData: EfficiencyData[]
}

export function DashboardCharts({ volumeData, efficiencyData }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DashboardVolumeChart data={volumeData} />
      <DashboardEfficiencyChart data={efficiencyData} />
    </div>
  )
}

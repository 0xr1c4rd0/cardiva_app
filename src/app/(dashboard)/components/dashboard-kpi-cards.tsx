'use client'

import { FileText, Package, AlertCircle, TrendingUp } from 'lucide-react'
import { KPIStatsCard } from '@/components/dashboard/kpi-stats-card'

interface DashboardKPICardsProps {
  totalRFPs: number
  rfpsThisMonth: number
  totalMatches: number
  matchesThisMonth: number
  pendingReview: number
  acceptanceRate: number
}

export function DashboardKPICards({
  totalRFPs,
  rfpsThisMonth,
  totalMatches,
  matchesThisMonth,
  pendingReview,
  acceptanceRate,
}: DashboardKPICardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KPIStatsCard
        label="Concursos Processados"
        value={totalRFPs}
        valueDetail={rfpsThisMonth > 0 ? `+${rfpsThisMonth} este mês` : undefined}
        icon={FileText}
        iconContainerClassName="bg-slate-100 text-slate-600"
      />
      <KPIStatsCard
        label="Por Rever"
        value={pendingReview}
        valueDetail="com decisões pendentes"
        icon={AlertCircle}
        iconContainerClassName="bg-amber-100 text-amber-600"
        iconClassName={pendingReview > 0 ? "animate-pulse" : ""}
      />
      <KPIStatsCard
        label="Produtos Correspondidos"
        value={totalMatches}
        valueDetail={matchesThisMonth > 0 ? `+${matchesThisMonth} este mês` : undefined}
        icon={Package}
        iconContainerClassName="bg-blue-100 text-blue-600"
      />
      <KPIStatsCard
        label="Taxa de Aceitação"
        value={`${acceptanceRate}%`}
        icon={TrendingUp}
        iconContainerClassName={acceptanceRate >= 80 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"}
      />
    </div>
  )
}

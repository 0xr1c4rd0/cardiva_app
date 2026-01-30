import { getDashboardStats } from './actions'
import { DashboardKPICards } from './components/dashboard-kpi-cards'
import { DashboardNeedsAttention } from './components/dashboard-needs-attention'
import { DashboardRecentActivity } from './components/dashboard-recent-activity'
import { DashboardCharts } from './components/dashboard-charts'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao Cardiva - Correspondência de Concursos
        </p>
      </div>

      {/* KPI Cards */}
      <DashboardKPICards
        totalRFPs={stats.totalRFPs}
        rfpsThisMonth={stats.rfpsThisMonth}
        totalMatches={stats.totalMatches}
        matchesThisMonth={stats.matchesThisMonth}
        pendingReview={stats.pendingReview}
        acceptanceRate={stats.acceptanceRate}
      />

      {/* Charts */}
      <DashboardCharts
        volumeData={stats.monthlyVolume}
        efficiencyData={stats.monthlyEfficiency}
      />

      {/* Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardNeedsAttention items={stats.needsAttention} />
        <DashboardRecentActivity items={stats.recentActivity} />
      </div>
    </div>
  )
}

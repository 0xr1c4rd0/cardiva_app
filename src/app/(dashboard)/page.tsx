import { FileText, Package, CheckCircle2, TrendingUp, AlertCircle, Upload } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getDashboardStats } from './actions'
import { DashboardKPICard } from './components/dashboard-kpi-card'
import { DashboardChart } from './components/dashboard-chart'
import { DashboardRecentRFPs } from './components/dashboard-recent-rfps'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Bem-vindo ao Cardiva - Correspondência de Concursos
          </p>
        </div>
        <Button asChild>
          <Link href="/rfps">
            <Upload className="mr-2 h-4 w-4" />
            Carregar Concurso
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardKPICard
          title="Concursos Processados"
          value={stats.totalRFPs}
          subtitle={stats.rfpsThisMonth > 0 ? `+${stats.rfpsThisMonth} este mês` : undefined}
          icon={FileText}
          variant="highlight"
        />
        <DashboardKPICard
          title="Produtos Correspondidos"
          value={stats.totalMatches.toLocaleString('pt-PT')}
          subtitle={stats.matchesThisMonth > 0 ? `+${stats.matchesThisMonth} este mês` : undefined}
          icon={Package}
        />
        <DashboardKPICard
          title="Pendentes de Revisão"
          value={stats.pendingReview}
          icon={AlertCircle}
          variant={stats.pendingReview > 0 ? 'warning' : 'default'}
        />
        <DashboardKPICard
          title="Taxa de Aceitação"
          value={`${stats.acceptanceRate}%`}
          icon={stats.acceptanceRate >= 80 ? CheckCircle2 : TrendingUp}
          variant={stats.acceptanceRate >= 80 ? 'highlight' : 'default'}
        />
      </div>

      {/* Chart and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DashboardChart data={stats.monthlyData} />
        </div>
        <div className="lg:col-span-2">
          <DashboardRecentRFPs rfps={stats.recentRFPs} />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/rfps"
          className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
        >
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground">Gerir Concursos</h2>
            <p className="text-sm text-muted-foreground">
              Ver todos os concursos e rever correspondências
            </p>
          </div>
        </Link>

        <Link
          href="/inventory"
          className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent"
        >
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground">Inventário</h2>
            <p className="text-sm text-muted-foreground">
              Consultar e gerir produtos do catálogo
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}

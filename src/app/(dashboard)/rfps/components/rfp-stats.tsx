import { createClient } from '@/lib/supabase/server'
import { KPIStatsCard } from '@/components/dashboard/kpi-stats-card'
import { FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export async function RFPStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch jobs stats (id and status)
    const { data: jobStats } = await supabase
        .from('rfp_upload_jobs')
        .select('id, status')
        .eq('user_id', user.id)

    if (!jobStats) return null

    // Get list of user's job IDs to filter items
    const userJobIds = jobStats.map(job => job.id)

    // Query for unique jobs that have pending items
    // "Pending matches to be confirmed" -> items with review_status = 'pending'
    // We filter by userJobIds to ensure we only count this user's jobs
    let pendingReviewCount = 0

    if (userJobIds.length > 0) {
        const { data: pendingItems } = await supabase
            .from('rfp_items')
            .select('job_id')
            .eq('review_status', 'pending')
            .in('job_id', userJobIds)

        // Count unique job_ids from pending items
        pendingReviewCount = new Set(pendingItems?.map(i => i.job_id)).size
    }

    const total = jobStats.length
    const completed = jobStats.filter(s => s.status === 'completed').length
    const failed = jobStats.filter(s => s.status === 'failed').length

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPIStatsCard
                label="Total Concursos"
                value={total}
                icon={FileText}
                description="Documentos carregados"
                iconContainerClassName="bg-slate-100 text-slate-600"
            />

            <KPIStatsCard
                label="Concluídos"
                value={completed}
                icon={CheckCircle2}
                description="Processados com sucesso"
                iconContainerClassName="bg-emerald-100 text-emerald-600"
            />

            <KPIStatsCard
                label="Por Rever"
                value={pendingReviewCount}
                icon={Loader2}
                description="Concursos com itens pendentes"
                iconContainerClassName="bg-amber-100 text-amber-600"
                iconClassName={pendingReviewCount > 0 ? "animate-pulse" : ""}
            />

            {failed > 0 && (
                <KPIStatsCard
                    label="Falhas"
                    value={failed}
                    icon={AlertCircle}
                    description="Erros no processamento"
                    iconContainerClassName="bg-red-100 text-red-600"
                />
            )}
        </div>
    )
}

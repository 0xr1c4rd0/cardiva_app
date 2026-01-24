import { createClient } from '@/lib/supabase/server'
import { KPIStatsCard } from '@/components/dashboard/kpi-stats-card'
import { Clock, CheckCircle2, BadgeCheck, FileText } from 'lucide-react'

/**
 * 3-State KPI Model for RFP workflow:
 *
 * 1. Por Rever (amber): Jobs with pending items that need human decision
 *    - Has at least 1 rfp_item where:
 *      - review_status = 'pending'
 *      - has rfp_match_suggestions with status = 'pending'
 *      - NO suggestion has 100% similarity (auto-accepted)
 *
 * 2. Revistos (blue): Jobs where all items addressed but not confirmed
 *    - status = 'completed'
 *    - confirmed_at IS NULL
 *    - No pending items needing decision
 *
 * 3. Confirmados (emerald): Jobs where user clicked Confirm button
 *    - confirmed_at IS NOT NULL
 */

export async function RFPStats() {
    const supabase = await createClient()

    // Fetch total count of all RFP jobs
    const { count: totalCount } = await supabase
        .from('rfp_upload_jobs')
        .select('*', { count: 'exact', head: true })

    // Fetch all completed jobs with confirmation status
    const { data: completedJobs } = await supabase
        .from('rfp_upload_jobs')
        .select('id, confirmed_at')
        .eq('status', 'completed')

    if (!completedJobs) return null

    // Count Confirmados: jobs with confirmed_at set
    const confirmedCount = completedJobs.filter(j => j.confirmed_at !== null).length

    // Get unconfirmed jobs to check for pending decisions
    const unconfirmedJobs = completedJobs.filter(j => j.confirmed_at === null)
    const unconfirmedJobIds = unconfirmedJobs.map(j => j.id)

    let porReverCount = 0

    if (unconfirmedJobIds.length > 0) {
        // For each unconfirmed job, check if it has pending items needing decision
        // A job is "Por Rever" if ANY item has:
        // - review_status = 'pending'
        // - at least 1 suggestion with status = 'pending'
        // - does NOT have a 100% match (auto-accepted)

        // First, get items with pending review status for unconfirmed jobs
        const { data: pendingItems } = await supabase
            .from('rfp_items')
            .select(`
                id,
                job_id,
                review_status,
                rfp_match_suggestions!rfp_match_suggestions_rfp_item_id_fkey (
                    status,
                    similarity_score
                )
            `)
            .in('job_id', unconfirmedJobIds)
            .eq('review_status', 'pending')

        // Group by job_id and determine which jobs need review
        const jobsNeedingReview = new Set<string>()

        for (const item of pendingItems ?? []) {
            const suggestions = item.rfp_match_suggestions as Array<{
                status: string
                similarity_score: number
            }>

            if (!suggestions || suggestions.length === 0) continue

            // Check if there are pending suggestions
            const hasPendingSuggestion = suggestions.some(s => s.status === 'pending')
            // Check if there's a 100% match (auto-accepted)
            const hasExactMatch = suggestions.some(s => s.similarity_score >= 0.9999)

            // Item needs decision if it has pending suggestions but no 100% match
            if (hasPendingSuggestion && !hasExactMatch) {
                jobsNeedingReview.add(item.job_id)
            }
        }

        porReverCount = jobsNeedingReview.size
    }

    // Revistos: unconfirmed jobs that don't need review
    const revistosCount = unconfirmedJobs.length - porReverCount

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <KPIStatsCard
                label="Total"
                value={totalCount ?? 0}
                icon={FileText}
                description="Total de concursos"
                iconContainerClassName="bg-slate-100 text-slate-600"
            />

            <KPIStatsCard
                label="Por Rever"
                value={porReverCount}
                icon={Clock}
                description="Concursos com decisoes pendentes"
                iconContainerClassName="bg-amber-100 text-amber-600"
                iconClassName={porReverCount > 0 ? "animate-pulse" : ""}
            />

            <KPIStatsCard
                label="Revistos"
                value={revistosCount}
                icon={CheckCircle2}
                description="Revistos, por confirmar"
                iconContainerClassName="bg-blue-100 text-blue-600"
            />

            <KPIStatsCard
                label="Confirmados"
                value={confirmedCount}
                icon={BadgeCheck}
                description="Prontos para exportacao"
                iconContainerClassName="bg-emerald-100 text-emerald-600"
            />
        </div>
    )
}

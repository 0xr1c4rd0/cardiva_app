'use server'

import { createClient } from '@/lib/supabase/server'

export interface DashboardStats {
  // KPI metrics
  totalRFPs: number
  totalMatches: number
  pendingReview: number
  acceptanceRate: number
  // This month
  rfpsThisMonth: number
  matchesThisMonth: number
  // Chart data
  monthlyData: Array<{
    month: string
    rfps: number
    matches: number
  }>
  // Recent RFPs
  recentRFPs: Array<{
    id: string
    file_name: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    review_status: 'por_rever' | 'revisto' | 'confirmado' | null
    created_at: string
  }>
}

/**
 * Fetch all dashboard statistics in a single server action
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return getEmptyStats()
  }

  // Get date boundaries
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  // Parallel queries for performance
  const [
    totalRFPsResult,
    rfpsThisMonthResult,
    pendingReviewResult,
    matchStatsResult,
    monthlyRFPsResult,
    recentRFPsResult,
  ] = await Promise.all([
    // Total completed RFPs
    supabase
      .from('rfp_upload_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed'),

    // RFPs this month
    supabase
      .from('rfp_upload_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString()),

    // Jobs needing review (completed, not confirmed, with pending items)
    getPendingReviewCount(supabase),

    // Match statistics (accepted, rejected counts)
    supabase
      .from('rfp_match_suggestions')
      .select('status, created_at'),

    // Monthly RFP counts for chart (last 6 months)
    supabase
      .from('rfp_upload_jobs')
      .select('created_at')
      .eq('status', 'completed')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true }),

    // Recent RFPs for activity list
    supabase
      .from('rfp_upload_jobs')
      .select('id, file_name, status, confirmed_at, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Process match statistics
  const matchStats = matchStatsResult.data ?? []
  const acceptedMatches = matchStats.filter(m => m.status === 'accepted').length
  const rejectedMatches = matchStats.filter(m => m.status === 'rejected').length
  const totalDecisions = acceptedMatches + rejectedMatches
  const acceptanceRate = totalDecisions > 0
    ? Math.round((acceptedMatches / totalDecisions) * 100)
    : 0

  // Matches this month
  const matchesThisMonth = matchStats.filter(m => {
    const matchDate = new Date(m.created_at)
    return m.status === 'accepted' && matchDate >= startOfMonth
  }).length

  // Process monthly data for chart
  const monthlyData = processMonthlyData(
    monthlyRFPsResult.data ?? [],
    matchStats.filter(m => m.status === 'accepted'),
    sixMonthsAgo
  )

  // Process recent RFPs with review status
  const recentRFPs = await addReviewStatusToJobs(
    supabase,
    recentRFPsResult.data ?? []
  )

  return {
    totalRFPs: totalRFPsResult.count ?? 0,
    totalMatches: acceptedMatches,
    pendingReview: pendingReviewResult,
    acceptanceRate,
    rfpsThisMonth: rfpsThisMonthResult.count ?? 0,
    matchesThisMonth,
    monthlyData,
    recentRFPs,
  }
}

/**
 * Get count of jobs that need review
 */
async function getPendingReviewCount(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<number> {
  // Get completed, unconfirmed jobs
  const { data: unconfirmedJobs } = await supabase
    .from('rfp_upload_jobs')
    .select('id')
    .eq('status', 'completed')
    .is('confirmed_at', null)

  if (!unconfirmedJobs || unconfirmedJobs.length === 0) return 0

  const jobIds = unconfirmedJobs.map(j => j.id)

  // Get items with pending decisions
  const { data: pendingItems } = await supabase
    .from('rfp_items')
    .select(`
      job_id,
      rfp_match_suggestions!rfp_match_suggestions_rfp_item_id_fkey (
        status,
        similarity_score
      )
    `)
    .in('job_id', jobIds)
    .eq('review_status', 'pending')

  // Count unique jobs needing review
  const jobsNeedingReview = new Set<string>()

  for (const item of pendingItems ?? []) {
    const suggestions = item.rfp_match_suggestions as Array<{
      status: string
      similarity_score: number
    }>

    if (!suggestions || suggestions.length === 0) continue

    const hasPendingSuggestion = suggestions.some(s => s.status === 'pending')
    const hasExactMatch = suggestions.some(s => s.similarity_score >= 0.9999)

    if (hasPendingSuggestion && !hasExactMatch) {
      jobsNeedingReview.add(item.job_id)
    }
  }

  return jobsNeedingReview.size
}

/**
 * Process monthly data for the chart
 */
function processMonthlyData(
  rfps: Array<{ created_at: string }>,
  acceptedMatches: Array<{ created_at: string }>,
  startDate: Date
): DashboardStats['monthlyData'] {
  const months: DashboardStats['monthlyData'] = []
  const now = new Date()

  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM
    const monthLabel = date.toLocaleDateString('pt-PT', { month: 'short' })

    const rfpCount = rfps.filter(r => r.created_at.startsWith(monthKey)).length
    const matchCount = acceptedMatches.filter(m => m.created_at.startsWith(monthKey)).length

    months.push({
      month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      rfps: rfpCount,
      matches: matchCount,
    })
  }

  return months
}

/**
 * Add review status to jobs
 */
async function addReviewStatusToJobs(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobs: Array<{
    id: string
    file_name: string
    status: string
    confirmed_at: string | null
    created_at: string
  }>
): Promise<DashboardStats['recentRFPs']> {
  const completedUnconfirmedIds = jobs
    .filter(j => j.status === 'completed' && !j.confirmed_at)
    .map(j => j.id)

  let reviewStatusMap = new Map<string, 'por_rever' | 'revisto'>()

  if (completedUnconfirmedIds.length > 0) {
    const { data: pendingItems } = await supabase
      .from('rfp_items')
      .select(`
        job_id,
        rfp_match_suggestions!rfp_match_suggestions_rfp_item_id_fkey (
          status,
          similarity_score
        )
      `)
      .in('job_id', completedUnconfirmedIds)
      .eq('review_status', 'pending')

    const jobsNeedingReview = new Set<string>()

    for (const item of pendingItems ?? []) {
      const suggestions = item.rfp_match_suggestions as Array<{
        status: string
        similarity_score: number
      }>

      if (!suggestions?.length) continue

      const hasPending = suggestions.some(s => s.status === 'pending')
      const hasExact = suggestions.some(s => s.similarity_score >= 0.9999)

      if (hasPending && !hasExact) {
        jobsNeedingReview.add(item.job_id)
      }
    }

    for (const jobId of completedUnconfirmedIds) {
      reviewStatusMap.set(jobId, jobsNeedingReview.has(jobId) ? 'por_rever' : 'revisto')
    }
  }

  return jobs.map(job => ({
    id: job.id,
    file_name: job.file_name,
    status: job.status as DashboardStats['recentRFPs'][0]['status'],
    review_status: job.status === 'completed'
      ? job.confirmed_at
        ? 'confirmado'
        : reviewStatusMap.get(job.id) ?? 'revisto'
      : null,
    created_at: job.created_at,
  }))
}

function getEmptyStats(): DashboardStats {
  return {
    totalRFPs: 0,
    totalMatches: 0,
    pendingReview: 0,
    acceptanceRate: 0,
    rfpsThisMonth: 0,
    matchesThisMonth: 0,
    monthlyData: [],
    recentRFPs: [],
  }
}

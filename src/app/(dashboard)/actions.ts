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
  // Chart data - Volume (RFPs over time)
  monthlyVolume: Array<{
    month: string
    rfps: number
  }>
  // Chart data - Efficiency (acceptance rate trend)
  monthlyEfficiency: Array<{
    month: string
    rate: number
  }>
  // Needs Attention - Por Rever jobs
  needsAttention: Array<{
    id: string
    file_name: string
    created_at: string
  }>
  // Recent Activity - excluding needs-attention
  recentActivity: Array<{
    id: string
    file_name: string
    status: 'queued' | 'pending' | 'processing' | 'completed' | 'failed'
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

  // PERFORMANCE: Use COUNT queries instead of fetching all rows
  // This reduces data transfer from 100k+ rows to just count numbers
  const [
    totalRFPsResult,
    rfpsThisMonthResult,
    pendingReviewResult,
    acceptedCountResult,
    rejectedCountResult,
    matchesThisMonthResult,
    monthlyRFPsResult,
    monthlyAcceptedResult,
    monthlyRejectedResult,
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

    // PERFORMANCE: Count accepted matches (not fetch all)
    supabase
      .from('rfp_match_suggestions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted'),

    // PERFORMANCE: Count rejected matches (not fetch all)
    supabase
      .from('rfp_match_suggestions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected'),

    // PERFORMANCE: Count accepted matches this month (not fetch all)
    supabase
      .from('rfp_match_suggestions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .gte('created_at', startOfMonth.toISOString()),

    // Monthly RFP counts for volume chart (last 6 months)
    supabase
      .from('rfp_upload_jobs')
      .select('created_at')
      .eq('status', 'completed')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true }),

    // Monthly accepted matches for efficiency chart
    supabase
      .from('rfp_match_suggestions')
      .select('created_at')
      .eq('status', 'accepted')
      .gte('created_at', sixMonthsAgo.toISOString()),

    // Monthly rejected matches for efficiency chart
    supabase
      .from('rfp_match_suggestions')
      .select('created_at')
      .eq('status', 'rejected')
      .gte('created_at', sixMonthsAgo.toISOString()),

    // Recent RFPs for activity list (fetch more to split between lists)
    supabase
      .from('rfp_upload_jobs')
      .select('id, file_name, status, confirmed_at, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Process match statistics using COUNT results
  const acceptedMatches = acceptedCountResult.count ?? 0
  const rejectedMatches = rejectedCountResult.count ?? 0
  const totalDecisions = acceptedMatches + rejectedMatches
  const acceptanceRate = totalDecisions > 0
    ? Math.round((acceptedMatches / totalDecisions) * 100)
    : 0

  // Matches this month from COUNT
  const matchesThisMonth = matchesThisMonthResult.count ?? 0

  // Process monthly volume data for chart
  const monthlyVolume = processMonthlyVolume(
    monthlyRFPsResult.data ?? [],
    sixMonthsAgo
  )

  // Process monthly efficiency data for chart
  const monthlyEfficiency = processMonthlyEfficiency(
    monthlyAcceptedResult.data ?? [],
    monthlyRejectedResult.data ?? [],
    sixMonthsAgo
  )

  // Process recent RFPs with review status
  const recentRFPsWithStatus = await addReviewStatusToJobs(
    supabase,
    recentRFPsResult.data ?? []
  )

  // Split into needs attention and recent activity
  const needsAttention = recentRFPsWithStatus
    .filter(rfp => rfp.review_status === 'por_rever')
    .slice(0, 5)
    .map(({ id, file_name, created_at }) => ({ id, file_name, created_at }))

  const needsAttentionIds = new Set(needsAttention.map(r => r.id))
  const recentActivity = recentRFPsWithStatus
    .filter(rfp => !needsAttentionIds.has(rfp.id))
    .slice(0, 4)

  return {
    totalRFPs: totalRFPsResult.count ?? 0,
    totalMatches: acceptedMatches,
    pendingReview: pendingReviewResult,
    acceptanceRate,
    rfpsThisMonth: rfpsThisMonthResult.count ?? 0,
    matchesThisMonth,
    monthlyVolume,
    monthlyEfficiency,
    needsAttention,
    recentActivity,
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
 * Process monthly volume data for the chart (RFPs over time)
 */
function processMonthlyVolume(
  rfps: Array<{ created_at: string }>,
  startDate: Date
): DashboardStats['monthlyVolume'] {
  const months: DashboardStats['monthlyVolume'] = []
  const now = new Date()

  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM
    const monthLabel = date.toLocaleDateString('pt-PT', { month: 'short' })

    const rfpCount = rfps.filter(r => r.created_at.startsWith(monthKey)).length

    months.push({
      month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      rfps: rfpCount,
    })
  }

  return months
}

/**
 * Process monthly efficiency data for the chart (acceptance rate trend)
 */
function processMonthlyEfficiency(
  accepted: Array<{ created_at: string }>,
  rejected: Array<{ created_at: string }>,
  startDate: Date
): DashboardStats['monthlyEfficiency'] {
  const months: DashboardStats['monthlyEfficiency'] = []
  const now = new Date()

  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = date.toISOString().slice(0, 7) // YYYY-MM
    const monthLabel = date.toLocaleDateString('pt-PT', { month: 'short' })

    const acceptedCount = accepted.filter(m => m.created_at.startsWith(monthKey)).length
    const rejectedCount = rejected.filter(m => m.created_at.startsWith(monthKey)).length
    const total = acceptedCount + rejectedCount
    const rate = total > 0 ? Math.round((acceptedCount / total) * 100) : 0

    months.push({
      month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      rate,
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
): Promise<DashboardStats['recentActivity']> {
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
    status: job.status as DashboardStats['recentActivity'][0]['status'],
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
    monthlyVolume: [],
    monthlyEfficiency: [],
    needsAttention: [],
    recentActivity: [],
  }
}

import { createClient } from '@/lib/supabase/server'
import { RFPPageContent } from './components/rfp-page-content'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface RFPsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export type ReviewStatus = 'por_rever' | 'revisto' | 'confirmado' | null

export interface KPIData {
  totalCount: number
  porReverCount: number
  revistosCount: number
  confirmedCount: number
}

/**
 * Compute KPI data for the stats cards
 * This runs server-side to avoid flicker on initial load
 */
async function computeKPIs(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<KPIData> {
  // Fetch total count of completed RFP jobs only
  const { count: totalCount } = await supabase
    .from('rfp_upload_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  // Fetch all completed jobs with confirmation status
  const { data: completedJobs } = await supabase
    .from('rfp_upload_jobs')
    .select('id, confirmed_at')
    .eq('status', 'completed')

  if (!completedJobs) {
    return {
      totalCount: totalCount ?? 0,
      porReverCount: 0,
      revistosCount: 0,
      confirmedCount: 0,
    }
  }

  // Count Confirmados: jobs with confirmed_at set
  const confirmedCount = completedJobs.filter(j => j.confirmed_at !== null).length

  // Get unconfirmed jobs to check for pending decisions
  const unconfirmedJobs = completedJobs.filter(j => j.confirmed_at === null)
  const unconfirmedJobIds = unconfirmedJobs.map(j => j.id)

  let porReverCount = 0

  if (unconfirmedJobIds.length > 0) {
    // For each unconfirmed job, check if it has pending items needing decision
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

    // Determine which jobs need review
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

    porReverCount = jobsNeedingReview.size
  }

  // Revistos: unconfirmed jobs that don't need review
  const revistosCount = unconfirmedJobs.length - porReverCount

  return {
    totalCount: totalCount ?? 0,
    porReverCount,
    revistosCount,
    confirmedCount,
  }
}

/**
 * Compute review status for completed jobs
 * - confirmado: confirmed_at is set
 * - por_rever: has pending items needing human decision
 * - revisto: all items addressed, not yet confirmed
 */
async function computeReviewStatuses(
  supabase: Awaited<ReturnType<typeof createClient>>,
  jobIds: string[]
): Promise<Map<string, ReviewStatus>> {
  const statusMap = new Map<string, ReviewStatus>()

  if (jobIds.length === 0) return statusMap

  // Get items with pending review status for these jobs
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
    .in('job_id', jobIds)
    .eq('review_status', 'pending')

  // Determine which jobs need review (have pending decisions)
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

  // Set status for each job
  for (const jobId of jobIds) {
    if (jobsNeedingReview.has(jobId)) {
      statusMap.set(jobId, 'por_rever')
    } else {
      statusMap.set(jobId, 'revisto')
    }
  }

  return statusMap
}

export default async function RFPsPage({ searchParams }: RFPsPageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(String(params.page || '1'), 10) || 1)
  const pageSize = Math.min(50, Math.max(10, parseInt(String(params.pageSize || '25'), 10) || 25))
  const search = String(params.search || '').slice(0, 200)
  const sortBy = params.sortBy === 'file_name' ? 'file_name' : 'created_at'
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc'

  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null // Layout will redirect
  }

  // Build query with search, sort, and pagination
  // All authenticated users can see all RFPs (no user_id filter)
  let query = supabase
    .from('rfp_upload_jobs')
    .select('*', { count: 'exact' })

  // Apply search filter on file_name
  if (search) {
    query = query.ilike('file_name', `%${search}%`)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  query = query.range((page - 1) * pageSize, page * pageSize - 1)

  const { data: jobs, error, count } = await query

  if (error) {
    console.error('Failed to fetch RFP jobs:', error)
  }

  // Fetch profiles for uploader and last_editor display
  // Collect unique user IDs from jobs
  const userIds = new Set<string>()
  for (const job of jobs ?? []) {
    if (job.user_id) userIds.add(job.user_id)
    if (job.last_edited_by) userIds.add(job.last_edited_by)
  }

  // Fetch profiles in a single query
  const profilesMap = new Map<string, { email: string; first_name: string; last_name: string }>()
  if (userIds.size > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .in('id', Array.from(userIds))

    for (const profile of profiles ?? []) {
      profilesMap.set(profile.id, {
        email: profile.email,
        first_name: profile.first_name ?? '',
        last_name: profile.last_name ?? '',
      })
    }
  }

  // Compute review status for completed, unconfirmed jobs
  const completedUnconfirmedIds = (jobs ?? [])
    .filter(j => j.status === 'completed' && !j.confirmed_at)
    .map(j => j.id)

  const reviewStatuses = await computeReviewStatuses(supabase, completedUnconfirmedIds)

  // Compute KPI data server-side to avoid flicker
  const initialKPIs = await computeKPIs(supabase)

  // Add review_status and profile data to each job
  const jobsWithStatus = (jobs ?? []).map(job => {
    let review_status: ReviewStatus = null
    if (job.status === 'completed') {
      if (job.confirmed_at) {
        review_status = 'confirmado'
      } else {
        review_status = reviewStatuses.get(job.id) ?? 'revisto'
      }
    }
    return {
      ...job,
      review_status,
      uploader: job.user_id ? profilesMap.get(job.user_id) ?? null : null,
      last_editor: job.last_edited_by ? profilesMap.get(job.last_edited_by) ?? null : null,
    }
  })

  return (
    <RFPPageContent
      initialJobs={jobsWithStatus}
      totalCount={count ?? 0}
      initialKPIs={initialKPIs}
      initialState={{
        page,
        pageSize,
        search,
        sortBy,
        sortOrder,
      }}
    />
  )
}

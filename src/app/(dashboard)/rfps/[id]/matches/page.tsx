import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { MatchReviewContent } from '@/app/(dashboard)/rfps/components/match-review-content'
import { autoAcceptExactMatches } from './actions'
import type { RFPItemWithMatches, MatchSuggestion } from '@/types/rfp'

// Force dynamic rendering to ensure sorting params are always fresh
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

type SortColumn = 'lote' | 'pos' | 'artigo' | 'descricao' | 'status'
type SortDirection = 'asc' | 'desc'

interface MatchReviewState {
  page: number
  pageSize: number
  search: string
  status: 'all' | 'pending' | 'matched' | 'no_match'
  sortBy: SortColumn
  sortDir: SortDirection
}

export default async function MatchReviewPage({ params, searchParams }: PageProps) {
  const { id: jobId } = await params
  const queryParams = await searchParams
  const supabase = await createClient()

  // Parse params with defaults
  const page = Math.max(1, parseInt(String(queryParams.page || '1'), 10) || 1)
  const pageSize = Math.min(50, Math.max(10, parseInt(String(queryParams.pageSize || '25'), 10) || 25))
  const search = String(queryParams.search || '').slice(0, 200)
  const status = (['all', 'pending', 'matched', 'no_match'].includes(String(queryParams.status))
    ? String(queryParams.status)
    : 'all') as MatchReviewState['status']
  const validSortColumns: SortColumn[] = ['lote', 'pos', 'artigo', 'descricao', 'status']
  const sortBy = (validSortColumns.includes(String(queryParams.sortBy) as SortColumn)
    ? String(queryParams.sortBy)
    : 'lote') as SortColumn
  const sortDir = (queryParams.sortDir === 'desc' ? 'desc' : 'asc') as SortDirection

  const initialState: MatchReviewState = { page, pageSize, search, status, sortBy, sortDir }

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // PERFORMANCE: Parallelize job fetch and auto-accept (they're independent)
  // - Job fetch: read-only, needed for validation and UI
  // - Auto-accept: write operation, needs to complete before items query
  const [jobResult, _autoAcceptResult] = await Promise.all([
    supabase
      .from('rfp_upload_jobs')
      .select('id, file_name, status, confirmed_at')
      .eq('id', jobId)
      .single(),
    autoAcceptExactMatches(jobId),
  ])

  const { data: job, error: jobError } = jobResult

  if (jobError || !job) {
    notFound()
  }

  // Build base query for items with nested match suggestions
  // Use explicit FK name because there are two relationships:
  // 1. rfp_match_suggestions.rfp_item_id -> rfp_items.id (one-to-many, what we want)
  // 2. rfp_items.selected_match_id -> rfp_match_suggestions.id (many-to-one)
  let query = supabase
    .from('rfp_items')
    .select(
      `
      *,
      rfp_match_suggestions!rfp_match_suggestions_rfp_item_id_fkey (*)
    `,
      { count: 'exact' }
    )
    .eq('job_id', jobId)

  // Apply search filter (both RFP side and matched product side via text search)
  if (search) {
    // Search on RFP item fields
    query = query.or(`artigo_pedido.ilike.%${search}%,descricao_pedido.ilike.%${search}%`)
  }

  // Apply sorting based on column and direction
  // All sort cases include secondary sort by lote/posicao for consistent ordering
  const isAsc = sortDir === 'asc'
  switch (sortBy) {
    case 'lote':
      query = query
        .order('lote_pedido', { ascending: isAsc })
        .order('posicao_pedido', { ascending: isAsc })
      break
    case 'pos':
      query = query
        .order('posicao_pedido', { ascending: isAsc })
        .order('lote_pedido', { ascending: true })
      break
    case 'artigo':
      query = query
        .order('artigo_pedido', { ascending: isAsc })
        .order('lote_pedido', { ascending: true })
        .order('posicao_pedido', { ascending: true })
      break
    case 'descricao':
      query = query
        .order('descricao_pedido', { ascending: isAsc })
        .order('lote_pedido', { ascending: true })
        .order('posicao_pedido', { ascending: true })
      break
    case 'status':
      query = query
        .order('review_status', { ascending: isAsc })
        .order('lote_pedido', { ascending: true })
        .order('posicao_pedido', { ascending: true })
      break
    default:
      query = query
        .order('lote_pedido', { ascending: true })
        .order('posicao_pedido', { ascending: true })
  }

  // Apply pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data: items, error: itemsError, count } = await query

  if (itemsError) {
    console.error('Failed to fetch items:', JSON.stringify(itemsError, null, 2))
    console.error('Error details:', {
      message: itemsError.message,
      code: itemsError.code,
      hint: itemsError.hint,
      details: itemsError.details,
    })
    throw new Error(`Failed to load match results: ${itemsError.message || 'Unknown error'}`)
  }

  // Sort each item's match suggestions by similarity_score DESC (client-side)
  // Note: descricao_comercial would require a separate join to artigos table
  // which isn't possible without a FK constraint - set to null for now
  let itemsWithSortedMatches: RFPItemWithMatches[] = (items ?? []).map((item) => ({
    ...item,
    rfp_match_suggestions: (item.rfp_match_suggestions || [])
      .map((match: MatchSuggestion) => ({
        ...match,
        descricao_comercial: null,
      }))
      .sort((a: MatchSuggestion, b: MatchSuggestion) => b.similarity_score - a.similarity_score),
  }))

  // Apply status filter (client-side since it depends on suggestions)
  if (status !== 'all') {
    itemsWithSortedMatches = itemsWithSortedMatches.filter((item) => {
      const hasSuggestions = item.rfp_match_suggestions.length > 0
      const hasAccepted = item.rfp_match_suggestions.some((m) => m.status === 'accepted')
      const hasPerfectMatch = item.rfp_match_suggestions.some((m) => m.similarity_score >= 0.9999)

      switch (status) {
        case 'pending':
          // Pending items with suggestions to review
          return item.review_status === 'pending' && hasSuggestions && !hasPerfectMatch
        case 'matched':
          // Items with accepted/manual match OR perfect match
          return (
            item.review_status === 'accepted' ||
            item.review_status === 'manual' ||
            (item.review_status === 'pending' && hasPerfectMatch)
          )
        case 'no_match':
          // Rejected items OR pending items with no suggestions
          return item.review_status === 'rejected' || (item.review_status === 'pending' && !hasSuggestions)
        default:
          return true
      }
    })
  }

  // Search on matched product side (client-side filtering)
  // This adds items where the accepted match contains the search term
  if (search) {
    const searchLower = search.toLowerCase()
    itemsWithSortedMatches = itemsWithSortedMatches.filter((item) => {
      // Check RFP side
      const rfpMatch =
        item.artigo_pedido?.toLowerCase().includes(searchLower) ||
        item.descricao_pedido?.toLowerCase().includes(searchLower)
      if (rfpMatch) return true

      // Check matched product side (accepted suggestions)
      const acceptedMatch = item.rfp_match_suggestions.find((m) => m.status === 'accepted')
      if (acceptedMatch) {
        return (
          acceptedMatch.artigo?.toLowerCase().includes(searchLower) ||
          acceptedMatch.descricao?.toLowerCase().includes(searchLower)
        )
      }

      return false
    })
  }

  // Get total count for stats (unfiltered)
  // Must include same sorting as main query for consistent ordering
  const { data: allItems } = await supabase
    .from('rfp_items')
    .select(
      `
      *,
      rfp_match_suggestions!rfp_match_suggestions_rfp_item_id_fkey (*)
    `
    )
    .eq('job_id', jobId)
    .order('lote_pedido', { ascending: true })
    .order('posicao_pedido', { ascending: true })

  const allItemsWithSortedMatches: RFPItemWithMatches[] = (allItems ?? []).map((item) => ({
    ...item,
    rfp_match_suggestions: (item.rfp_match_suggestions || [])
      .map((match: MatchSuggestion) => ({
        ...match,
        descricao_comercial: null,
      }))
      .sort((a: MatchSuggestion, b: MatchSuggestion) => b.similarity_score - a.similarity_score),
  }))

  const totalCount = count ?? 0

  return (
    <div className="flex flex-1 flex-col">
      <MatchReviewContent
        jobId={jobId}
        fileName={job.file_name}
        initialIsConfirmed={!!job.confirmed_at}
        allItems={allItemsWithSortedMatches}
        paginatedItems={itemsWithSortedMatches}
        totalCount={totalCount}
        initialState={initialState}
      />
    </div>
  )
}

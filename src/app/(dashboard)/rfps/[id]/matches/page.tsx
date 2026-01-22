import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { MatchReviewTable } from '@/app/(dashboard)/rfps/components/match-review-table'
import { ReviewStatsChips } from '@/app/(dashboard)/rfps/components/review-stats-chips'
import { HeaderExportButton } from '@/app/(dashboard)/rfps/components/header-export-button'
import { autoAcceptExactMatches } from './actions'
import type { RFPItemWithMatches, MatchSuggestion } from '@/types/rfp'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MatchReviewPage({ params }: PageProps) {
  const { id: jobId } = await params
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch job with ownership check
  const { data: job, error: jobError } = await supabase
    .from('rfp_upload_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (jobError || !job) {
    notFound()
  }

  // Auto-accept exact matches (100% similarity) on first load
  // This pre-confirms obvious matches before user reviews them
  await autoAcceptExactMatches(jobId)

  // Fetch items with nested match suggestions
  // Use explicit FK name because there are two relationships:
  // 1. rfp_match_suggestions.rfp_item_id -> rfp_items.id (one-to-many, what we want)
  // 2. rfp_items.selected_match_id -> rfp_match_suggestions.id (many-to-one)
  const { data: items, error: itemsError } = await supabase
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
  const itemsWithSortedMatches: RFPItemWithMatches[] = (items ?? []).map((item) => ({
    ...item,
    rfp_match_suggestions: (item.rfp_match_suggestions || []).sort(
      (a: MatchSuggestion, b: MatchSuggestion) => b.similarity_score - a.similarity_score
    ),
  }))

  return (
    <div className="flex flex-1 flex-col">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/rfps" className="hover:text-foreground transition-colors">
          Concursos
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Rever Correspondências</span>
      </nav>

      {/* Header with document name, stats, and export */}
      <div className="flex items-center justify-between gap-4 mt-1 mb-6">
        <h1 className="text-2xl font-semibold truncate" title={job.file_name}>
          {job.file_name}
        </h1>
        <div className="flex items-center gap-4 shrink-0">
          <ReviewStatsChips items={itemsWithSortedMatches} />
          <HeaderExportButton items={itemsWithSortedMatches} jobId={jobId} />
        </div>
      </div>

      {/* Main content - full width table */}
      <div className="flex-1 min-w-0">
        <MatchReviewTable jobId={jobId} items={itemsWithSortedMatches} />
      </div>
    </div>
  )
}

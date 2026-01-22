import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MatchReviewTable } from '@/app/(dashboard)/rfps/components/match-review-table'
import { ConfirmationSummary } from '@/app/(dashboard)/rfps/components/confirmation-summary'
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

  // Calculate review progress
  const totalItems = itemsWithSortedMatches.length
  const reviewedItems = itemsWithSortedMatches.filter(
    (item) => item.review_status !== 'pending'
  ).length

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/rfps">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to RFPs</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Rever Correspondências</h1>
            <p className="text-muted-foreground">
              {job.file_name} - {reviewedItems} de {totalItems} itens revistos
            </p>
          </div>
        </div>
      </div>

      {/* Main content with summary sidebar */}
      <div className="flex gap-6">
        {/* Items table - takes most space */}
        <div className="flex-1 min-w-0">
          <MatchReviewTable jobId={jobId} items={itemsWithSortedMatches} />
        </div>

        {/* Confirmation summary - fixed sidebar */}
        <div className="w-72 shrink-0">
          <ConfirmationSummary
            items={itemsWithSortedMatches}
            onProceedToExport={() => {
              // Phase 9 will implement export - for now, just log
              console.log('Proceed to export')
            }}
          />
        </div>
      </div>
    </div>
  )
}

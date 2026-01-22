import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RFPItemCard } from '@/app/(dashboard)/rfps/components/rfp-item-card'
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
  const { data: items, error: itemsError } = await supabase
    .from('rfp_items')
    .select(
      `
      *,
      rfp_match_suggestions (*)
    `
    )
    .eq('job_id', jobId)
    .order('lote_pedido', { ascending: true })
    .order('posicao_pedido', { ascending: true })

  if (itemsError) {
    console.error('Failed to fetch items:', itemsError)
    throw new Error('Failed to load match results')
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
    <div className="flex flex-1 flex-col gap-6 p-4">
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
            <h1 className="text-2xl font-semibold">Review Matches</h1>
            <p className="text-muted-foreground">
              {job.file_name} - {reviewedItems} of {totalItems} items reviewed
            </p>
          </div>
        </div>

        {/* Phase 8 will add Continue/Confirm button here */}
      </div>

      {/* Items list */}
      <div className="space-y-4">
        {itemsWithSortedMatches.map((item) => (
          <RFPItemCard key={item.id} jobId={jobId} item={item} />
        ))}

        {itemsWithSortedMatches.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No items found for this RFP.
          </div>
        )}
      </div>
    </div>
  )
}

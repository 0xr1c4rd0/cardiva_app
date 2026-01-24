'use client'

import type { RFPItemWithMatches } from '@/types/rfp'
import { RFPConfirmationProvider } from './rfp-confirmation-context'
import { RFPStatusBadge } from './rfp-status-badge'
import { RFPActionButton } from './rfp-action-button'
import { ReviewStatsChips } from './review-stats-chips'
import { MatchReviewTable } from './match-review-table'

interface MatchReviewState {
  page: number
  pageSize: number
  search: string
  status: 'all' | 'pending' | 'matched' | 'no_match'
  sortBy: 'lote' | 'pos' | 'artigo' | 'descricao' | 'status'
  sortDir: 'asc' | 'desc'
}

interface MatchReviewContentProps {
  jobId: string
  fileName: string
  initialIsConfirmed: boolean
  allItems: RFPItemWithMatches[]
  paginatedItems: RFPItemWithMatches[]
  totalCount: number
  initialState: MatchReviewState
}

/**
 * Client wrapper for the match review page content.
 * Provides RFPConfirmationContext to all child components.
 */
export function MatchReviewContent({
  jobId,
  fileName,
  initialIsConfirmed,
  allItems,
  paginatedItems,
  totalCount,
  initialState,
}: MatchReviewContentProps) {
  return (
    <RFPConfirmationProvider initialIsConfirmed={initialIsConfirmed}>
      {/* Header with document name, status badge, stats, and action button */}
      <div className="flex items-center justify-between gap-4 mt-1 mb-6">
        <div className="flex items-center min-w-0">
          <h1 className="text-2xl font-semibold truncate" title={fileName}>
            {fileName}
          </h1>
          <RFPStatusBadge jobId={jobId} items={allItems} />
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <ReviewStatsChips items={allItems} />
          <RFPActionButton jobId={jobId} items={allItems} />
        </div>
      </div>

      {/* Main content - full width table */}
      <div className="flex-1 min-w-0">
        <MatchReviewTable
          jobId={jobId}
          items={paginatedItems}
          totalCount={totalCount}
          initialState={initialState}
        />
      </div>
    </RFPConfirmationProvider>
  )
}

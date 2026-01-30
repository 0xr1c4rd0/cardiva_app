'use client'

import { useState, useCallback, useMemo } from 'react'
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
 * Manages local state for items to enable instant UI updates after actions.
 */
export function MatchReviewContent({
  jobId,
  fileName,
  initialIsConfirmed,
  allItems: initialAllItems,
  paginatedItems: initialPaginatedItems,
  totalCount,
  initialState,
}: MatchReviewContentProps) {
  // Single source of truth for items - enables instant UI updates after actions
  const [allItems, setAllItems] = useState(initialAllItems)

  // Track which item IDs are in the current page (from server pagination)
  // This set is stable across renders since it's based on initial props
  const paginatedItemIds = useMemo(
    () => new Set(initialPaginatedItems.map(item => item.id)),
    [initialPaginatedItems]
  )

  // Derive paginated items from allItems - single source of truth
  // When allItems updates, paginatedItems automatically reflects the change
  const paginatedItems = useMemo(
    () => allItems.filter(item => paginatedItemIds.has(item.id)),
    [allItems, paginatedItemIds]
  )

  // Update an item - only need to update allItems, paginatedItems derives automatically
  const updateItem = useCallback((updatedItem: RFPItemWithMatches) => {
    setAllItems(prev => prev.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    ))
  }, [])

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
          <RFPActionButton jobId={jobId} items={allItems} rfpFileName={fileName} />
        </div>
      </div>

      {/* Main content - full width table */}
      <div className="flex-1 min-w-0">
        <MatchReviewTable
          jobId={jobId}
          items={paginatedItems}
          totalCount={totalCount}
          initialState={initialState}
          onItemUpdate={updateItem}
        />
      </div>
    </RFPConfirmationProvider>
  )
}

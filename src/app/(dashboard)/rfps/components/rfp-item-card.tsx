'use client'

import { useState } from 'react'
import { Check, X, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MatchSuggestionRow } from './match-suggestion-row'
import type { RFPItemWithMatches } from '@/types/rfp'

interface RFPItemCardProps {
  jobId: string
  item: RFPItemWithMatches
}

/**
 * RFP item card with nested match suggestions and collapse behavior.
 * Per CONTEXT.md:
 * - Pending items stay expanded; reviewed items collapse and fade to ~70% opacity
 * - Collapsed items show accepted match summary or "No Match" status
 * - Click header to expand/collapse reviewed items
 */
export function RFPItemCard({ jobId, item }: RFPItemCardProps) {
  const isReviewed = item.review_status !== 'pending'
  const [isExpanded, setIsExpanded] = useState(!isReviewed)

  // Find the accepted match (if any)
  const acceptedMatch = item.rfp_match_suggestions.find(
    (m) => m.status === 'accepted'
  )

  const toggleExpand = () => {
    if (isReviewed) {
      setIsExpanded((prev) => !prev)
    }
  }

  return (
    <Card
      className={cn(
        'transition-opacity duration-300',
        isReviewed && 'opacity-70'
      )}
    >
      <CardHeader
        onClick={toggleExpand}
        className={cn(isReviewed && 'cursor-pointer')}
      >
        <div className="flex items-center justify-between">
          {/* Left side: Lote badge + description */}
          <div className="flex items-center gap-3">
            {item.lote_pedido && (
              <Badge variant="outline" className="font-mono">
                Lote {item.lote_pedido}
                {item.posicao_pedido && `.${item.posicao_pedido}`}
              </Badge>
            )}
            <CardTitle className="text-base font-medium">
              {item.descricao_pedido}
            </CardTitle>
          </div>

          {/* Right side: Status badge + collapse chevron */}
          <div className="flex items-center gap-2">
            {isReviewed && (
              <>
                {item.review_status === 'accepted' ? (
                  <Badge className="border-primary/30 bg-primary/10 text-primary">
                    <Check className="h-3 w-3" />
                    Matched
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <X className="h-3 w-3" />
                    No Match
                  </Badge>
                )}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform duration-200',
                    isExpanded && 'rotate-180'
                  )}
                />
              </>
            )}
          </div>
        </div>

        {/* Collapsed summary: show accepted match info when collapsed */}
        {isReviewed && !isExpanded && acceptedMatch && (
          <p className="mt-2 text-sm text-muted-foreground">
            Matched to: {acceptedMatch.artigo ?? '-'} -{' '}
            {acceptedMatch.descricao ?? '-'}
          </p>
        )}
      </CardHeader>

      {/* Content: Show match suggestions when expanded */}
      {isExpanded && (
        <CardContent className="space-y-2">
          {item.rfp_match_suggestions.length > 0 ? (
            item.rfp_match_suggestions.map((match) => (
              <MatchSuggestionRow
                key={match.id}
                jobId={jobId}
                rfpItemId={item.id}
                match={match}
              />
            ))
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No match suggestions available
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
}

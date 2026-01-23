'use client'

import { useState } from 'react'
import { Check, X, ChevronDown, AlertCircle } from 'lucide-react'
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
 * - 100% matches (codigo_spms exact match) appear as pre-selected
 * - Items with no matches show collapsed with "No match available" pill
 * - Accepted items keep normal appearance; rejected items fade slightly
 * - Click header to expand/collapse
 */
export function RFPItemCard({ jobId, item }: RFPItemCardProps) {
  const hasNoSuggestions = item.rfp_match_suggestions.length === 0

  // Find 100% match (codigo_spms exact match)
  const perfectMatch = item.rfp_match_suggestions.find(
    (m) => m.similarity_score >= 0.9999
  )

  // Find the accepted match (if any)
  const acceptedMatch = item.rfp_match_suggestions.find(
    (m) => m.status === 'accepted'
  )

  // Determine effective display state
  const isExplicitlyReviewed = item.review_status !== 'pending'
  const hasPerfectMatch = !!perfectMatch && item.review_status === 'pending'
  const displayMatch = acceptedMatch || (hasPerfectMatch ? perfectMatch : null)

  // Show as "matched" if explicitly accepted OR has 100% match
  const showAsMatched = item.review_status === 'accepted' || hasPerfectMatch
  // Show as rejected only if explicitly rejected
  const showAsRejected = item.review_status === 'rejected'
  // Items should collapse if: reviewed, has perfect match, or has no suggestions
  const shouldStartCollapsed = isExplicitlyReviewed || hasPerfectMatch || hasNoSuggestions

  const [isExpanded, setIsExpanded] = useState(!shouldStartCollapsed)

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev)
  }

  // Determine card styling:
  // - Accepted: normal appearance
  // - Rejected: slightly faded (opacity-85)
  // - Perfect match (pending): normal appearance
  // - No suggestions: normal appearance
  const cardClassName = cn(
    'transition-opacity duration-300',
    showAsRejected && 'opacity-85'
  )

  return (
    <Card className={cardClassName}>
      <CardHeader
        onClick={toggleExpand}
        className="cursor-pointer"
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
            {hasNoSuggestions ? (
              <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                <AlertCircle className="mr-1 h-3 w-3" />
                No match available
              </Badge>
            ) : showAsMatched ? (
              <Badge className="border-primary/30 bg-primary/10 text-primary">
                <Check className="mr-1 h-3 w-3" />
                Matched
              </Badge>
            ) : showAsRejected ? (
              <Badge variant="secondary">
                <X className="mr-1 h-3 w-3" />
                No Match
              </Badge>
            ) : null}
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
            />
          </div>
        </div>

        {/* Collapsed summary: show matched item info when collapsed */}
        {!isExpanded && displayMatch && (
          <p className="mt-2 text-sm text-muted-foreground">
            Matched to: {displayMatch.artigo ?? '-'} -{' '}
            {displayMatch.descricao ?? '-'}
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
                isPerfectMatch={match.similarity_score >= 0.9999}
              />
            ))
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Não foram encontradas sugestões de correspondência para este produto.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
}

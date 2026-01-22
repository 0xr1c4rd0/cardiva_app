'use client'

import { useTransition } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ConfidenceBar } from './confidence-bar'
import { acceptMatch, rejectMatch } from '../[id]/matches/actions'
import type { MatchSuggestion } from '@/types/rfp'

interface MatchSuggestionRowProps {
  jobId: string
  rfpItemId: string
  match: MatchSuggestion
}

/**
 * Single match suggestion row with Accept/Reject buttons and loading state.
 * Per CONTEXT.md:
 * - Accepting a match auto-rejects all other matches for that item
 * - Visual states: default, accepted (highlighted), rejected (faded), pending (disabled)
 */
export function MatchSuggestionRow({
  jobId,
  rfpItemId,
  match,
}: MatchSuggestionRowProps) {
  const [isPending, startTransition] = useTransition()

  const isAccepted = match.status === 'accepted'
  const isRejected = match.status === 'rejected'

  const handleAccept = () => {
    startTransition(async () => {
      await acceptMatch(jobId, rfpItemId, match.id)
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      await rejectMatch(jobId, rfpItemId, match.id)
    })
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-md border p-3 transition-all',
        isAccepted && 'border-primary/30 bg-primary/5',
        isRejected && 'opacity-50',
        isPending && 'pointer-events-none opacity-70'
      )}
    >
      {/* Match data columns */}
      <div className="grid flex-1 grid-cols-3 gap-4">
        {/* codigo_spms */}
        <span className="truncate font-mono text-sm">
          {match.codigo_spms ?? '-'}
        </span>
        {/* artigo */}
        <span className="truncate text-sm">{match.artigo ?? '-'}</span>
        {/* descricao */}
        <span className="truncate text-sm text-muted-foreground">
          {match.descricao ?? '-'}
        </span>
      </div>

      {/* Confidence bar */}
      <ConfidenceBar score={match.similarity_score} className="w-24" />

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Button
              size="sm"
              variant={isAccepted ? 'default' : 'outline'}
              onClick={handleAccept}
              disabled={isAccepted}
              aria-label="Accept this match"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={isRejected ? 'destructive' : 'outline'}
              onClick={handleReject}
              disabled={isRejected}
              aria-label="Reject this match"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

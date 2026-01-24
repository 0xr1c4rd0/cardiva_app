'use client'

import { useTransition } from 'react'
import { Clock, CheckCircle2, Undo2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { RFPItemWithMatches } from '@/types/rfp'
import { revertConfirmation } from '../[id]/matches/actions'

type ReviewStatus = 'por_rever' | 'revisto' | 'confirmado'

interface RFPStatusBadgeProps {
  jobId: string
  isConfirmed: boolean
  items: RFPItemWithMatches[]
}

// Review status config matching rfp-jobs-list.tsx
const statusConfig = {
  por_rever: {
    label: 'Por Rever',
    icon: Clock,
    className: 'text-amber-600',
    badgeClassName: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
  },
  revisto: {
    label: 'Revisto',
    icon: CheckCircle2,
    className: 'text-blue-600',
    badgeClassName: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
  },
  confirmado: {
    label: 'Confirmado',
    icon: CheckCircle2,
    className: 'text-emerald-600',
    badgeClassName: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
}

/**
 * Computes the review status for a job based on its items.
 * - confirmado: confirmed_at is set
 * - por_rever: has pending items needing human decision
 * - revisto: all items addressed, not yet confirmed
 */
function computeReviewStatus(
  isConfirmed: boolean,
  items: RFPItemWithMatches[]
): ReviewStatus {
  if (isConfirmed) {
    return 'confirmado'
  }

  // Check if any items need review (pending with suggestions, no 100% match)
  const needsReview = items.some((item) => {
    if (item.review_status !== 'pending') return false
    if (item.rfp_match_suggestions.length === 0) return false

    // Has pending suggestions
    const hasPendingSuggestion = item.rfp_match_suggestions.some(
      (s) => s.status === 'pending'
    )
    // Has 100% match (auto-accepted)
    const hasExactMatch = item.rfp_match_suggestions.some(
      (s) => s.similarity_score >= 0.9999
    )

    return hasPendingSuggestion && !hasExactMatch
  })

  return needsReview ? 'por_rever' : 'revisto'
}

/**
 * Status badge showing the review status of an RFP job.
 * Displayed next to the file name on the match review page.
 * Includes "Reverter" link when confirmed.
 */
export function RFPStatusBadge({ jobId, isConfirmed, items }: RFPStatusBadgeProps) {
  const [isPending, startTransition] = useTransition()
  const status = computeReviewStatus(isConfirmed, items)
  const config = statusConfig[status]
  const StatusIcon = config.icon

  const handleRevert = () => {
    startTransition(async () => {
      const result = await revertConfirmation(jobId)
      if (result.success) {
        toast.success('Confirmacao revertida', {
          description: 'O concurso pode ser editado novamente.',
        })
      } else {
        toast.error('Erro ao reverter', {
          description: result.error,
        })
      }
    })
  }

  return (
    <div className="flex items-center gap-2 ml-3">
      <Badge
        variant="secondary"
        className={cn('flex items-center gap-1', config.badgeClassName)}
      >
        <StatusIcon className={cn('h-3 w-3', config.className)} />
        {config.label}
      </Badge>

      {isConfirmed && (
        <button
          onClick={handleRevert}
          disabled={isPending}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Undo2 className="h-3 w-3" />
          )}
          Reverter
        </button>
      )}
    </div>
  )
}

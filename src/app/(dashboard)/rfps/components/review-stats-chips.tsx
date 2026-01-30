'use client'

import { Check, AlertCircle, Clock } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { RFPItemWithMatches } from '@/types/rfp'

interface ReviewStatsChipsProps {
  items: RFPItemWithMatches[]
}

export function ReviewStatsChips({ items }: ReviewStatsChipsProps) {
  // Calculate simplified stats
  // Correspondências = accepted + manual (items with a match selected)
  const withMatch = items.filter(
    (i) => i.review_status === 'accepted' || i.review_status === 'manual'
  ).length

  // Sem correspondência = rejected + (pending with no suggestions)
  const noMatch =
    items.filter((i) => i.review_status === 'rejected').length +
    items.filter(
      (i) => i.review_status === 'pending' && i.rfp_match_suggestions.length === 0
    ).length

  // Por rever = pending items that have suggestions (need user decision)
  const pending = items.filter(
    (i) => i.review_status === 'pending' && i.rfp_match_suggestions.length > 0
  ).length

  const chips = [
    {
      icon: <Check className="h-3.5 w-3.5" />,
      count: withMatch,
      tooltip: `${withMatch} ${withMatch === 1 ? 'correspondência' : 'correspondências'}`,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      show: true,
    },
    {
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      count: noMatch,
      tooltip: `${noMatch} ${noMatch === 1 ? 'produto' : 'produtos'} sem correspondência`,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-500',
      show: true,
    },
    {
      icon: <Clock className="h-3.5 w-3.5" />,
      count: pending,
      tooltip: `${pending} ${pending === 1 ? 'produto' : 'produtos'} por rever`,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
      show: pending > 0,
    },
  ]

  return (
    <div className="flex items-center gap-2">
      {chips
        .filter((chip) => chip.show)
        .map((chip, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${chip.bgColor} ${chip.textColor} cursor-default`}
              >
                {chip.icon}
                <span>{chip.count}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{chip.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
    </div>
  )
}

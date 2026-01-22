'use client'

import { cn } from '@/lib/utils'

interface ConfidenceBarProps {
  /**
   * Match similarity score (0.0000 to 1.0000 from database)
   */
  score: number
  className?: string
}

/**
 * Teal progress bar displaying match confidence as a percentage.
 * Per CONTEXT.md: Single teal color, bar length indicates score.
 */
export function ConfidenceBar({ score, className }: ConfidenceBarProps) {
  const percentage = Math.round(score * 100)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Bar container (track) */}
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        {/* Inner bar (fill) with smooth transition */}
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Percentage text */}
      <span className="w-8 text-right text-xs text-muted-foreground">
        {percentage}%
      </span>
    </div>
  )
}

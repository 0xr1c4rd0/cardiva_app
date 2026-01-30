'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function RFPListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`skeleton-${i}`}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-4">
            {/* File icon placeholder */}
            <Skeleton className="h-8 w-8 rounded-sm" />
            <div className="space-y-2">
              {/* Filename */}
              <Skeleton className="h-4 w-48" />
              {/* Size and date */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Status badge */}
            <Skeleton className="h-6 w-20 rounded-sm" />
            {/* Action buttons */}
            <Skeleton className="h-8 w-8 rounded-sm" />
            <Skeleton className="h-8 w-8 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  )
}

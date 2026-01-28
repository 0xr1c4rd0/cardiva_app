import { cn } from '@/lib/utils'

interface TableResizeHandleProps {
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void
  onTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void
  isResizing?: boolean
  className?: string
}

/**
 * Reusable column resize handle component
 * Invisible but interactive area for resizing columns
 */
export function TableResizeHandle({
  onMouseDown,
  onTouchStart,
  isResizing = false,
  className,
}: TableResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={cn(
        'absolute right-0 top-0 h-full w-3 cursor-pointer',
        'touch-none select-none -mr-1.5',
        className
      )}
      aria-label="Redimensionar coluna"
      role="separator"
    />
  )
}

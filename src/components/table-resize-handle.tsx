import { cn } from '@/lib/utils'

interface TableResizeHandleProps {
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void
  onTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void
  isResizing?: boolean
  className?: string
}

/**
 * Reusable column resize handle component
 * Provides visual feedback and consistent styling across all tables
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
        'absolute right-0 top-0 h-full w-1 cursor-col-resize',
        'border-r border-border transition-colors',
        'hover:border-primary/70 hover:bg-primary/10',
        'touch-none select-none -mr-0.5',
        isResizing && 'border-primary bg-primary/20',
        className
      )}
      style={{
        paddingLeft: '2px',
        paddingRight: '2px',
      }}
      aria-label="Redimensionar coluna"
      role="separator"
    />
  )
}

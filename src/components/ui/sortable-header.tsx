import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SortDirection = 'asc' | 'desc'

interface SortableHeaderProps {
    column: string
    label: string
    sortBy: string
    sortDir: string | SortDirection
    onSort: (column: any) => void
    className?: string
}

export function SortableHeader({ column, label, sortBy, sortDir, onSort, className = '' }: SortableHeaderProps) {
    const isActive = sortBy === column
    const isAsc = sortDir === 'asc'

    return (
        <button
            type="button"
            onClick={() => onSort(column)}
            className={cn("inline-flex items-center hover:text-slate-900 transition-colors", className)}
        >
            {label}
            {isActive ? (
                isAsc ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
                <ArrowUpDown className="ml-1 h-3 w-3 text-slate-400" />
            )}
        </button>
    )
}

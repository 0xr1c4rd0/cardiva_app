'use client'

import { useDebouncedCallback } from 'use-debounce'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X, Loader2 } from 'lucide-react'
import { useRef } from 'react'

interface TableToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  category: string | null
  onCategoryChange: (value: string | null) => void
  categories: string[]
  isPending: boolean
}

export function TableToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  isPending,
}: TableToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearchChange(value)
  }, 300)

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onSearchChange('')
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search by name, code, or description..."
          defaultValue={search}
          onChange={(e) => debouncedSearch(e.target.value)}
          disabled={isPending}
          className="pl-9 pr-9"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
            onClick={handleClear}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      <Select
        value={category ?? 'all'}
        onValueChange={(value) =>
          onCategoryChange(value === 'all' ? null : value)
        }
        disabled={isPending}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  )
}

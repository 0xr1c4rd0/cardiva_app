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

type StatusFilter = 'all' | 'pending' | 'matched' | 'no_match'
type SortOption = 'position' | 'status'

interface MatchReviewToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  status: StatusFilter
  onStatusChange: (status: StatusFilter) => void
  sortBy: SortOption
  onSortChange: (sortBy: SortOption) => void
  isPending: boolean
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Por rever' },
  { value: 'matched', label: 'Com correspondência' },
  { value: 'no_match', label: 'Sem correspondência' },
]

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'position', label: 'Lote/Posição' },
  { value: 'status', label: 'Pendentes primeiro' },
]

export function MatchReviewToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sortBy,
  onSortChange,
  isPending,
}: MatchReviewToolbarProps) {
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
    <div className="flex items-center gap-4 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Pesquisar por artigo ou descrição..."
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
            <span className="sr-only">Limpar pesquisa</span>
          </Button>
        )}
      </div>

      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as StatusFilter)}
        disabled={isPending}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(value) => onSortChange(value as SortOption)}
        disabled={isPending}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  )
}

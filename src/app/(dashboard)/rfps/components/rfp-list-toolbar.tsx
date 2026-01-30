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

type SortOption = 'created_at_desc' | 'created_at_asc' | 'file_name_asc' | 'file_name_desc'

interface RFPListToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  sortBy: 'file_name' | 'created_at'
  sortOrder: 'asc' | 'desc'
  onSortChange: (sortBy: 'file_name' | 'created_at', sortOrder: 'asc' | 'desc') => void
  isPending: boolean
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'created_at_desc', label: 'Data (Recente)' },
  { value: 'created_at_asc', label: 'Data (Antigo)' },
  { value: 'file_name_asc', label: 'Nome (A-Z)' },
  { value: 'file_name_desc', label: 'Nome (Z-A)' },
]

export function RFPListToolbar({
  search,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  isPending,
}: RFPListToolbarProps) {
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

  const currentSortValue: SortOption = `${sortBy}_${sortOrder}` as SortOption

  const handleSortChange = (value: string) => {
    // Split at last underscore to handle compound names (created_at, file_name)
    const lastUnderscoreIndex = value.lastIndexOf('_')
    const newSortBy = value.slice(0, lastUnderscoreIndex) as 'file_name' | 'created_at'
    const newSortOrder = value.slice(lastUnderscoreIndex + 1) as 'asc' | 'desc'
    onSortChange(newSortBy, newSortOrder)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Pesquisar por nome do ficheiro..."
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
            aria-label="Limpar pesquisa"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <Select
        value={currentSortValue}
        onValueChange={handleSortChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[160px]">
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

'use client'

import { useDebouncedCallback } from 'use-debounce'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Loader2 } from 'lucide-react'
import { useRef } from 'react'

interface TableToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  isPending: boolean
}

export function TableToolbar({
  search,
  onSearchChange,
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
          placeholder="Pesquisar por nome, código ou descrição..."
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
      {isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  )
}

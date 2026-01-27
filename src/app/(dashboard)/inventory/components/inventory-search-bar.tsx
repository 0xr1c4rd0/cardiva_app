'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebouncedCallback } from 'use-debounce'

interface InventorySearchBarProps {
  initialSearch: string
}

export function InventorySearchBar({ initialSearch }: InventorySearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initialSearch)

  // Sync with URL on mount and when URL changes externally
  useEffect(() => {
    setValue(initialSearch)
  }, [initialSearch])

  // Debounced search to avoid too many requests
  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (term) {
      params.set('search', term)
      params.set('page', '1') // Reset to first page on search
    } else {
      params.delete('search')
    }

    router.push(`/inventory?${params.toString()}`)
  }, 300)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    debouncedSearch(newValue)
  }, [debouncedSearch])

  const handleClear = useCallback(() => {
    setValue('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    router.push(`/inventory?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Pesquisar produto por código, descrição..."
        value={value}
        onChange={handleChange}
        className="pl-10 pr-10"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Limpar pesquisa</span>
        </Button>
      )}
    </div>
  )
}

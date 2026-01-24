'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Loader2, Check } from 'lucide-react'
import { searchInventory, setManualMatch } from '../[id]/matches/actions'
import type { InventorySearchResult } from '../[id]/matches/actions'
import type { RFPItemWithMatches } from '@/types/rfp'

interface ManualMatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  rfpItemId: string
  rfpItemDescription: string
  onComplete?: (updatedItem: RFPItemWithMatches) => void
}

interface InventoryResultItemProps {
  item: InventorySearchResult
  onSelect: () => void
  isPending: boolean
}

function InventoryResultItem({ item, onSelect, isPending }: InventoryResultItemProps) {
  return (
    <div
      className="flex items-center justify-between p-3 hover:bg-muted/40 cursor-pointer border-b last:border-b-0"
      onClick={onSelect}
    >
      <div className="flex-1 min-w-0 mr-2">
        <p className="font-medium text-sm truncate">
          {item.codigo_spms || item.artigo || 'Sem código'}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.descricao || 'Sem descrição'}
        </p>
        {item.preco && (
          <p className="text-xs text-muted-foreground mt-1">
            {item.preco.toFixed(2)} € / {item.unidade_venda || 'un'}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

export function ManualMatchDialog({
  open,
  onOpenChange,
  jobId,
  rfpItemId,
  rfpItemDescription,
  onComplete,
}: ManualMatchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<InventorySearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const data = await searchInventory(searchQuery)
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, 300)

  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (value.length >= 2) {
      setIsSearching(true)
    }
    debouncedSearch(value)
  }

  const handleSelect = (item: InventorySearchResult) => {
    setSelectedItemId(item.id)
    startTransition(async () => {
      const result = await setManualMatch(jobId, rfpItemId, item)
      if (result.success) {
        onOpenChange(false)
        // Reset state for next open
        setQuery('')
        setResults([])
        setSelectedItemId(null)
        // Trigger instant UI update via callback, fallback to router.refresh()
        if (onComplete && result.updatedItem) {
          onComplete(result.updatedItem)
        } else {
          router.refresh()
        }
      } else {
        console.error('Failed to set manual match:', result.error)
        setSelectedItemId(null)
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setQuery('')
      setResults([])
      setSelectedItemId(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Selecionar correspondência manualmente</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {rfpItemDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Pesquisar por código, nome ou descrição..."
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Results container */}
          <div className="max-h-[400px] overflow-y-auto border rounded-md">
            {isSearching ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : results.length > 0 ? (
              results.map((item) => (
                <InventoryResultItem
                  key={item.id}
                  item={item}
                  onSelect={() => handleSelect(item)}
                  isPending={isPending && selectedItemId === item.id}
                />
              ))
            ) : query.length >= 2 ? (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <p>Nenhum resultado encontrado</p>
                <p className="text-sm">Tente termos de pesquisa diferentes</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <p>Digite pelo menos 2 caracteres para pesquisar</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

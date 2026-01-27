'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { InventoryTable } from './inventory-table'
import type { InventoryColumnConfig } from '@/lib/supabase/types'

interface CollapsibleInventoryTableProps {
  data: Record<string, unknown>[]
  totalCount: number
  columnConfig: InventoryColumnConfig[]
  initialState: {
    page: number
    pageSize: number
    search: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  forceOpen?: boolean
}

const STORAGE_KEY = 'cardiva-inventory-table-expanded'

export function CollapsibleInventoryTable({
  data,
  totalCount,
  columnConfig,
  initialState,
  forceOpen = false,
}: CollapsibleInventoryTableProps) {
  // Initialize from localStorage or default to closed
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'true'
  })

  // Force open when search is active
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true)
    }
  }, [forceOpen])

  // Persist preference
  const toggleOpen = () => {
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem(STORAGE_KEY, String(newState))
  }

  return (
    <div className="space-y-4">
      {/* Toggle button */}
      <Button
        variant="ghost"
        onClick={toggleOpen}
        className="w-full justify-between h-auto py-3 px-4 hover:bg-muted/50"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Table2 className="h-4 w-4" />
          <span>
            {isOpen ? 'Ocultar tabela' : 'Ver tabela completa'}
          </span>
          <span className="text-xs">
            ({totalCount.toLocaleString('pt-PT')} produtos)
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </Button>

      {/* Collapsible content */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <InventoryTable
            data={data}
            totalCount={totalCount}
            columnConfig={columnConfig}
            initialState={initialState}
          />
        </div>
      </div>
    </div>
  )
}

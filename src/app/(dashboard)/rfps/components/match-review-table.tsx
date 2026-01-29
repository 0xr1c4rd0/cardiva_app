'use client'

import { useState, useEffect, useTransition } from 'react'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { Check, X, Loader2, SearchX, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { acceptMatch, rejectMatch, unselectMatch } from '../[id]/matches/actions'
import { ManualMatchDialog } from './manual-match-dialog'
import { MatchReviewToolbar } from './match-review-toolbar'
import { MatchReviewPagination } from './match-review-pagination'
import { useRFPConfirmation } from './rfp-confirmation-context'
import { useColumnResize } from '@/hooks/use-column-resize'
import { TableResizeHandle } from '@/components/table-resize-handle'
import type { RFPItemWithMatches, MatchSuggestion } from '@/types/rfp'

type StatusFilter = 'all' | 'pending' | 'matched' | 'no_match'
type SortColumn = 'lote' | 'pos' | 'artigo' | 'descricao' | 'status'
type SortDirection = 'asc' | 'desc'

// Column IDs for resize tracking
const COLUMN_IDS = {
  LOTE: 'lote',
  POS: 'pos',
  ARTIGO_PEDIDO: 'artigo_pedido',
  DESCRICAO_PEDIDO: 'descricao_pedido',
  COD_SPMS: 'cod_spms',
  ARTIGO_MATCH: 'artigo_match',
  DESCRICAO_MATCH: 'descricao_match',
  STATUS: 'status',
} as const

// Default column widths
const DEFAULT_COLUMN_WIDTHS = {
  [COLUMN_IDS.LOTE]: 100,
  [COLUMN_IDS.POS]: 90,
  [COLUMN_IDS.ARTIGO_PEDIDO]: 120,
  [COLUMN_IDS.DESCRICAO_PEDIDO]: 250,
  [COLUMN_IDS.COD_SPMS]: 120,
  [COLUMN_IDS.ARTIGO_MATCH]: 120,
  [COLUMN_IDS.DESCRICAO_MATCH]: 250,
  [COLUMN_IDS.STATUS]: 140,
}

// Storage key for column widths
const COLUMN_WIDTHS_STORAGE_KEY = 'cardiva-matches-column-widths'

interface MatchReviewState {
  page: number
  pageSize: number
  search: string
  status: StatusFilter
  sortBy: SortColumn
  sortDir: SortDirection
}

interface MatchReviewTableProps {
  jobId: string
  items: RFPItemWithMatches[]
  totalCount: number
  initialState: MatchReviewState
  onItemUpdate: (updatedItem: RFPItemWithMatches) => void
}

// Sortable header button component
interface SortableHeaderProps {
  column: SortColumn
  label: string
  sortBy: string
  sortDir: string
  onSort: (column: SortColumn) => void
  className?: string
}

function SortableHeader({ column, label, sortBy, sortDir, onSort, className = '' }: SortableHeaderProps) {
  const isActive = sortBy === column
  const isAsc = sortDir === 'asc'

  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={cn("inline-flex items-center hover:text-foreground transition-colors cursor-pointer", className)}
    >
      {label}
      {isActive ? (
        isAsc ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/60" />
      )}
    </button>
  )
}

export function MatchReviewTable({ jobId, items, totalCount, initialState, onItemUpdate }: MatchReviewTableProps) {
  // Get confirmation state from context
  const { isConfirmed } = useRFPConfirmation()

  // useTransition provides loading state and is REQUIRED by nuqs v2+ for server re-render
  const [isPending, startTransition] = useTransition()

  // Local state for instant client-side updates
  const [localItems, setLocalItems] = useState<RFPItemWithMatches[]>(items)
  const [originalItems, setOriginalItems] = useState<RFPItemWithMatches[]>(items)

  // Column resizing
  const { columnWidths, getResizeHandler, isResizingColumn } = useColumnResize({
    storageKey: COLUMN_WIDTHS_STORAGE_KEY,
    defaultWidths: DEFAULT_COLUMN_WIDTHS,
    minWidth: 50,
    maxWidth: 600,
  })

  // Update local state when server data arrives
  useEffect(() => {
    setLocalItems(items)
    setOriginalItems(items)
  }, [items])

  // Wrapped onItemUpdate that also updates local state immediately
  const handleItemUpdate = (updatedItem: RFPItemWithMatches) => {
    // Update local state immediately for instant feedback
    setLocalItems(prev => prev.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    ))
    setOriginalItems(prev => prev.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    ))
    // Also notify parent
    onItemUpdate(updatedItem)
  }

  // URL state management with startTransition for proper server component re-render
  const [{ page, pageSize, search, status, sortBy, sortDir }, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(25),
      search: parseAsString.withDefault(''),
      status: parseAsString.withDefault('all'),
      sortBy: parseAsString.withDefault('lote'),
      sortDir: parseAsString.withDefault('asc'),
    },
    {
      shallow: false,
      startTransition, // CRITICAL: Required for server re-render with nuqs v2+
    }
  )

  // Client-side sorting function
  const sortItems = (itemsList: RFPItemWithMatches[], column: SortColumn, direction: SortDirection): RFPItemWithMatches[] => {
    return [...itemsList].sort((a, b) => {
      const isAsc = direction === 'asc'
      let comparison = 0

      switch (column) {
        case 'lote':
          // Sort by lote (string), then position (number)
          comparison = String(a.lote_pedido ?? '').localeCompare(String(b.lote_pedido ?? ''), 'pt')
          if (comparison === 0) {
            comparison = (a.posicao_pedido ?? 0) - (b.posicao_pedido ?? 0)
          }
          break
        case 'pos':
          comparison = (a.posicao_pedido ?? 0) - (b.posicao_pedido ?? 0)
          break
        case 'artigo':
          comparison = String(a.artigo_pedido ?? '').localeCompare(String(b.artigo_pedido ?? ''), 'pt')
          break
        case 'descricao':
          comparison = String(a.descricao_pedido ?? '').localeCompare(String(b.descricao_pedido ?? ''), 'pt')
          break
        case 'status':
          comparison = String(a.review_status ?? '').localeCompare(String(b.review_status ?? ''), 'pt')
          break
        default:
          comparison = 0
      }

      return isAsc ? comparison : -comparison
    })
  }

  // Client-side search filtering function
  const filterBySearch = (itemsList: RFPItemWithMatches[], searchTerm: string): RFPItemWithMatches[] => {
    if (!searchTerm) return itemsList
    const searchLower = searchTerm.toLowerCase()
    return itemsList.filter(item => {
      // Check RFP side
      const rfpMatch =
        item.artigo_pedido?.toLowerCase().includes(searchLower) ||
        item.descricao_pedido?.toLowerCase().includes(searchLower)
      if (rfpMatch) return true

      // Check matched product side (accepted suggestions)
      const acceptedMatch = item.rfp_match_suggestions.find(m => m.status === 'accepted')
      if (acceptedMatch) {
        return (
          acceptedMatch.artigo?.toLowerCase().includes(searchLower) ||
          acceptedMatch.descricao?.toLowerCase().includes(searchLower)
        )
      }

      return false
    })
  }

  // Client-side status filtering function (matches server-side logic)
  const filterByStatus = (itemsList: RFPItemWithMatches[], statusFilter: StatusFilter): RFPItemWithMatches[] => {
    if (statusFilter === 'all') return itemsList
    return itemsList.filter(item => {
      const hasSuggestions = item.rfp_match_suggestions.length > 0
      const hasPerfectMatch = item.rfp_match_suggestions.some(m => m.similarity_score >= 0.9999)

      switch (statusFilter) {
        case 'pending':
          // Pending items with suggestions to review (no 100% match)
          return item.review_status === 'pending' && hasSuggestions && !hasPerfectMatch
        case 'matched':
          // Items with accepted/manual match OR perfect match
          return (
            item.review_status === 'accepted' ||
            item.review_status === 'manual' ||
            (item.review_status === 'pending' && hasPerfectMatch)
          )
        case 'no_match':
          // Rejected items OR pending items with no suggestions
          return item.review_status === 'rejected' || (item.review_status === 'pending' && !hasSuggestions)
        default:
          return true
      }
    })
  }

  // Combined filter function
  const applyFilters = (itemsList: RFPItemWithMatches[], searchTerm: string, statusFilter: StatusFilter): RFPItemWithMatches[] => {
    let result = filterByStatus(itemsList, statusFilter)
    result = filterBySearch(result, searchTerm)
    return result
  }

  // URL state handlers with instant client-side updates
  const handleSearchChange = (value: string) => {
    // Instant client-side filter
    const filtered = applyFilters(originalItems, value, (status as StatusFilter) || 'all')
    const sorted = sortItems(filtered, sortBy as SortColumn, sortDir as SortDirection)
    setLocalItems(sorted)
    // Update URL (server will refetch with full results across all pages)
    startTransition(() => {
      setParams({ search: value || null, page: 1 })
    })
  }

  const handleStatusChange = (newStatus: StatusFilter) => {
    // Instant client-side filter
    const filtered = applyFilters(originalItems, search, newStatus)
    const sorted = sortItems(filtered, sortBy as SortColumn, sortDir as SortDirection)
    setLocalItems(sorted)
    // Update URL (server will refetch with full results across all pages)
    startTransition(() => {
      setParams({ status: newStatus === 'all' ? null : newStatus, page: 1 })
    })
  }

  const handleSortChange = (column: SortColumn) => {
    const newDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc'
    // Instant client-side sort
    setLocalItems(prev => sortItems(prev, column, newDir))
    // Update URL (will also trigger server refresh for pagination correctness)
    startTransition(() => {
      setParams({
        sortBy: column,
        sortDir: newDir,
        page: 1
      })
    })
  }

  const handlePageChange = (newPage: number) => {
    setParams({ page: newPage === 1 ? null : newPage })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setParams({ pageSize: newPageSize === 25 ? null : newPageSize, page: 1 })
  }

  const handleClearFilters = () => {
    // Restore original items with current sort (no filters)
    const sorted = sortItems(originalItems, sortBy as SortColumn, sortDir as SortDirection)
    setLocalItems(sorted)
    startTransition(() => {
      setParams({ search: null, status: null, page: 1 })
    })
  }

  // Empty state for search results
  const isSearchEmpty = localItems.length === 0 && (search || status !== 'all')

  return (
    <div className="space-y-0">
      {/* Toolbar */}
      <MatchReviewToolbar
        search={search}
        onSearchChange={handleSearchChange}
        status={(status as StatusFilter) || 'all'}
        onStatusChange={handleStatusChange}
        isPending={isPending}
      />

      {isSearchEmpty ? (
        // Search/filter empty state
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-border/40">
          <div className="mb-6 rounded-sm bg-muted p-6">
            <SearchX className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">Nenhum produto encontrado</h3>
          <p className="mb-6 max-w-sm text-muted-foreground">
            {search
              ? `Não foram encontrados produtos para "${search}".`
              : 'Não foram encontrados produtos com o filtro selecionado.'}
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="rounded border border-border shadow-xs overflow-hidden bg-white p-2 overflow-x-hidden">
            <Table className="[&_thead_tr]:border-0 table-fixed w-full">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-0 cursor-default">
                  <TableHead
                    aria-sort={sortBy === 'lote' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    style={{ width: columnWidths[COLUMN_IDS.LOTE] }}
                    className="relative pl-4 whitespace-nowrap text-xs font-medium text-muted-foreground tracking-wide bg-muted/70 py-2 rounded-l"
                  >
                    <SortableHeader
                      column="lote"
                      label="Lote"
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSort={handleSortChange}
                    />
                    <TableResizeHandle
                      onMouseDown={getResizeHandler(COLUMN_IDS.LOTE)}
                      onTouchStart={getResizeHandler(COLUMN_IDS.LOTE)}
                      isResizing={isResizingColumn === COLUMN_IDS.LOTE}
                    />
                  </TableHead>
                  <TableHead
                    aria-sort={sortBy === 'pos' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    style={{ width: columnWidths[COLUMN_IDS.POS] }}
                    className="relative whitespace-nowrap text-xs font-medium text-muted-foreground tracking-wide bg-muted/70 py-2 px-3"
                  >
                    <SortableHeader
                      column="pos"
                      label="Posição"
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSort={handleSortChange}
                    />
                    <TableResizeHandle
                      onMouseDown={getResizeHandler(COLUMN_IDS.POS)}
                      onTouchStart={getResizeHandler(COLUMN_IDS.POS)}
                      isResizing={isResizingColumn === COLUMN_IDS.POS}
                    />
                  </TableHead>
                  <TableHead
                    aria-sort={sortBy === 'artigo' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    style={{ width: columnWidths[COLUMN_IDS.ARTIGO_PEDIDO] }}
                    className="relative whitespace-nowrap text-xs font-medium text-muted-foreground tracking-wide bg-muted/70 py-2 px-3"
                  >
                    <SortableHeader
                      column="artigo"
                      label="Artigo"
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSort={handleSortChange}
                    />
                    <TableResizeHandle
                      onMouseDown={getResizeHandler(COLUMN_IDS.ARTIGO_PEDIDO)}
                      onTouchStart={getResizeHandler(COLUMN_IDS.ARTIGO_PEDIDO)}
                      isResizing={isResizingColumn === COLUMN_IDS.ARTIGO_PEDIDO}
                    />
                  </TableHead>
                  <TableHead
                    aria-sort={sortBy === 'descricao' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    style={{ width: columnWidths[COLUMN_IDS.DESCRICAO_PEDIDO] }}
                    className="relative text-xs font-medium text-muted-foreground tracking-wide bg-muted/70 py-2 px-3"
                  >
                    <SortableHeader
                      column="descricao"
                      label="Descrição"
                      sortBy={sortBy}
                      sortDir={sortDir}
                      onSort={handleSortChange}
                    />
                    <TableResizeHandle
                      onMouseDown={getResizeHandler(COLUMN_IDS.DESCRICAO_PEDIDO)}
                      onTouchStart={getResizeHandler(COLUMN_IDS.DESCRICAO_PEDIDO)}
                      isResizing={isResizingColumn === COLUMN_IDS.DESCRICAO_PEDIDO}
                    />
                  </TableHead>
                  <TableHead
                    style={{ width: columnWidths[COLUMN_IDS.COD_SPMS] }}
                    className="relative whitespace-nowrap text-xs font-medium text-muted-foreground tracking-wide bg-muted/70 py-2 px-3"
                  >
                    <span className="inline-flex items-center">Cód. SPMS</span>
                    <TableResizeHandle
                      onMouseDown={getResizeHandler(COLUMN_IDS.COD_SPMS)}
                      onTouchStart={getResizeHandler(COLUMN_IDS.COD_SPMS)}
                      isResizing={isResizingColumn === COLUMN_IDS.COD_SPMS}
                    />
                  </TableHead>
                  <TableHead
                    style={{ width: columnWidths[COLUMN_IDS.ARTIGO_MATCH] }}
                    className="relative whitespace-nowrap text-xs font-medium text-muted-foreground tracking-wide bg-muted/70 py-2 px-3"
                  >
                    <span className="inline-flex items-center">Artigo</span>
                    <TableResizeHandle
                      onMouseDown={getResizeHandler(COLUMN_IDS.ARTIGO_MATCH)}
                      onTouchStart={getResizeHandler(COLUMN_IDS.ARTIGO_MATCH)}
                      isResizing={isResizingColumn === COLUMN_IDS.ARTIGO_MATCH}
                    />
                  </TableHead>
                  <TableHead
                    style={{ width: columnWidths[COLUMN_IDS.DESCRICAO_MATCH] }}
                    className="relative text-xs font-medium text-muted-foreground tracking-wide bg-muted/70 py-2 px-3"
                  >
                    <span className="inline-flex items-center">Descrição</span>
                    <TableResizeHandle
                      onMouseDown={getResizeHandler(COLUMN_IDS.DESCRICAO_MATCH)}
                      onTouchStart={getResizeHandler(COLUMN_IDS.DESCRICAO_MATCH)}
                      isResizing={isResizingColumn === COLUMN_IDS.DESCRICAO_MATCH}
                    />
                  </TableHead>
                  <TableHead
                    style={{ width: columnWidths[COLUMN_IDS.STATUS] }}
                    className="relative whitespace-nowrap pr-4 text-xs font-medium text-muted-foreground tracking-wide bg-muted/70 py-2 text-right rounded-r"
                  >
                    <span className="inline-flex items-center">Estado</span>
                    <TableResizeHandle
                      onMouseDown={getResizeHandler(COLUMN_IDS.STATUS)}
                      onTouchStart={getResizeHandler(COLUMN_IDS.STATUS)}
                      isResizing={isResizingColumn === COLUMN_IDS.STATUS}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    jobId={jobId}
                    item={item}
                    isConfirmed={isConfirmed}
                    onItemUpdate={handleItemUpdate}
                    columnWidths={columnWidths}
                  />
                ))}
                {localItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      Nenhum produto encontrado para este concurso.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalCount > 0 && (
            <MatchReviewPagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isPending={isPending}
            />
          )}
        </>
      )}
    </div>
  )
}

interface ItemRowProps {
  jobId: string
  item: RFPItemWithMatches
  isConfirmed: boolean
  onItemUpdate: (updatedItem: RFPItemWithMatches) => void
  columnWidths: Record<string, number>
}

function ItemRow({ jobId, item, isConfirmed, onItemUpdate, columnWidths }: ItemRowProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [showManualDialog, setShowManualDialog] = useState(false)

  const hasNoSuggestions = item.rfp_match_suggestions.length === 0
  const perfectMatch = item.rfp_match_suggestions.find((m) => m.similarity_score >= 0.9999)
  const acceptedMatch = item.rfp_match_suggestions.find((m) => m.status === 'accepted')

  const isExplicitlyReviewed = item.review_status !== 'pending'
  const hasPerfectMatch = !!perfectMatch && item.review_status === 'pending'
  const displayMatch = acceptedMatch || (hasPerfectMatch ? perfectMatch : null)

  const showAsMatched = item.review_status === 'accepted' || item.review_status === 'manual' || hasPerfectMatch
  const showAsRejected = item.review_status === 'rejected'
  const showAsManual = item.review_status === 'manual'
  const pendingSuggestions = item.rfp_match_suggestions.filter(m => m.status === 'pending').length

  // Check if all suggestions have been rejected (for showing "Selecionar produto do inventário?" link)
  const allSuggestionsRejected = item.rfp_match_suggestions.length > 0 &&
    item.rfp_match_suggestions.every(m => m.status === 'rejected')

  // Matched product data to display
  // For manual matches, hide codigo_spms (show "—") since it's user-selected, not system-matched
  const isManualMatch = displayMatch?.match_type === 'Manual'
  const matchedCodigo = (!isManualMatch && displayMatch?.codigo_spms) ? displayMatch.codigo_spms : null
  const matchedArtigo = displayMatch?.artigo ?? null
  const matchedDescricao = displayMatch?.descricao ?? null

  return (
    <TableRow
      className={cn(
        'transition-all duration-100',
        'hover:bg-muted/50'
      )}
    >
      {/* RFP Item columns */}
      <TableCell
        style={{ width: columnWidths[COLUMN_IDS.LOTE] }}
        className="pl-4 py-2 whitespace-nowrap font-mono text-foreground text-sm"
      >
        {item.lote_pedido ?? <span className="text-muted-foreground/40 italic">—</span>}
      </TableCell>
      <TableCell
        style={{ width: columnWidths[COLUMN_IDS.POS] }}
        className="py-2 px-3 whitespace-nowrap font-mono text-foreground text-sm"
      >
        {item.posicao_pedido ?? <span className="text-muted-foreground/40 italic">—</span>}
      </TableCell>
      <TableCell
        style={{ width: columnWidths[COLUMN_IDS.ARTIGO_PEDIDO] }}
        className="py-2 px-3 text-foreground text-sm break-words"
      >
        {item.artigo_pedido ?? <span className="text-muted-foreground/40 italic">—</span>}
      </TableCell>
      <TableCell
        style={{ width: columnWidths[COLUMN_IDS.DESCRICAO_PEDIDO] }}
        className="py-2 px-3 text-muted-foreground text-xs break-words"
      >
        {item.descricao_pedido}
      </TableCell>

      {/* Matched product columns - Cardiva zone */}
      <TableCell
        style={{ width: columnWidths[COLUMN_IDS.COD_SPMS] }}
        className="py-2 px-3 whitespace-nowrap font-mono text-sm"
      >
        {matchedCodigo ? (
          <span className="text-emerald-700 font-medium">{matchedCodigo}</span>
        ) : (
          <span className="text-muted-foreground/40 italic">—</span>
        )}
      </TableCell>
      <TableCell
        style={{ width: columnWidths[COLUMN_IDS.ARTIGO_MATCH] }}
        className="py-2 px-3 text-sm break-words"
      >
        {matchedArtigo ? (
          <span className="text-emerald-700 font-medium">{matchedArtigo}</span>
        ) : (
          <span className="text-muted-foreground/40 italic">—</span>
        )}
      </TableCell>
      <TableCell
        style={{ width: columnWidths[COLUMN_IDS.DESCRICAO_MATCH] }}
        className="py-2 px-3 text-xs break-words"
      >
        {matchedDescricao ? (
          <span className="text-emerald-600 uppercase">{matchedDescricao}</span>
        ) : (
          <span className="text-muted-foreground/40 italic">—</span>
        )}
      </TableCell>

      {/* Status / Action column */}
      <TableCell
        style={{ width: columnWidths[COLUMN_IDS.STATUS] }}
        className="py-2 text-right pr-4"
      >
        <div className="flex items-center justify-end gap-2">
          {/* Status button / Popover */}
          {hasNoSuggestions ? (
            /* "Sem correspondência" - now clickable to show manual correction option (unless confirmed) */
            <Popover open={isPopoverOpen} onOpenChange={isConfirmed ? undefined : setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "text-gray-500 border-gray-200 bg-gray-50/50",
                    isConfirmed ? "cursor-default" : "hover:bg-gray-100"
                  )}
                  disabled={isConfirmed}
                >
                  Sem correspondência
                </Button>
              </PopoverTrigger>
              {!isConfirmed && (
                <PopoverContent
                  align="end"
                  className="w-[300px] p-4 shadow-lg border-border/50"
                  sideOffset={8}
                >
                  <p className="text-sm text-muted-foreground mb-3">
                    Não foram encontradas correspondências automáticas para este produto.
                  </p>
                  <button
                    type="button"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground underline text-left"
                    onClick={() => {
                      setIsPopoverOpen(false)
                      setShowManualDialog(true)
                    }}
                  >
                    Selecionar produto do inventário?
                  </button>
                </PopoverContent>
              )}
            </Popover>
          ) : (
            <Popover open={isPopoverOpen} onOpenChange={isConfirmed ? undefined : setIsPopoverOpen}>
              <PopoverTrigger asChild>
                {(showAsManual || showAsMatched) && displayMatch ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-emerald-600 border-emerald-200 bg-emerald-50/20",
                      isConfirmed ? "cursor-default" : "hover:bg-emerald-50 hover:border-emerald-300"
                    )}
                    disabled={isConfirmed}
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Selecionado
                  </Button>
                ) : showAsRejected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-gray-500 border-gray-200 bg-gray-50/50",
                      isConfirmed ? "cursor-default" : "hover:bg-gray-100"
                    )}
                    disabled={isConfirmed}
                  >
                    Sem correspondência
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-amber-600 border-amber-200 bg-amber-50/50",
                      isConfirmed ? "cursor-default" : "hover:bg-amber-50"
                    )}
                    disabled={isConfirmed}
                  >
                    {pendingSuggestions} {pendingSuggestions !== 1 ? 'sugestões' : 'sugestão'}
                  </Button>
                )}
              </PopoverTrigger>
              {!isConfirmed && (
                <PopoverContent
                  align="end"
                  className="p-0 shadow-lg border-border/50 w-fit max-w-[800px]"
                  sideOffset={8}
                >
                  <div className="p-4 border-b border-border/40">
                    <p className="text-sm font-medium">
                      {showAsMatched ? 'Alterar seleção' : showAsRejected ? 'Rever sugestões' : 'Selecionar correspondência'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                      {item.descricao_pedido}
                    </p>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto overflow-x-auto">
                    {item.rfp_match_suggestions.map((match) => (
                      <SuggestionItem
                        key={match.id}
                        jobId={jobId}
                        rfpItemId={item.id}
                        match={match}
                        isPerfectMatch={match.similarity_score >= 0.9999}
                        onActionComplete={(updatedItem, actionType) => {
                          if (updatedItem) {
                            // Always update the item first
                            onItemUpdate(updatedItem)

                            // Close popover on accept, or on reject if no more pending matches
                            if (actionType === 'accept') {
                              setIsPopoverOpen(false)
                            } else if (actionType === 'reject') {
                              // Check if there are still pending matches after this rejection
                              const hasPendingMatches = updatedItem.rfp_match_suggestions.some(
                                m => m.status === 'pending'
                              )
                              if (!hasPendingMatches) {
                                setIsPopoverOpen(false)
                              }
                            }
                          }
                        }}
                      />
                    ))}
                  </div>
                  {/* Footer - Show "Selecionar produto do inventário?" if all rejected, otherwise "Selecionar outro produto" */}
                  <div className="p-3 border-t border-border/40 bg-muted/20">
                    {allSuggestionsRejected ? (
                      <div className="text-left">
                        <p className="text-xs text-muted-foreground mb-1">
                          Todas as sugestões foram rejeitadas.
                        </p>
                        <button
                          type="button"
                          className="text-sm font-medium text-muted-foreground hover:text-foreground underline text-left"
                          onClick={() => {
                            setIsPopoverOpen(false)
                            setShowManualDialog(true)
                          }}
                        >
                          Selecionar produto do inventário?
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground underline text-left"
                        onClick={() => {
                          setIsPopoverOpen(false)
                          setShowManualDialog(true)
                        }}
                      >
                        Selecionar produto do inventário?
                      </button>
                    )}
                  </div>
                </PopoverContent>
              )}
            </Popover>
          )}
        </div>

        {/* Manual Match Dialog */}
        <ManualMatchDialog
          open={showManualDialog}
          onOpenChange={setShowManualDialog}
          jobId={jobId}
          rfpItemId={item.id}
          rfpItemDescription={item.descricao_pedido}
          onComplete={onItemUpdate}
        />
      </TableCell>
    </TableRow>
  )
}

interface SuggestionItemProps {
  jobId: string
  rfpItemId: string
  match: MatchSuggestion
  isPerfectMatch: boolean
  onActionComplete: (updatedItem?: RFPItemWithMatches, actionType?: 'accept' | 'reject') => void
}

function SuggestionItem({ jobId, rfpItemId, match, isPerfectMatch, onActionComplete }: SuggestionItemProps) {
  const [isAcceptPending, setIsAcceptPending] = useState(false)
  const [isRejectPending, setIsRejectPending] = useState(false)

  const isAccepted = match.status === 'accepted'
  const isRejected = match.status === 'rejected'
  const isPendingStatus = match.status === 'pending'
  const confidencePercent = Math.round(match.similarity_score * 100)
  const isManualMatch = match.match_type === 'Manual'

  // Show as selected if accepted OR if it's a perfect match that hasn't been reviewed
  const showAsSelected = isAccepted || (isPerfectMatch && isPendingStatus)

  // Perfect matches (100%) cannot be toggled - they are locked
  // But manual matches CAN be toggled (user should be able to undo their selection)
  const isLocked = isPerfectMatch && !isManualMatch

  const handleAcceptOrToggle = async () => {
    // If locked (perfect match), do nothing
    if (isLocked) return

    setIsAcceptPending(true)

    // Call server action directly
    const result = isAccepted
      ? await unselectMatch(jobId, rfpItemId, match.id)
      : await acceptMatch(jobId, rfpItemId, match.id)

    setIsAcceptPending(false)

    if (!result.success) {
      console.error('[handleAcceptOrToggle] Action failed:', result.error)
      return
    }

    // Pass the updated item to trigger instant UI update
    onActionComplete(result.updatedItem, 'accept')
  }

  const handleRejectOrToggle = async () => {
    // If locked (perfect match), do nothing
    if (isLocked) return

    setIsRejectPending(true)

    // Call server action directly
    const result = isRejected
      ? await unselectMatch(jobId, rfpItemId, match.id)
      : await rejectMatch(jobId, rfpItemId, match.id)

    setIsRejectPending(false)

    if (!result.success) {
      console.error('[handleRejectOrToggle] Action failed:', result.error)
      return
    }

    // Pass the updated item to trigger instant UI update
    onActionComplete(result.updatedItem, 'reject')
  }

  return (
    <div
      className={cn(
        'flex items-center gap-6 px-4 py-3 border-b border-border/20 last:border-0 transition-colors',
        'hover:bg-muted/40',
        showAsSelected && 'bg-emerald-50/20 border-l-2 border-l-emerald-400',
        isRejected && 'opacity-75'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium whitespace-nowrap"
            title={match.artigo ?? match.codigo_spms ?? undefined}
          >
            {match.artigo ?? match.codigo_spms ?? '—'}
          </span>
          <Badge
            variant={
              isManualMatch ? 'info' :
              confidencePercent >= 99 ? 'success' :
              confidencePercent >= 80 ? 'info' :
              confidencePercent >= 60 ? 'warning' :
              'secondary'
            }
            className={!isManualMatch ? 'font-mono' : undefined}
          >
            {isManualMatch ? 'Manual' : `${confidencePercent}%`}
          </Badge>
          {isLocked && !isManualMatch && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Auto
            </span>
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="text-xs text-muted-foreground whitespace-nowrap mt-0.5 uppercase cursor-help">
              {match.descricao ?? '—'}
            </p>
          </TooltipTrigger>
          <TooltipContent
            className="bg-white text-muted-foreground border border-border rounded uppercase max-w-md"
            sideOffset={5}
          >
            {match.descricao_comercial ?? match.descricao ?? '—'}
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={showAsSelected ? 'default' : 'outline'}
          className={cn(
            "h-7 w-7 p-0 rounded",
            showAsSelected && "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 disabled:opacity-100",
            isLocked && showAsSelected && "cursor-default"
          )}
          onClick={handleAcceptOrToggle}
          disabled={isAcceptPending || (isLocked && showAsSelected)}
        >
          {isAcceptPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "h-7 w-7 p-0 rounded",
            isRejected
              ? "bg-gray-200 text-gray-700 hover:bg-gray-200 border-gray-300"
              : "text-muted-foreground hover:text-gray-600 hover:bg-gray-100"
          )}
          onClick={handleRejectOrToggle}
          disabled={isRejectPending || isLocked}
        >
          {isRejectPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  )
}

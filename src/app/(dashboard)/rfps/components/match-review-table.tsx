'use client'

import { useState, useTransition } from 'react'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { Check, X, Loader2, SearchX } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { acceptMatch, rejectMatch, unselectMatch } from '../[id]/matches/actions'
import { ManualMatchDialog } from './manual-match-dialog'
import { MatchReviewToolbar } from './match-review-toolbar'
import { MatchReviewPagination } from './match-review-pagination'
import type { RFPItemWithMatches, MatchSuggestion } from '@/types/rfp'

type StatusFilter = 'all' | 'pending' | 'matched' | 'no_match'
type SortOption = 'position' | 'status'

interface MatchReviewState {
  page: number
  pageSize: number
  search: string
  status: StatusFilter
  sortBy: SortOption
}

interface MatchReviewTableProps {
  jobId: string
  items: RFPItemWithMatches[]
  totalCount: number
  initialState: MatchReviewState
}

export function MatchReviewTable({ jobId, items, totalCount, initialState }: MatchReviewTableProps) {
  const [isPending, startTransition] = useTransition()

  // URL state management
  const [{ page, pageSize, search, status, sortBy }, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(initialState.page),
      pageSize: parseAsInteger.withDefault(initialState.pageSize),
      search: parseAsString.withDefault(initialState.search),
      status: parseAsString.withDefault(initialState.status),
      sortBy: parseAsString.withDefault(initialState.sortBy),
    },
    { shallow: false }
  )

  // URL state handlers
  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setParams({ search: value || null, page: 1 })
    })
  }

  const handleStatusChange = (newStatus: StatusFilter) => {
    startTransition(() => {
      setParams({ status: newStatus === 'all' ? null : newStatus, page: 1 })
    })
  }

  const handleSortChange = (newSortBy: SortOption) => {
    startTransition(() => {
      setParams({ sortBy: newSortBy === 'position' ? null : newSortBy, page: 1 })
    })
  }

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      setParams({ page: newPage === 1 ? null : newPage })
    })
  }

  const handlePageSizeChange = (newPageSize: number) => {
    startTransition(() => {
      setParams({ pageSize: newPageSize === 25 ? null : newPageSize, page: 1 })
    })
  }

  const handleClearFilters = () => {
    startTransition(() => {
      setParams({ search: null, status: null, page: 1 })
    })
  }

  // Empty state for search results
  const isSearchEmpty = items.length === 0 && (search || status !== 'all')

  return (
    <div className="space-y-0">
      {/* Toolbar */}
      <MatchReviewToolbar
        search={search}
        onSearchChange={handleSearchChange}
        status={(status as StatusFilter) || 'all'}
        onStatusChange={handleStatusChange}
        sortBy={(sortBy as SortOption) || 'position'}
        onSortChange={handleSortChange}
        isPending={isPending}
      />

      {isSearchEmpty ? (
        // Search/filter empty state
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-border/40">
          <div className="mb-6 rounded-full bg-muted p-6">
            <SearchX className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">Nenhum item encontrado</h3>
          <p className="mb-6 max-w-sm text-muted-foreground">
            {search
              ? `Não foram encontrados itens para "${search}".`
              : 'Não foram encontrados itens com o filtro selecionado.'}
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-lg border border-slate-200 shadow-xs overflow-hidden bg-white p-2">
            <Table className="[&_thead_tr]:border-0">
              <TableHeader>
                <TableRow className="hover:bg-transparent border-0">
                  <TableHead className="pl-4 whitespace-nowrap text-xs font-medium text-slate-700 uppercase tracking-wide bg-slate-100/70 py-2 rounded-l-md">Lote</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-medium text-slate-700 uppercase tracking-wide bg-slate-100/70 py-2 px-3">Pos</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-medium text-slate-700 uppercase tracking-wide bg-slate-100/70 py-2 px-3">Artigo</TableHead>
                  <TableHead className="text-xs font-medium text-slate-700 uppercase tracking-wide bg-slate-100/70 py-2 px-3">Descrição</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-medium text-slate-700 uppercase tracking-wide bg-slate-100/70 py-2 px-3">Cód. SPMS</TableHead>
                  <TableHead className="whitespace-nowrap text-xs font-medium text-slate-700 uppercase tracking-wide bg-slate-100/70 py-2 px-3">Artigo</TableHead>
                  <TableHead className="text-xs font-medium text-slate-700 uppercase tracking-wide bg-slate-100/70 py-2 px-3">Descrição</TableHead>
                  <TableHead className="whitespace-nowrap pr-4 text-xs font-medium text-slate-700 uppercase tracking-wide bg-slate-100/70 py-2 text-right rounded-r-md">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <ItemRow
                    key={item.id}
                    jobId={jobId}
                    item={item}
                  />
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      Nenhum item encontrado para este concurso.
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
}

function ItemRow({ jobId, item }: ItemRowProps) {
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
        'hover:bg-slate-50'
      )}
    >
      {/* RFP Item columns */}
      <TableCell className="pl-4 py-2 whitespace-nowrap font-mono text-slate-700 text-sm">
        {item.lote_pedido ?? <span className="text-slate-300 italic">—</span>}
      </TableCell>
      <TableCell className="py-2 px-3 whitespace-nowrap font-mono text-slate-700 text-sm">
        {item.posicao_pedido ?? <span className="text-slate-300 italic">—</span>}
      </TableCell>
      <TableCell className="py-2 px-3 whitespace-nowrap text-slate-700 text-sm">
        {item.artigo_pedido ?? <span className="text-slate-300 italic">—</span>}
      </TableCell>
      <TableCell className="py-2 px-3 text-slate-600 text-sm">
        {item.descricao_pedido}
      </TableCell>

      {/* Matched product columns - Cardiva zone */}
      <TableCell className="py-2 px-3 whitespace-nowrap font-mono text-sm">
        {matchedCodigo ? (
          <span className="text-emerald-700 font-medium">{matchedCodigo}</span>
        ) : (
          <span className="text-slate-300 italic">—</span>
        )}
      </TableCell>
      <TableCell className="py-2 px-3 whitespace-nowrap text-sm">
        {matchedArtigo ? (
          <span className="text-emerald-700 font-medium">{matchedArtigo}</span>
        ) : (
          <span className="text-slate-300 italic">—</span>
        )}
      </TableCell>
      <TableCell className="py-2 px-3 text-sm">
        {matchedDescricao ? (
          <span className="text-emerald-600">{matchedDescricao}</span>
        ) : (
          <span className="text-slate-300 italic">—</span>
        )}
      </TableCell>

      {/* Status / Action column */}
      <TableCell className="py-2 whitespace-nowrap text-right pr-4">
        <div className="flex items-center justify-end gap-2">
          {/* Status button / Popover */}
          {hasNoSuggestions ? (
            /* "Sem correspondência" - now clickable to show manual correction option */
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-500 border-gray-200 bg-gray-50/50 hover:bg-gray-100"
                >
                  Sem correspondência
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[300px] p-4 shadow-lg border-border/50"
                sideOffset={8}
              >
                <p className="text-sm text-muted-foreground mb-3">
                  Não foram encontradas correspondências automáticas para este item.
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
            </Popover>
          ) : (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                {(showAsManual || showAsMatched) && displayMatch ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emerald-600 border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50 hover:border-emerald-300"
                  >
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Selecionado
                  </Button>
                ) : showAsRejected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-500 border-gray-200 bg-gray-50/50 hover:bg-gray-100"
                  >
                    Sem correspondência
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-600 border-amber-200 bg-amber-50/50 hover:bg-amber-50"
                  >
                    {pendingSuggestions} {pendingSuggestions !== 1 ? 'sugestões' : 'sugestão'}
                  </Button>
                )}
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[420px] p-0 shadow-lg border-border/50"
                sideOffset={8}
              >
                <div className="p-4 border-b border-border/40">
                  <p className="text-sm font-medium">
                    {showAsMatched ? 'Alterar seleção' : showAsRejected ? 'Rever sugestões' : 'Selecionar correspondência'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {item.descricao_pedido}
                  </p>
                </div>
                <div className="max-h-[280px] overflow-y-auto">
                  {item.rfp_match_suggestions.map((match) => (
                    <SuggestionItem
                      key={match.id}
                      jobId={jobId}
                      rfpItemId={item.id}
                      match={match}
                      isPerfectMatch={match.similarity_score >= 0.9999}
                      onActionComplete={() => setIsPopoverOpen(false)}
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
  onActionComplete: () => void
}

function SuggestionItem({ jobId, rfpItemId, match, isPerfectMatch, onActionComplete }: SuggestionItemProps) {
  const [isPending, startTransition] = useTransition()

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

  const handleAcceptOrToggle = () => {
    // If locked (perfect match), do nothing
    if (isLocked) return

    startTransition(async () => {
      if (isAccepted) {
        // Toggle off - unselect
        await unselectMatch(jobId, rfpItemId, match.id)
      } else {
        // Accept this match
        await acceptMatch(jobId, rfpItemId, match.id)
      }
      onActionComplete()
    })
  }

  const handleRejectOrToggle = () => {
    // If locked (perfect match), do nothing
    if (isLocked) return

    startTransition(async () => {
      if (isRejected) {
        // Toggle off - unreject (restore to pending)
        await unselectMatch(jobId, rfpItemId, match.id)
      } else {
        // Reject this match
        await rejectMatch(jobId, rfpItemId, match.id)
      }
    })
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0 transition-colors',
        'hover:bg-muted/40',
        showAsSelected && 'bg-emerald-50/20 border-l-2 border-l-emerald-400',
        isRejected && 'opacity-75'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium truncate"
            title={match.artigo ?? match.codigo_spms ?? undefined}
          >
            {match.artigo ?? match.codigo_spms ?? '—'}
          </span>
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded',
              isManualMatch ? 'bg-blue-100 text-blue-700' :
              confidencePercent >= 99 ? 'bg-emerald-100 text-emerald-700 font-mono' :
              confidencePercent >= 80 ? 'bg-blue-100 text-blue-700 font-mono' :
              confidencePercent >= 60 ? 'bg-amber-100 text-amber-700 font-mono' :
              'bg-gray-100 text-gray-600 font-mono'
            )}
          >
            {isManualMatch ? 'Manual' : `${confidencePercent}%`}
          </span>
          {isLocked && !isManualMatch && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Auto
            </span>
          )}
        </div>
        <p
          className="text-xs text-muted-foreground truncate mt-0.5"
          title={match.descricao ?? undefined}
        >
          {match.descricao ?? '—'}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <Button
              size="sm"
              variant={showAsSelected ? 'default' : 'ghost'}
              className={cn(
                "h-7 w-7 p-0",
                showAsSelected && "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-100",
                isLocked && showAsSelected && "cursor-default"
              )}
              onClick={handleAcceptOrToggle}
              disabled={isLocked && showAsSelected}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 w-7 p-0",
                isRejected
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-200"
                  : "text-muted-foreground hover:text-gray-600 hover:bg-gray-100"
              )}
              onClick={handleRejectOrToggle}
              disabled={isLocked}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

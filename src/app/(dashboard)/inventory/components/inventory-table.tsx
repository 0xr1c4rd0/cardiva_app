'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { PackageOpen } from 'lucide-react'
import { DataTablePagination } from './data-table-pagination'
import { TableToolbar } from './table-toolbar'
import { Artigo, InventoryColumnConfig } from '@/lib/supabase/types'

// Currency formatter for currency columns
const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
})

// Date formatter for date columns
const dateFormatter = new Intl.DateTimeFormat('pt-PT', {
  dateStyle: 'medium',
})

interface InventoryTableProps {
  data: Artigo[]
  totalCount: number
  columnConfig: InventoryColumnConfig[]
  initialState: {
    page: number
    pageSize: number
    search: string
    sortBy: string
    sortOrder: string
  }
}

// Generate column definitions dynamically from config
function createColumns(config: InventoryColumnConfig[]): ColumnDef<Artigo>[] {
  return config.map((col): ColumnDef<Artigo> => {
    const baseColumn: ColumnDef<Artigo> = {
      accessorKey: col.column_name,
      enableSorting: col.sortable,
      header: col.sortable
        ? ({ column }) => (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="inline-flex items-center hover:text-slate-900 transition-colors"
            >
              {col.display_name}
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-1 h-3 w-3" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-1 h-3 w-3" />
              ) : (
                <ArrowUpDown className="ml-1 h-3 w-3 text-slate-400" />
              )}
            </button>
          )
        : col.display_name,
    }

    // Add cell renderer based on column type
    switch (col.column_type) {
      case 'currency':
        baseColumn.cell = ({ row }) => {
          const value = row.getValue(col.column_name) as number | null
          return value != null ? currencyFormatter.format(value) : '-'
        }
        break
      case 'number':
        baseColumn.cell = ({ row }) => {
          const value = row.getValue(col.column_name) as number | null
          return value != null ? value.toLocaleString('pt-PT') : '-'
        }
        break
      case 'date':
        baseColumn.cell = ({ row }) => {
          const value = row.getValue(col.column_name) as string | null
          if (!value) return '-'
          try {
            return dateFormatter.format(new Date(value))
          } catch {
            return value
          }
        }
        break
      default: // text
        baseColumn.cell = ({ row }) => {
          const value = row.getValue(col.column_name)
          return value != null && value !== '' ? String(value) : '-'
        }
    }

    return baseColumn
  })
}

export function InventoryTable({
  data,
  totalCount,
  columnConfig,
  initialState,
}: InventoryTableProps) {
  const [isPending, startTransition] = useTransition()

  // Local state for instant client-side updates
  const [localData, setLocalData] = useState<Artigo[]>(data)
  const [originalData, setOriginalData] = useState<Artigo[]>(data)

  // Update local state when server data arrives
  useEffect(() => {
    setLocalData(data)
    setOriginalData(data)
  }, [data])

  // Generate columns from config
  const columns = useMemo(() => createColumns(columnConfig), [columnConfig])

  // Get searchable column names for client-side filtering
  const searchableColumnNames = useMemo(() =>
    columnConfig.filter(c => c.searchable).map(c => c.column_name),
    [columnConfig]
  )

  const [{ page, pageSize, search, sortBy, sortOrder }, setParams] =
    useQueryStates(
      {
        page: parseAsInteger.withDefault(initialState.page),
        pageSize: parseAsInteger.withDefault(initialState.pageSize),
        search: parseAsString.withDefault(initialState.search),
        sortBy: parseAsString.withDefault(initialState.sortBy),
        sortOrder: parseAsString.withDefault(initialState.sortOrder),
      },
      { shallow: false }
    )

  // Client-side sorting function
  const sortData = (dataList: Artigo[], column: string, order: 'asc' | 'desc'): Artigo[] => {
    return [...dataList].sort((a, b) => {
      const aVal = a[column as keyof Artigo]
      const bVal = b[column as keyof Artigo]

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return order === 'asc' ? 1 : -1
      if (bVal == null) return order === 'asc' ? -1 : 1

      // Compare based on type
      let comparison = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal), 'pt')
      }

      return order === 'asc' ? comparison : -comparison
    })
  }

  // Client-side search filtering function
  const filterBySearch = (dataList: Artigo[], searchTerm: string): Artigo[] => {
    if (!searchTerm) return dataList
    const searchLower = searchTerm.toLowerCase()
    return dataList.filter(item => {
      return searchableColumnNames.some(colName => {
        const value = item[colName as keyof Artigo]
        return value != null && String(value).toLowerCase().includes(searchLower)
      })
    })
  }

  const sorting: SortingState = [{ id: sortBy, desc: sortOrder === 'desc' }]

  const table = useReactTable({
    data: localData,
    columns,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalCount,
    pageCount: Math.ceil(totalCount / pageSize),
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
      sorting,
    },
    onPaginationChange: (updater) => {
      startTransition(() => {
        const current = { pageIndex: page - 1, pageSize }
        const newState =
          typeof updater === 'function' ? updater(current) : updater
        setParams({
          page: newState.pageIndex + 1,
          pageSize: newState.pageSize,
        })
      })
    },
    onSortingChange: (updater) => {
      const current: SortingState = [{ id: sortBy, desc: sortOrder === 'desc' }]
      const newState =
        typeof updater === 'function' ? updater(current) : updater
      if (newState[0]) {
        const newSortBy = newState[0].id
        const newSortOrder = newState[0].desc ? 'desc' : 'asc'
        // Instant client-side sort
        setLocalData(prev => sortData(prev, newSortBy, newSortOrder as 'asc' | 'desc'))
        // Update URL in background
        startTransition(() => {
          setParams({
            sortBy: newSortBy,
            sortOrder: newSortOrder,
            page: 1,
          })
        })
      }
    },
    getCoreRowModel: getCoreRowModel(),
  })

  const handleSearchChange = (value: string) => {
    // Instant client-side filter
    const filtered = filterBySearch(originalData, value)
    const sorted = sortData(filtered, sortBy, sortOrder as 'asc' | 'desc')
    setLocalData(sorted)
    // Update URL in background
    startTransition(() => {
      setParams({ search: value || null, page: 1 })
    })
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        search={search}
        onSearchChange={handleSearchChange}
        isPending={isPending}
      />
      <div className="rounded-lg border border-slate-200 shadow-xs overflow-hidden bg-white p-2">
        <Table className="[&_thead_tr]:border-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-0">
                {headerGroup.headers.map((header, index) => (
                  <TableHead
                    key={header.id}
                    className={`text-xs font-medium text-slate-700 tracking-wide bg-slate-100/70 py-2 px-3 ${
                      index === 0 ? 'pl-4 rounded-l-md' : ''
                    } ${
                      index === headerGroup.headers.length - 1 ? 'pr-4 rounded-r-md' : ''
                    }`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="hover:bg-slate-50 border-0">
                  {columns.map((_, j) => (
                    <TableCell
                      key={`skeleton-cell-${i}-${j}`}
                      className={`py-2 px-3 ${j === 0 ? 'pl-4' : ''} ${j === columns.length - 1 ? 'pr-4' : ''}`}
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-slate-50 border-0">
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      key={cell.id}
                      className={`py-2 px-3 text-slate-700 text-sm ${
                        index === 0 ? 'pl-4' : ''
                      } ${
                        index === row.getVisibleCells().length - 1 ? 'pr-4' : ''
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="border-0">
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <PackageOpen className="h-10 w-10" />
                    <p>Nenhum produto encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} isPending={isPending} />
    </div>
  )
}

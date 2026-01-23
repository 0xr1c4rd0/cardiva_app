'use client'

import { useMemo, useTransition } from 'react'
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
import { Button } from '@/components/ui/button'
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
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="-ml-4"
            >
              {col.display_name}
              {column.getIsSorted() === 'asc' ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === 'desc' ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
              )}
            </Button>
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

  // Generate columns from config
  const columns = useMemo(() => createColumns(columnConfig), [columnConfig])

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

  const sorting: SortingState = [{ id: sortBy, desc: sortOrder === 'desc' }]

  const table = useReactTable({
    data,
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
      startTransition(() => {
        const current: SortingState = [{ id: sortBy, desc: sortOrder === 'desc' }]
        const newState =
          typeof updater === 'function' ? updater(current) : updater
        if (newState[0]) {
          setParams({
            sortBy: newState[0].id,
            sortOrder: newState[0].desc ? 'desc' : 'asc',
            page: 1,
          })
        }
      })
    },
    getCoreRowModel: getCoreRowModel(),
  })

  const handleSearchChange = (value: string) => {
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
                    className={`text-xs font-medium text-slate-700 uppercase tracking-wide bg-slate-100/70 py-2 px-3 ${
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
                    <p>No products found</p>
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

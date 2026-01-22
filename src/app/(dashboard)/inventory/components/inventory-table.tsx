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
  categories: string[]
  columnConfig: InventoryColumnConfig[]
  categoryColumnName?: string
  initialState: {
    page: number
    pageSize: number
    search: string
    sortBy: string
    sortOrder: string
    category: string | null
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
  categories,
  columnConfig,
  categoryColumnName,
  initialState,
}: InventoryTableProps) {
  const [isPending, startTransition] = useTransition()

  // Generate columns from config
  const columns = useMemo(() => createColumns(columnConfig), [columnConfig])

  const [{ page, pageSize, search, sortBy, sortOrder, category }, setParams] =
    useQueryStates(
      {
        page: parseAsInteger.withDefault(initialState.page),
        pageSize: parseAsInteger.withDefault(initialState.pageSize),
        search: parseAsString.withDefault(initialState.search),
        sortBy: parseAsString.withDefault(initialState.sortBy),
        sortOrder: parseAsString.withDefault(initialState.sortOrder),
        category: parseAsString,
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

  const handleCategoryChange = (value: string | null) => {
    startTransition(() => {
      setParams({ category: value, page: 1 })
    })
  }

  // Only show category filter if we have a category column configured
  const showCategoryFilter = !!categoryColumnName && categories.length > 0

  return (
    <div className="space-y-4">
      <TableToolbar
        search={search}
        onSearchChange={handleSearchChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        categories={showCategoryFilter ? categories : []}
        isPending={isPending}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((_, j) => (
                    <TableCell key={`skeleton-cell-${i}-${j}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
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

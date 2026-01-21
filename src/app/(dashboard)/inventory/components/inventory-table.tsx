'use client'

import { useTransition } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
} from '@tanstack/react-table'
import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { PackageOpen } from 'lucide-react'
import { columns } from './inventory-columns'
import { DataTablePagination } from './data-table-pagination'
import { TableToolbar } from './table-toolbar'
import { Artigo } from '@/lib/supabase/types'

interface InventoryTableProps {
  data: Artigo[]
  totalCount: number
  categories: string[]
  initialState: {
    page: number
    pageSize: number
    search: string
    sortBy: string
    sortOrder: string
    category: string | null
  }
}

export function InventoryTable({
  data,
  totalCount,
  categories,
  initialState,
}: InventoryTableProps) {
  const [isPending, startTransition] = useTransition()

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

  return (
    <div className="space-y-4">
      <TableToolbar
        search={search}
        onSearchChange={handleSearchChange}
        category={category}
        onCategoryChange={handleCategoryChange}
        categories={categories}
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

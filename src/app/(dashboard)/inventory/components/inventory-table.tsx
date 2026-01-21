'use client'

import { useTransition } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useQueryStates, parseAsInteger } from 'nuqs'
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
import { Artigo } from '@/lib/supabase/types'

interface InventoryTableProps {
  data: Artigo[]
  totalCount: number
  initialState: {
    page: number
    pageSize: number
  }
}

export function InventoryTable({
  data,
  totalCount,
  initialState,
}: InventoryTableProps) {
  const [isPending, startTransition] = useTransition()

  const [{ page, pageSize }, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(initialState.page),
      pageSize: parseAsInteger.withDefault(initialState.pageSize),
    },
    { shallow: false }
  )

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    rowCount: totalCount,
    pageCount: Math.ceil(totalCount / pageSize),
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
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
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
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

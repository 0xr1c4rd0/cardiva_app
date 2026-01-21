'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Artigo } from '@/lib/supabase/types'

const currencyFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
})

export const columns: ColumnDef<Artigo>[] = [
  {
    accessorKey: 'codigo',
    header: 'Code',
    enableSorting: true,
  },
  {
    accessorKey: 'nome',
    header: 'Name',
    enableSorting: true,
  },
  {
    accessorKey: 'categoria',
    header: 'Category',
    enableSorting: true,
    cell: ({ row }) => row.getValue('categoria') || '-',
  },
  {
    accessorKey: 'preco',
    header: 'Price',
    enableSorting: true,
    cell: ({ row }) => {
      const preco = row.getValue('preco') as number | null
      return preco != null ? currencyFormatter.format(preco) : '-'
    },
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    enableSorting: true,
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number | null
      return stock != null ? stock : '-'
    },
  },
]

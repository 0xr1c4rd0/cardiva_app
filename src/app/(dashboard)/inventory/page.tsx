import { createClient } from '@/lib/supabase/server'
import { searchParamsSchema } from './schema'
import { InventoryTable } from './components/inventory-table'

interface InventoryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const params = await searchParams
  const parsed = searchParamsSchema.safeParse(params)
  const { page, pageSize } = parsed.success
    ? parsed.data
    : { page: 1, pageSize: 50 }

  const supabase = await createClient()

  const { data, error, count } = await supabase
    .from('artigos')
    .select('*', { count: 'exact' })
    .order('nome', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) {
    throw new Error(`Failed to fetch inventory: ${error.message}`)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventory</h1>
          <p className="text-muted-foreground">
            Browse and manage your product catalog
          </p>
        </div>
      </div>
      <InventoryTable
        data={data ?? []}
        totalCount={count ?? 0}
        initialState={{ page, pageSize }}
      />
    </div>
  )
}

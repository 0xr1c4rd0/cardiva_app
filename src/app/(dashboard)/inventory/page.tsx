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
  const { page, pageSize, search, sortBy, sortOrder, category } = parsed.success
    ? parsed.data
    : {
        page: 1,
        pageSize: 50,
        search: '',
        sortBy: 'nome' as const,
        sortOrder: 'asc' as const,
        category: undefined,
      }

  const supabase = await createClient()

  // Build the main query
  let query = supabase.from('artigos').select('*', { count: 'exact' })

  // Apply search filter (search across multiple fields)
  if (search) {
    query = query.or(
      `nome.ilike.%${search}%,codigo.ilike.%${search}%,descricao.ilike.%${search}%`
    )
  }

  // Apply category filter
  if (category) {
    query = query.eq('categoria', category)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  query = query.range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch inventory: ${error.message}`)
  }

  // Fetch distinct categories for the filter dropdown
  const { data: categoryData } = await supabase
    .from('artigos')
    .select('categoria')
    .not('categoria', 'is', null)
    .order('categoria')

  // Extract unique categories
  const categories = [
    ...new Set(categoryData?.map((item) => item.categoria).filter(Boolean)),
  ] as string[]

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
        categories={categories}
        initialState={{
          page,
          pageSize,
          search,
          sortBy,
          sortOrder,
          category: category ?? null,
        }}
      />
    </div>
  )
}

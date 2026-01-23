import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/utils'
import { InventoryTable } from './components/inventory-table'
import { PermissionGate } from './components/permission-gate'
import { ExportButton } from './components/export-button'
import { CSVUploadButton } from './components/csv-upload-button'
import { InventoryColumnConfig } from '@/lib/supabase/types'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface InventoryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(String(params.page || '1'), 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(String(params.pageSize || '50'), 10) || 50))
  const search = String(params.search || '').slice(0, 200)
  const sortBy = String(params.sortBy || '')
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc'

  const supabase = await createClient()

  // Get user role for permission checks
  const userRole = await getUserRole()

  // Fetch column configuration
  const { data: columnConfig, error: configError } = await supabase
    .from('inventory_column_config')
    .select('*')
    .order('display_order', { ascending: true })

  if (configError) {
    console.error('Failed to fetch column config:', configError.message)
    throw new Error(
      `Failed to fetch column configuration: ${configError.message}. ` +
      `Please run the inventory_column_config migration in Supabase.`
    )
  }

  const columns = (columnConfig || []) as InventoryColumnConfig[]
  const visibleColumns = columns.filter(c => c.visible)
  const searchableColumns = columns.filter(c => c.searchable)

  // Get the first sortable column as default, or first visible column
  const defaultSortColumn = columns.find(c => c.sortable && c.visible)?.column_name ||
                            visibleColumns[0]?.column_name ||
                            'id'
  const actualSortBy = sortBy && columns.some(c => c.column_name === sortBy && c.sortable)
    ? sortBy
    : defaultSortColumn

  // Build the main query - select all columns, we'll filter in display
  let query = supabase.from('artigos').select('*', { count: 'exact' })

  // Apply search filter across searchable columns
  if (search && searchableColumns.length > 0) {
    const searchConditions = searchableColumns
      .map(col => `${col.column_name}.ilike.%${search}%`)
      .join(',')
    query = query.or(searchConditions)
  }

  // Apply sorting
  query = query.order(actualSortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  query = query.range((page - 1) * pageSize, page * pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Inventory query error:', {
      message: error.message,
      code: error.code,
    })
    throw new Error(`Failed to fetch inventory: ${error.message}`)
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventário</h1>
          <p className="text-muted-foreground">
            Consultar e gerir o catálogo de produtos
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export available to all authenticated users */}
          <ExportButton
            data={data ?? []}
            columnConfig={visibleColumns}
          />

          {/* Upload only for admin users */}
          <PermissionGate requiredRole="admin" userRole={userRole}>
            <CSVUploadButton />
          </PermissionGate>
        </div>
      </div>
      <InventoryTable
        data={data ?? []}
        totalCount={count ?? 0}
        columnConfig={visibleColumns}
        initialState={{
          page,
          pageSize,
          search,
          sortBy: actualSortBy,
          sortOrder,
        }}
      />
    </div>
  )
}

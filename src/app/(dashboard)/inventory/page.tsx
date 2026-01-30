import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/utils'
import { InventoryPageContent } from './components/inventory-page-content'
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

  // Fetch last completed upload job
  const { data: lastUploadJob } = await supabase
    .from('inventory_upload_jobs')
    .select('id, file_name, created_at, completed_at, processed_rows, user_id')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Fetch user profile if upload exists
  let lastUpload: {
    id: string
    file_name: string
    created_at: string
    completed_at: string | null
    processed_rows: number
    user_id: string
    profiles: {
      full_name: string | null
      email: string
    }
  } | null = null

  if (lastUploadJob) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', lastUploadJob.user_id)
      .single()

    if (profile) {
      lastUpload = {
        ...lastUploadJob,
        profiles: profile,
      }
    }
  }

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
    <InventoryPageContent
      data={data ?? []}
      totalCount={count ?? 0}
      columnConfig={visibleColumns}
      lastUpload={lastUpload}
      userRole={userRole}
      initialState={{
        page,
        pageSize,
        search,
        sortBy: actualSortBy,
        sortOrder,
      }}
    />
  )
}

import { createClient } from '@/lib/supabase/server'
import { RFPPageContent } from './components/rfp-page-content'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface RFPsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RFPsPage({ searchParams }: RFPsPageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(String(params.page || '1'), 10) || 1)
  const pageSize = Math.min(50, Math.max(10, parseInt(String(params.pageSize || '25'), 10) || 25))
  const search = String(params.search || '').slice(0, 200)
  const sortBy = params.sortBy === 'file_name' ? 'file_name' : 'created_at'
  const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc'

  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null // Layout will redirect
  }

  // Build query with search, sort, and pagination
  let query = supabase
    .from('rfp_upload_jobs')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)

  // Apply search filter on file_name
  if (search) {
    query = query.ilike('file_name', `%${search}%`)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  // Apply pagination
  query = query.range((page - 1) * pageSize, page * pageSize - 1)

  const { data: jobs, error, count } = await query

  if (error) {
    console.error('Failed to fetch RFP jobs:', error)
  }

  return (
    <RFPPageContent
      initialJobs={jobs ?? []}
      totalCount={count ?? 0}
      initialState={{
        page,
        pageSize,
        search,
        sortBy,
        sortOrder,
      }}
    />
  )
}

import { createClient } from '@/lib/supabase/server'
import { RFPUploadButton } from './components/rfp-upload-button'
import { RFPJobsList } from './components/rfp-jobs-list'
import { RFPProcessingCard } from './components/rfp-processing-card'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function RFPsPage() {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null // Layout will redirect
  }

  // Fetch recent RFP jobs for current user
  const { data: jobs, error } = await supabase
    .from('rfp_upload_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Failed to fetch RFP jobs:', error)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">RFP Processing</h1>
          <p className="text-muted-foreground">
            Upload and process RFP documents to match against your inventory
          </p>
        </div>

        <RFPUploadButton />
      </div>

      {/* Processing status card - shows only when active job is processing */}
      <RFPProcessingCard />

      <RFPJobsList initialJobs={jobs ?? []} />
    </div>
  )
}

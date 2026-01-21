'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getUserRole } from '@/lib/auth/utils'
import { triggerN8nWebhook } from '@/lib/n8n/webhook'

export interface UploadResult {
  success: boolean
  error?: string
  jobId?: string
}

/**
 * Create an inventory upload job and trigger n8n webhook
 * Fire-and-forget pattern: returns immediately, n8n processes async
 */
export async function triggerInventoryUpload(
  formData: FormData
): Promise<UploadResult> {
  const supabase = await createClient()

  // Check permission - only admin can upload
  const role = await getUserRole()
  if (role !== 'admin') {
    return { success: false, error: 'Unauthorized: Admin access required' }
  }

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Extract file from form data
  const file = formData.get('file') as File | null
  const rowCount = parseInt(formData.get('rowCount') as string, 10) || 0

  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  // Read file content
  let fileContent: string
  try {
    fileContent = await file.text()
  } catch {
    return { success: false, error: 'Failed to read file content' }
  }

  // Create upload job record
  const { data: job, error: jobError } = await supabase
    .from('inventory_upload_jobs')
    .insert({
      user_id: user.id,
      file_name: file.name,
      row_count: rowCount,
      status: 'pending',
    })
    .select()
    .single()

  if (jobError) {
    console.error('Failed to create upload job:', jobError)
    return {
      success: false,
      error: `Failed to create upload job: ${jobError.message}`,
    }
  }

  // Fire-and-forget: trigger n8n webhook without awaiting completion
  // The webhook will update job status when processing completes
  try {
    await triggerN8nWebhook({
      jobId: job.id,
      csvContent: fileContent,
      fileName: file.name,
      userId: user.id,
      rowCount: rowCount,
    })
  } catch (error) {
    // Log error but don't fail - job is created, n8n will retry or admin can check
    console.error('Failed to trigger n8n webhook:', error)
    // Optionally update job status to indicate webhook issue
    await supabase
      .from('inventory_upload_jobs')
      .update({
        status: 'pending',
        error_message: 'Webhook trigger failed - will retry',
      })
      .eq('id', job.id)
  }

  // Revalidate inventory page
  revalidatePath('/inventory')

  return {
    success: true,
    jobId: job.id,
  }
}

/**
 * Get upload job status
 * Can be used for polling or initial load
 */
export async function getUploadJobStatus(jobId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inventory_upload_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, job: data }
}

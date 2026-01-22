'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { triggerRFPWebhook } from '@/lib/n8n/rfp-webhook'

export interface RFPUploadResult {
  success: boolean
  error?: string
  jobId?: string
}

/**
 * Create an RFP upload job, store file in Supabase Storage, and trigger n8n webhook
 * Fire-and-forget pattern: returns immediately, n8n processes async
 */
export async function triggerRFPUpload(
  formData: FormData
): Promise<RFPUploadResult> {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Extract file from form data
  const file = formData.get('file') as File | null

  if (!file) {
    return { success: false, error: 'No file provided' }
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { success: false, error: 'Only PDF files are accepted' }
  }

  // Create upload job record first
  const { data: job, error: jobError } = await supabase
    .from('rfp_upload_jobs')
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_size: file.size,
      status: 'pending',
    })
    .select()
    .single()

  if (jobError) {
    console.error('Failed to create RFP upload job:', jobError)
    return {
      success: false,
      error: `Failed to create upload job: ${jobError.message}`,
    }
  }

  // Read file buffer once - will be used for both Storage and n8n webhook
  const fileBuffer = await file.arrayBuffer()
  const filePath = `${user.id}/${job.id}/${file.name}`

  // Upload file to Supabase Storage
  const { error: storageError } = await supabase.storage
    .from('rfp-uploads')
    .upload(filePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (storageError) {
    console.error('Failed to upload file to storage:', storageError)
    // Update job status to failed
    await supabase
      .from('rfp_upload_jobs')
      .update({
        status: 'failed',
        error_message: `Storage upload failed: ${storageError.message}`,
      })
      .eq('id', job.id)

    return {
      success: false,
      error: `Failed to store file: ${storageError.message}`,
    }
  }

  // Update job with file path
  await supabase
    .from('rfp_upload_jobs')
    .update({ file_path: filePath })
    .eq('id', job.id)

  // Create a new File from buffer for n8n webhook (original File stream was consumed)
  const fileForWebhook = new File([fileBuffer], file.name, { type: 'application/pdf' })

  // Fire-and-forget: trigger n8n webhook without awaiting completion
  // The webhook will update job status when processing completes
  try {
    await triggerRFPWebhook({
      jobId: job.id,
      attachment_0: fileForWebhook,
      fileName: file.name,
      userId: user.id,
      filePath: filePath,
    })
  } catch (error) {
    // Log error but don't fail - job is created, n8n will retry or admin can check
    console.error('Failed to trigger n8n RFP webhook:', error)
    // Optionally update job status to indicate webhook issue
    await supabase
      .from('rfp_upload_jobs')
      .update({
        status: 'pending',
        error_message: 'Webhook trigger failed - will retry',
      })
      .eq('id', job.id)
  }

  // Revalidate RFPs page
  revalidatePath('/rfps')

  return {
    success: true,
    jobId: job.id,
  }
}

/**
 * Get RFP upload job status
 * Can be used for polling or initial load
 */
export async function getRFPJobStatus(jobId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rfp_upload_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, job: data }
}

/**
 * Get recent RFP jobs for current user
 */
export async function getRecentRFPJobs(limit: number = 10) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated', jobs: [] }
  }

  const { data, error } = await supabase
    .from('rfp_upload_jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { success: false, error: error.message, jobs: [] }
  }

  return { success: true, jobs: data }
}

/**
 * Delete an RFP job and its associated file from storage
 * CASCADE will handle rfp_items and rfp_match_suggestions
 */
export async function deleteRFPJob(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get job to verify ownership and get file_path
  const { data: job, error: fetchError } = await supabase
    .from('rfp_upload_jobs')
    .select('id, user_id, file_path')
    .eq('id', jobId)
    .single()

  if (fetchError || !job) {
    return { success: false, error: 'Job not found' }
  }

  // Verify user owns this job
  if (job.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  // Delete file from storage if it exists
  if (job.file_path) {
    const { error: storageError } = await supabase.storage
      .from('rfp-uploads')
      .remove([job.file_path])

    if (storageError) {
      console.error('Failed to delete file from storage:', storageError)
      // Continue with job deletion even if storage delete fails
    }
  }

  // Delete job record (CASCADE will handle rfp_items and rfp_match_suggestions)
  const { error: deleteError } = await supabase
    .from('rfp_upload_jobs')
    .delete()
    .eq('id', jobId)

  if (deleteError) {
    console.error('Failed to delete RFP job:', deleteError)
    return { success: false, error: `Failed to delete job: ${deleteError.message}` }
  }

  // Revalidate RFPs page
  revalidatePath('/rfps')

  return { success: true }
}

/**
 * Get a signed URL for viewing/downloading an RFP file
 * URL expires after 1 hour (3600 seconds)
 */
export async function getRFPFileUrl(
  jobId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get job to verify ownership and get file_path
  const { data: job, error: fetchError } = await supabase
    .from('rfp_upload_jobs')
    .select('id, user_id, file_path')
    .eq('id', jobId)
    .single()

  if (fetchError || !job) {
    return { success: false, error: 'Job not found' }
  }

  // Verify user owns this job
  if (job.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!job.file_path) {
    return { success: false, error: 'File not found' }
  }

  // Create signed URL valid for 1 hour
  const { data: urlData, error: urlError } = await supabase.storage
    .from('rfp-uploads')
    .createSignedUrl(job.file_path, 3600)

  if (urlError || !urlData?.signedUrl) {
    console.error('Failed to create signed URL:', urlError)
    return { success: false, error: 'Failed to generate file URL' }
  }

  return { success: true, url: urlData.signedUrl }
}

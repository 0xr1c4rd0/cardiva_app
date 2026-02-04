'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { triggerRFPWebhook } from '@/lib/n8n/rfp-webhook'

/**
 * Sanitize filename for Supabase Storage
 * Removes accents, replaces spaces with underscores, removes special characters
 */
function sanitizeFilename(filename: string): string {
  // Separate extension
  const lastDot = filename.lastIndexOf('.')
  const name = lastDot > 0 ? filename.slice(0, lastDot) : filename
  const ext = lastDot > 0 ? filename.slice(lastDot) : ''

  // Normalize to decompose accents, then remove combining diacritical marks
  const normalized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Replace spaces and special characters with underscores
  const sanitized = normalized
    .replace(/\s+/g, '_') // spaces to underscores
    .replace(/[^a-zA-Z0-9_\-\.]/g, '') // remove anything that's not alphanumeric, underscore, dash, or dot
    .replace(/_+/g, '_') // collapse multiple underscores
    .replace(/^_|_$/g, '') // trim leading/trailing underscores

  return sanitized + ext.toLowerCase()
}

export interface RFPUploadResult {
  success: boolean
  error?: string
  jobId?: string
}

export interface QueueRFPResult {
  success: boolean
  error?: string
  jobId?: string
}

export interface ProcessQueuedJobResult {
  success: boolean
  error?: string
}

/**
 * Check if a file with the given name already exists
 * Returns true if duplicate exists
 */
export async function checkDuplicateFileName(
  fileName: string
): Promise<{ isDuplicate: boolean; error?: string }> {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { isDuplicate: false, error: 'Not authenticated' }
  }

  try {
    const { data, error } = await supabase
      .from('rfp_upload_jobs')
      .select('id')
      .eq('file_name', fileName)
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error checking duplicate:', error)
      return { isDuplicate: false, error: 'Error checking duplicate' }
    }

    return { isDuplicate: !!data }
  } catch (error) {
    console.error('Error checking duplicate:', error)
    return { isDuplicate: false, error: 'Error checking duplicate' }
  }
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

  // Check for duplicate file name
  const duplicateCheck = await checkDuplicateFileName(file.name)
  if (duplicateCheck.isDuplicate) {
    return {
      success: false,
      error: `O ficheiro "${file.name}" já foi carregado anteriormente. Por favor, escolha outro ficheiro.`,
    }
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
  // Sanitize filename for storage (original name is kept in DB for display)
  const sanitizedFilename = sanitizeFilename(file.name)
  const filePath = `${user.id}/${job.id}/${sanitizedFilename}`

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
    .select('id, file_name, status, error_message, created_at, completed_at')
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
    .select('id, file_name, status, error_message, created_at, completed_at')
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

  // Get user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Check if job was uploaded by automation (Gmail bot)
  const { data: jobOwnerProfile } = job.user_id
    ? await supabase
        .from('profiles')
        .select('role')
        .eq('id', job.user_id)
        .single()
    : { data: null }

  const isAdmin = profile?.role === 'admin'
  const isOwner = job.user_id === user.id
  const isAutomationJob = jobOwnerProfile?.role === 'automation'

  // Allow deletion if:
  // - User owns the job
  // - User is admin
  // - Job was uploaded by automation (Gmail bot)
  if (!isOwner && !isAdmin && !isAutomationJob) {
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
 * Compute review status for a single completed job
 * Returns: 'por_rever' | 'revisto' | 'confirmado' | null
 */
export async function getJobReviewStatus(
  jobId: string
): Promise<{ success: boolean; reviewStatus: 'por_rever' | 'revisto' | 'confirmado' | null; error?: string }> {
  const supabase = await createClient()

  // Get job to check if completed and confirmed
  const { data: job, error: jobError } = await supabase
    .from('rfp_upload_jobs')
    .select('id, status, confirmed_at')
    .eq('id', jobId)
    .single()

  if (jobError || !job) {
    return { success: false, reviewStatus: null, error: 'Job not found' }
  }

  // Not completed yet
  if (job.status !== 'completed') {
    return { success: true, reviewStatus: null }
  }

  // Already confirmed
  if (job.confirmed_at) {
    return { success: true, reviewStatus: 'confirmado' }
  }

  // Check if job has pending items needing decision
  const { data: pendingItems } = await supabase
    .from('rfp_items')
    .select(`
      id,
      review_status,
      rfp_match_suggestions!rfp_match_suggestions_rfp_item_id_fkey (
        status,
        similarity_score
      )
    `)
    .eq('job_id', jobId)
    .eq('review_status', 'pending')

  // Check if any item needs human decision
  let needsReview = false
  for (const item of pendingItems ?? []) {
    const suggestions = item.rfp_match_suggestions as Array<{
      status: string
      similarity_score: number
    }>

    if (!suggestions || suggestions.length === 0) continue

    const hasPendingSuggestion = suggestions.some(s => s.status === 'pending')
    const hasExactMatch = suggestions.some(s => s.similarity_score >= 0.9999)

    if (hasPendingSuggestion && !hasExactMatch) {
      needsReview = true
      break
    }
  }

  return {
    success: true,
    reviewStatus: needsReview ? 'por_rever' : 'revisto'
  }
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

  // Get user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Check if job was uploaded by automation (Gmail bot)
  const { data: jobOwnerProfile } = job.user_id
    ? await supabase
        .from('profiles')
        .select('role')
        .eq('id', job.user_id)
        .single()
    : { data: null }

  const isAdmin = profile?.role === 'admin'
  const isOwner = job.user_id === user.id
  const isAutomationJob = jobOwnerProfile?.role === 'automation'

  // Allow access if:
  // - User owns the job
  // - User is admin
  // - Job was uploaded by automation (Gmail bot)
  if (!isOwner && !isAdmin && !isAutomationJob) {
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

/**
 * Queue an RFP file for upload - stores file in DB and storage immediately
 * Returns jobId that can be used later to trigger processing
 * This allows queued files to survive page refresh
 */
export async function queueRFPFile(
  formData: FormData
): Promise<QueueRFPResult> {
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

  // Check for duplicate file name
  const duplicateCheck = await checkDuplicateFileName(file.name)
  if (duplicateCheck.isDuplicate) {
    return {
      success: false,
      error: `O ficheiro "${file.name}" já foi carregado anteriormente.`,
    }
  }

  // Create upload job record with status='queued'
  const { data: job, error: jobError } = await supabase
    .from('rfp_upload_jobs')
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_size: file.size,
      status: 'queued',
    })
    .select()
    .single()

  if (jobError) {
    console.error('Failed to create queued RFP job:', jobError)
    return {
      success: false,
      error: `Failed to create upload job: ${jobError.message}`,
    }
  }

  // Read file buffer and upload to storage
  const fileBuffer = await file.arrayBuffer()
  const sanitizedFilename = sanitizeFilename(file.name)
  const filePath = `${user.id}/${job.id}/${sanitizedFilename}`

  const { error: storageError } = await supabase.storage
    .from('rfp-uploads')
    .upload(filePath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (storageError) {
    console.error('Failed to upload queued file to storage:', storageError)
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

  // Revalidate RFPs page
  revalidatePath('/rfps')

  return {
    success: true,
    jobId: job.id,
  }
}

/**
 * Process a queued job - triggers n8n webhook for a job that's already in storage
 * Updates status from 'queued' to 'pending'
 */
export async function processQueuedJob(
  jobId: string
): Promise<ProcessQueuedJobResult> {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Fetch the queued job
  const { data: job, error: fetchError } = await supabase
    .from('rfp_upload_jobs')
    .select('id, user_id, file_name, file_path, status')
    .eq('id', jobId)
    .single()

  if (fetchError || !job) {
    return { success: false, error: 'Job not found' }
  }

  // Verify job is in queued status
  if (job.status !== 'queued') {
    return { success: false, error: `Job is not queued (status: ${job.status})` }
  }

  // Verify file exists in storage
  if (!job.file_path) {
    return { success: false, error: 'Job has no file path' }
  }

  // Get signed URL for the file
  const { data: urlData, error: urlError } = await supabase.storage
    .from('rfp-uploads')
    .createSignedUrl(job.file_path, 3600)

  if (urlError || !urlData?.signedUrl) {
    console.error('Failed to create signed URL for queued job:', urlError)
    return { success: false, error: 'Failed to get file URL' }
  }

  // Download the file from storage to send to n8n
  const response = await fetch(urlData.signedUrl)
  if (!response.ok) {
    return { success: false, error: 'Failed to download file from storage' }
  }

  const fileBuffer = await response.arrayBuffer()
  const fileForWebhook = new File([fileBuffer], job.file_name, { type: 'application/pdf' })

  // Update status to 'pending' before triggering webhook
  const { error: updateError } = await supabase
    .from('rfp_upload_jobs')
    .update({ status: 'pending' })
    .eq('id', jobId)

  if (updateError) {
    console.error('Failed to update job status to pending:', updateError)
    return { success: false, error: 'Failed to update job status' }
  }

  // Trigger n8n webhook
  try {
    await triggerRFPWebhook({
      jobId: job.id,
      attachment_0: fileForWebhook,
      fileName: job.file_name,
      userId: job.user_id,
      filePath: job.file_path,
    })
  } catch (error) {
    console.error('Failed to trigger n8n webhook for queued job:', error)
    // Keep status as pending - webhook can retry
    await supabase
      .from('rfp_upload_jobs')
      .update({
        error_message: 'Webhook trigger failed - will retry',
      })
      .eq('id', jobId)
  }

  // Revalidate RFPs page
  revalidatePath('/rfps')

  return { success: true }
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { triggerExportEmailWebhook, type ExportEmailPayload } from '@/lib/n8n/export-webhook'

interface ExportEmailResult {
  success: boolean
  error?: string
}

interface SendExportEmailParams {
  jobId: string
  recipientEmail: string
  fileName: string
  rfpFileName: string  // Original RFP filename for reference
  excelBuffer: number[]  // ArrayBuffer serialized as number array for server action transport
  summary: {
    totalItems: number
    confirmedCount: number
    rejectedCount: number
    manualCount: number
    noMatchCount: number
  }
}

/**
 * Send export email via n8n webhook
 * Fire-and-forget pattern - returns immediately after triggering webhook
 */
export async function sendExportEmail(
  params: SendExportEmailParams
): Promise<ExportEmailResult> {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify job exists (all authenticated users can access all jobs per 10.1-04)
    const { data: job, error: jobError } = await supabase
      .from('rfp_upload_jobs')
      .select('id')
      .eq('id', params.jobId)
      .single()

    if (jobError || !job) {
      return { success: false, error: 'Job not found' }
    }

    // Validate email format (basic check)
    if (!params.recipientEmail || !params.recipientEmail.includes('@')) {
      return { success: false, error: 'Invalid email address' }
    }

    // Convert number array back to ArrayBuffer for webhook
    const buffer = new Uint8Array(params.excelBuffer).buffer

    // Build webhook payload
    const payload: ExportEmailPayload = {
      jobId: params.jobId,
      userId: user.id,
      recipientEmail: params.recipientEmail,
      fileName: params.fileName,
      rfpFileName: params.rfpFileName,
      excelBuffer: buffer,
      summary: params.summary,
    }

    // Trigger webhook (fire-and-forget)
    await triggerExportEmailWebhook(payload)

    return { success: true }
  } catch (error) {
    console.error('sendExportEmail error:', error)

    // Check for specific configuration error
    if (error instanceof Error && error.message.includes('not configured')) {
      return {
        success: false,
        error: 'Email service not configured. Please contact administrator.',
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

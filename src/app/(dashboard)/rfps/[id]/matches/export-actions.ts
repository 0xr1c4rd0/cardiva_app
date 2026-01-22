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
  excelBase64: string
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

    // Verify job ownership
    const { data: job, error: jobError } = await supabase
      .from('rfp_upload_jobs')
      .select('id')
      .eq('id', params.jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return { success: false, error: 'Job not found or access denied' }
    }

    // Validate email format (basic check)
    if (!params.recipientEmail || !params.recipientEmail.includes('@')) {
      return { success: false, error: 'Invalid email address' }
    }

    // Build webhook payload
    const payload: ExportEmailPayload = {
      jobId: params.jobId,
      recipientEmail: params.recipientEmail,
      fileName: params.fileName,
      excelBase64: params.excelBase64,
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

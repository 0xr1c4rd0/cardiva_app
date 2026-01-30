import { triggerWebhookWithRetry, buildWebhookHeaders, WebhookRetryError } from './webhook-utils'

export interface RFPWebhookPayload {
  jobId: string
  attachment_0: File
  fileName: string
  userId: string
  filePath: string
}

/**
 * Trigger n8n RFP webhook with retry logic
 * Sends PDF file as binary data via multipart/form-data
 * Retries up to 3 times with exponential backoff on transient failures
 */
export async function triggerRFPWebhook(payload: RFPWebhookPayload): Promise<void> {
  const webhookUrl = process.env.N8N_RFP_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('N8N_RFP_WEBHOOK_URL not configured')
    throw new Error('N8N_RFP_WEBHOOK_URL not configured')
  }

  // Create FormData with file as binary and metadata as fields
  const formData = new FormData()
  formData.append('attachment_0', payload.attachment_0, payload.fileName)
  formData.append('jobId', payload.jobId)
  formData.append('userId', payload.userId)
  formData.append('filePath', payload.filePath)
  formData.append('timestamp', new Date().toISOString())

  try {
    await triggerWebhookWithRetry(webhookUrl, formData, buildWebhookHeaders())
  } catch (error) {
    if (error instanceof WebhookRetryError) {
      console.error(
        `n8n RFP webhook failed after ${error.attempts} attempts:`,
        error.lastError?.message
      )
    } else {
      console.error('n8n RFP webhook request failed:', error)
    }
    throw error
  }
}

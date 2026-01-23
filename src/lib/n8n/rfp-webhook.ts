export interface RFPWebhookPayload {
  jobId: string
  attachment_0: File
  fileName: string
  userId: string
  filePath: string
}

/**
 * Trigger n8n RFP webhook with fire-and-forget pattern
 * Sends PDF file as binary data via multipart/form-data
 * Does NOT await response - n8n will update job status when complete
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

  // Fire-and-forget: don't await the response
  // n8n webhook is configured to respond "immediately"
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      // Don't set Content-Type - fetch will set it automatically with boundary for FormData
      ...(process.env.N8N_WEBHOOK_SECRET && {
        'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET,
      }),
    },
    body: formData,
  }).catch((error) => {
    // Log but don't throw - fire-and-forget
    console.error('n8n RFP webhook request failed:', error)
  })
}

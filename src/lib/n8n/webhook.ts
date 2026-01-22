export interface WebhookPayload {
  jobId: string
  attachment_0: File
  fileName: string
  userId: string
  rowCount: number
}

/**
 * Trigger n8n webhook with fire-and-forget pattern
 * Sends CSV file as binary data via multipart/form-data
 * Does NOT await response - n8n will update job status when complete
 */
export async function triggerN8nWebhook(payload: WebhookPayload): Promise<void> {
  const webhookUrl = process.env.N8N_INVENTORY_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('N8N_INVENTORY_WEBHOOK_URL not configured')
    throw new Error('N8N_INVENTORY_WEBHOOK_URL not configured')
  }

  // Create FormData with file as binary and metadata as fields
  const formData = new FormData()
  formData.append('attachment_0', payload.attachment_0, payload.fileName)
  formData.append('jobId', payload.jobId)
  formData.append('userId', payload.userId)
  formData.append('rowCount', String(payload.rowCount))
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
    console.error('n8n webhook request failed:', error)
  })
}

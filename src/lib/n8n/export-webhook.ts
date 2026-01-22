/**
 * Payload for export email webhook
 */
export interface ExportEmailPayload {
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
 * Trigger n8n export email webhook with fire-and-forget pattern
 * Sends Excel file as base64 encoded data
 * Does NOT await response - n8n will send email asynchronously
 */
export async function triggerExportEmailWebhook(payload: ExportEmailPayload): Promise<void> {
  const webhookUrl = process.env.N8N_EXPORT_EMAIL_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('N8N_EXPORT_EMAIL_WEBHOOK_URL not configured')
    throw new Error('N8N_EXPORT_EMAIL_WEBHOOK_URL not configured')
  }

  // Fire-and-forget: don't await the full response
  // n8n webhook is configured to respond "immediately"
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(process.env.N8N_WEBHOOK_SECRET && {
        'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET,
      }),
    },
    body: JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString(),
    }),
  }).catch((error) => {
    // Log but don't throw - fire-and-forget
    console.error('n8n export email webhook request failed:', error)
  })
}

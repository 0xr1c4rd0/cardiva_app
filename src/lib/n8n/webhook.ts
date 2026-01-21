export interface WebhookPayload {
  jobId: string
  csvContent: string
  fileName: string
  userId: string
  rowCount: number
}

/**
 * Trigger n8n webhook with fire-and-forget pattern
 * Does NOT await response - n8n will update job status when complete
 */
export async function triggerN8nWebhook(payload: WebhookPayload): Promise<void> {
  const webhookUrl = process.env.N8N_INVENTORY_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('N8N_INVENTORY_WEBHOOK_URL not configured')
    throw new Error('N8N_INVENTORY_WEBHOOK_URL not configured')
  }

  // Fire-and-forget: don't await the response
  // n8n webhook is configured to respond "immediately"
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add authentication header if n8n webhook requires it
      ...(process.env.N8N_WEBHOOK_SECRET && {
        'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET,
      }),
    },
    body: JSON.stringify({
      jobId: payload.jobId,
      csvContent: payload.csvContent,
      fileName: payload.fileName,
      userId: payload.userId,
      rowCount: payload.rowCount,
      timestamp: new Date().toISOString(),
    }),
  }).catch((error) => {
    // Log but don't throw - fire-and-forget
    console.error('n8n webhook request failed:', error)
  })
}

/**
 * Payload for export email webhook (metadata only, file sent as binary)
 */
export interface ExportEmailPayload {
  jobId: string
  userId: string
  recipientEmail: string
  fileName: string
  rfpFileName: string  // Original RFP filename for reference
  excelBuffer: ArrayBuffer
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
 * Sends Excel file as binary via FormData (more efficient than base64)
 * Does NOT await response - n8n will send email asynchronously
 */
export async function triggerExportEmailWebhook(payload: ExportEmailPayload): Promise<void> {
  const webhookUrl = process.env.N8N_EXPORT_EMAIL_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('N8N_EXPORT_EMAIL_WEBHOOK_URL not configured')
    throw new Error('N8N_EXPORT_EMAIL_WEBHOOK_URL not configured')
  }

  // Build FormData with binary file and metadata
  const formData = new FormData()
  formData.append('jobId', payload.jobId)
  formData.append('userId', payload.userId)
  formData.append('recipientEmail', payload.recipientEmail)
  formData.append('fileName', payload.fileName)
  formData.append('rfpFileName', payload.rfpFileName)
  formData.append('summary', JSON.stringify(payload.summary))
  formData.append('timestamp', new Date().toISOString())

  // Append Excel file as binary blob
  const blob = new Blob([payload.excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  formData.append('file', blob, payload.fileName)

  // Fire-and-forget: don't await the full response
  // n8n webhook is configured to respond "immediately"
  fetch(webhookUrl, {
    method: 'POST',
    headers: {
      ...(process.env.N8N_WEBHOOK_SECRET && {
        'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET,
      }),
    },
    body: formData,
  }).catch((error) => {
    // Log but don't throw - fire-and-forget
    console.error('n8n export email webhook request failed:', error)
  })
}

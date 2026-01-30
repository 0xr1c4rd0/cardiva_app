# n8n Integration Documentation

> **Read this when**: Working with n8n webhooks, RFP processing, inventory updates, or email exports.

---

## Overview

Cardiva delegates heavy processing to n8n workflows:
- PDF text extraction
- OCR for scanned documents
- AI semantic matching against 20k+ inventory
- Email report generation

The Next.js app handles orchestration and UI.

---

## Webhooks

### Environment Variables

```bash
N8N_RFP_WEBHOOK_URL             # Triggers RFP processing
N8N_INVENTORY_WEBHOOK_URL       # Triggers inventory updates
N8N_EXPORT_EMAIL_WEBHOOK_URL    # Triggers email exports
N8N_WEBHOOK_SECRET              # Optional auth header
```

### Authentication

All webhook calls should include the secret header:

```typescript
headers: {
  'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET
}
```

---

## RFP Processing Webhook

### Trigger

```typescript
const formData = new FormData();
formData.append('file', pdfFile);           // Binary PDF
formData.append('job_id', job.id);          // UUID from rfp_upload_jobs
formData.append('user_id', userId);         // User who uploaded

const response = await fetch(process.env.N8N_RFP_WEBHOOK_URL, {
  method: 'POST',
  body: formData,
  headers: {
    'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET
  }
});
```

### n8n Workflow Steps

1. **Receive PDF** - Webhook receives FormData with binary file
2. **Extract Text** - PDF parsing, OCR if scanned
3. **Parse Items** - Identify line items (product, quantity, unit)
4. **AI Matching** - Semantic search against `artigos` table
5. **Store Results** - Insert into `rfp_items` and `rfp_match_suggestions`
6. **Update Status** - Set `rfp_upload_jobs.status` to `completed` or `failed`

### Expected Database Writes

**rfp_items:**
```sql
INSERT INTO rfp_items (job_id, line_number, description, quantity, unit)
VALUES ($job_id, 1, 'Paracetamol 500mg', 1000, 'unidades');
```

**rfp_match_suggestions:**
```sql
INSERT INTO rfp_match_suggestions (rfp_item_id, artigo_id, confidence, match_reason)
VALUES ($item_id, $artigo_id, 0.9523, 'Exact product name match');
```

### Status Updates

```sql
-- On success
UPDATE rfp_upload_jobs SET status = 'completed', completed_at = NOW() WHERE id = $job_id;

-- On failure
UPDATE rfp_upload_jobs SET status = 'failed', error_message = $error WHERE id = $job_id;
```

---

## Inventory Webhook

### Trigger

```typescript
const formData = new FormData();
formData.append('file', csvFile);           // CSV file
formData.append('user_id', userId);

const response = await fetch(process.env.N8N_INVENTORY_WEBHOOK_URL, {
  method: 'POST',
  body: formData,
  headers: {
    'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET
  }
});
```

### CSV Format

Expected columns (Portuguese headers):
```csv
Código,Designação,Preço,Unidade,Família
ABC123,Paracetamol 500mg,2.50,unidades,Analgésicos
```

### Processing

1. Parse CSV (UTF-8, fallback ISO-8859-1)
2. Validate required fields
3. Upsert into `artigos` table
4. Update vector embeddings for semantic search

---

## Export Email Webhook

### Trigger

```typescript
const response = await fetch(process.env.N8N_EXPORT_EMAIL_WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET
  },
  body: JSON.stringify({
    job_id: jobId,
    recipient_email: userEmail,
    export_format: 'xlsx'  // or 'csv'
  })
});
```

### Processing

1. Fetch all matches for job
2. Generate spreadsheet with results
3. Send email with attachment

---

## Error Handling

### Webhook Timeout

n8n webhooks should respond quickly. For long processing:

1. n8n immediately returns `{ received: true }`
2. Processing continues asynchronously
3. Status updated via Supabase when complete

### Retry Logic

If webhook fails:
1. Server Action should catch error
2. Set job status to `failed` with error message
3. User can retry via UI

```typescript
try {
  const response = await fetch(webhookUrl, { ... });
  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`);
  }
} catch (error) {
  await supabase
    .from('rfp_upload_jobs')
    .update({ 
      status: 'failed', 
      error_message: error.message 
    })
    .eq('id', jobId);
}
```

---

## Realtime Updates

The frontend subscribes to job status changes:

```typescript
const channel = supabase
  .channel('job-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'rfp_upload_jobs',
    filter: `id=eq.${jobId}`
  }, (payload) => {
    const { status, error_message } = payload.new;
    
    if (status === 'completed') {
      // Refresh matches
      refetchMatches();
    } else if (status === 'failed') {
      // Show error
      toast.error(error_message);
    }
  })
  .subscribe();
```

---

## Testing Webhooks

### Local Development

Use n8n's test webhook URLs or mock the endpoints:

```typescript
// In development, skip actual webhook call
if (process.env.NODE_ENV === 'development' && !process.env.N8N_RFP_WEBHOOK_URL) {
  console.log('Skipping webhook in development');
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  // Update status directly
  await supabase
    .from('rfp_upload_jobs')
    .update({ status: 'completed' })
    .eq('id', jobId);
  return;
}
```

### Webhook Debugging

1. Check n8n execution logs
2. Verify FormData reaches n8n correctly
3. Check Supabase for status updates
4. Monitor Realtime subscription in browser DevTools

---

## Performance Considerations

### Large PDFs

- Set adequate timeout on Server Action
- Consider chunking very large files
- n8n should stream processing, not load entire file in memory

### Batch Inventory Updates

For large CSV imports (>10k rows):
- Process in batches of 500-1000
- Use upsert to avoid duplicates
- Consider background job queue for very large imports

### Rate Limiting

If hitting rate limits:
- Implement exponential backoff
- Queue requests in development
- Consider n8n's built-in rate limiting

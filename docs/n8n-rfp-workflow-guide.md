# n8n RFP Processing Workflow Guide

## Overview

When an RFP PDF is uploaded, your n8n workflow receives:
- `attachment_0` - Binary PDF file
- `jobId` - UUID to track this job
- `userId` - User who uploaded
- `filePath` - Supabase Storage path
- `timestamp` - Upload time

## Workflow Steps

### Step 1: Update Status to "processing"

**Supabase Node** (Update Row)
```
Table: rfp_upload_jobs
Filter: id = {{ $json.body.jobId }}
Fields to Update:
  - status: processing
```

### Step 2: Extract PDF Content

Use your AI/PDF extraction logic to parse the RFP and identify items.

### Step 3: Match Items Against Inventory

For each extracted item, query your inventory (artigos table) and use AI to find matches with confidence scores.

### Step 4: Save Results to Database

**Code Node - Prepare Items for Insert:**
```javascript
// Example: Your AI returned extracted items with matches
const jobId = $('Webhook').first().json.body.jobId;

// Example structure from your AI processing
const extractedItems = $('AI Processing Node').first().json.items;

// Prepare items for database insert
const rfpItems = extractedItems.map((item, index) => ({
  job_id: jobId,
  item_number: index + 1,
  description: item.description,
  quantity: item.quantity || null,
  unit: item.unit || null,
  specifications: item.specs ? JSON.stringify(item.specs) : null,
  review_status: 'pending'
}));

return rfpItems.map(item => ({ json: item }));
```

**Supabase Node - Insert RFP Items:**
```
Operation: Insert
Table: rfp_items
```

**Code Node - Prepare Match Suggestions:**
```javascript
// After inserting items, you have their IDs
const insertedItems = $('Insert RFP Items').all();
const extractedItems = $('AI Processing Node').first().json.items;

const allSuggestions = [];

insertedItems.forEach((insertedItem, index) => {
  const itemId = insertedItem.json.id;
  const matches = extractedItems[index].matches || [];

  matches.forEach((match, rank) => {
    allSuggestions.push({
      rfp_item_id: itemId,
      artigo_id: match.artigo_id,
      artigo_code: match.code,
      artigo_name: match.name,
      confidence_score: match.confidence,  // e.g., 0.9523
      match_reason: match.reason,
      rank: rank + 1
    });
  });
});

return allSuggestions.map(s => ({ json: s }));
```

**Supabase Node - Insert Match Suggestions:**
```
Operation: Insert
Table: rfp_match_suggestions
```

### Step 5: Update Job Status to "completed"

**Code Node - Prepare Final Status:**
```javascript
const jobId = $('Webhook').first().json.body.jobId;
const itemCount = $('Insert RFP Items').all().length;

return [{
  json: {
    id: jobId,
    status: 'completed',
    completed_at: new Date().toISOString(),
    error_message: null,
    // Optional: store item count for reference
    processed_items: itemCount
  }
}];
```

**Supabase Node - Update Job:**
```
Operation: Update
Table: rfp_upload_jobs
Filter: id = {{ $json.id }}
Fields: status, completed_at, error_message
```

## Error Handling

If processing fails at any point:

```javascript
const jobId = $('Webhook').first().json.body?.jobId;
const errorMessage = $input.first().json.error || 'Unknown error during processing';

return [{
  json: {
    id: jobId,
    status: 'failed',
    error_message: errorMessage
  }
}];
```

Then update `rfp_upload_jobs` with the error.

## Database Schema Reference

### rfp_upload_jobs (existing)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Job ID (from webhook) |
| status | TEXT | pending → processing → completed/failed |
| error_message | TEXT | Error details if failed |
| completed_at | TIMESTAMPTZ | When processing finished |

### rfp_items (new)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Auto-generated |
| job_id | UUID | Links to rfp_upload_jobs |
| item_number | INTEGER | Line number in RFP |
| description | TEXT | Item description from PDF |
| quantity | INTEGER | Requested quantity |
| unit | TEXT | Unit of measure |
| specifications | JSONB | Additional extracted data |
| review_status | TEXT | pending/accepted/rejected/manual |
| selected_match_id | UUID | The accepted match |

### rfp_match_suggestions (new)
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Auto-generated |
| rfp_item_id | UUID | Links to rfp_items |
| artigo_id | UUID | Links to artigos (inventory) |
| artigo_code | TEXT | Cached product code |
| artigo_name | TEXT | Cached product name |
| confidence_score | DECIMAL | 0.0000 to 1.0000 |
| match_reason | TEXT | AI explanation |
| rank | INTEGER | 1 = best match |

## Example: Complete Workflow Structure

```
1. Webhook (receives PDF)
   ↓
2. Supabase: Update job status → "processing"
   ↓
3. PDF Extraction (your logic)
   ↓
4. AI Matching (your logic)
   ↓
5. Code: Prepare rfp_items
   ↓
6. Supabase: Insert rfp_items
   ↓
7. Code: Prepare match suggestions
   ↓
8. Supabase: Insert match suggestions
   ↓
9. Supabase: Update job status → "completed"
```

## Frontend Display

After processing, the frontend will query:

```sql
-- Get all items for a job with their matches
SELECT
  i.*,
  (
    SELECT json_agg(s ORDER BY s.rank)
    FROM rfp_match_suggestions s
    WHERE s.rfp_item_id = i.id
  ) as suggestions
FROM rfp_items i
WHERE i.job_id = 'your-job-id'
ORDER BY i.item_number;
```

The Supabase Realtime subscription on `rfp_upload_jobs` will notify the frontend when status changes to "completed", then it can fetch and display the results.

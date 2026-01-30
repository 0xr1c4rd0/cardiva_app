# Architecture Documentation

> **Read this when**: Understanding codebase structure, working with routes, database, or data flow.

---

## Route Groups

```
app/
├── (auth)/              # Public auth pages
│   ├── login/
│   ├── register/
│   └── reset-password/
├── (dashboard)/         # Protected pages (auth + admin approval required)
│   ├── admin/users/     # Admin user management
│   ├── inventory/       # Product inventory (CSV upload/export)
│   ├── rfps/            # Core RFP processing
│   └── rfps/[id]/matches/  # Match review interface
```

---

## Key Patterns

### Server vs Client Components

- **Server Components**: Data-fetching, auth checks, initial page render
- **Client Components**: Interactive elements with `"use client"` directive
- Dashboard layout checks auth server-side before rendering

### Supabase Clients

| File | Use Case |
|------|----------|
| `lib/supabase/server.ts` | Server Components, Server Actions (async, cookies) |
| `lib/supabase/browser.ts` | Client Components (singleton pattern) |

**Never import the wrong client for your context.**

---

## Database Schema

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | Users | `approved_at` (null = pending approval) |
| `artigos` | Inventory products (~20k) | Product details, pricing |
| `rfp_upload_jobs` | Job tracking | `status`: pending/processing/completed/failed |
| `rfp_items` | Extracted line items | Parsed from RFP PDFs |
| `rfp_match_suggestions` | AI matches | `confidence`: 0.0000-1.0000 (4 decimals) |

### Auth Flow

1. User registers → `profiles` row created with `approved_at = null`
2. Admin approves via `/admin/users` → sets `approved_at` timestamp
3. User can now access dashboard routes

---

## RFP Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    RFP UPLOAD FLOW                          │
└─────────────────────────────────────────────────────────────┘

1. User uploads PDF
   └─► Creates `rfp_upload_jobs` row (status: pending)

2. Server Action triggers n8n webhook
   └─► FormData with binary PDF sent to N8N_RFP_WEBHOOK_URL

3. n8n processes (external)
   ├─► PDF text extraction
   ├─► OCR if needed
   ├─► AI semantic matching against inventory
   └─► Inserts results into `rfp_items` + `rfp_match_suggestions`

4. n8n updates job status
   └─► Sets status to `completed` (or `failed`)

5. Frontend receives update
   └─► Realtime subscription auto-refreshes UI
```

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL        # Public Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Public anon key

# n8n Webhooks
N8N_RFP_WEBHOOK_URL             # Triggers RFP processing
N8N_INVENTORY_WEBHOOK_URL       # Triggers inventory updates
N8N_EXPORT_EMAIL_WEBHOOK_URL    # Triggers email exports
N8N_WEBHOOK_SECRET              # Optional auth header
```

---

## Data Flow Patterns

### Upload Pattern (Server Action)
```typescript
// 1. Create job record
const { data: job } = await supabase
  .from('rfp_upload_jobs')
  .insert({ status: 'pending', user_id })
  .select()
  .single();

// 2. Trigger n8n
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('job_id', job.id);

await fetch(process.env.N8N_RFP_WEBHOOK_URL, {
  method: 'POST',
  body: formData,
  headers: { 'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET }
});
```

### Realtime Subscription Pattern (Client)
```typescript
useEffect(() => {
  const channel = supabase
    .channel('job-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'rfp_upload_jobs',
      filter: `id=eq.${jobId}`
    }, (payload) => {
      if (payload.new.status === 'completed') {
        refetchMatches();
      }
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [jobId]);
```

---

## Migration Requirements

**All schema changes require migration files in `supabase/migrations/`.**

Never modify the database schema directly. Create a timestamped migration:

```bash
# Create migration
supabase migration new add_column_to_artigos

# Apply locally
supabase db reset

# Push to production
supabase db push
```

# Cardiva Project Patterns

This skill contains project-specific patterns and conventions for the Cardiva RFP matching application.

## Component Patterns

### Server Component (Data Fetching)

```typescript
// app/(dashboard)/rfps/page.tsx
import { createClient } from '@/lib/supabase/server'
import { RFPList } from './components/rfp-list'

export default async function RFPsPage() {
  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from('rfp_upload_jobs')
    .select('*, profiles!user_id(full_name)')
    .order('created_at', { ascending: false })

  return <RFPList jobs={jobs ?? []} />
}
```

### Client Component (Interactive)

```typescript
// components/match-card.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { updateMatchStatus } from '@/app/actions/matches'

interface MatchCardProps {
  match: RFPMatchSuggestion
}

export function MatchCard({ match }: MatchCardProps) {
  const [status, setStatus] = useState(match.status)

  async function handleAccept() {
    const result = await updateMatchStatus(match.id, 'accepted')
    if (result.success) {
      setStatus('accepted')
    }
  }

  return (
    <div className="rounded-lg border p-4">
      {/* Card content */}
      <Button onClick={handleAccept}>Aceitar</Button>
    </div>
  )
}
```

### Server Action

```typescript
// app/actions/matches.ts
"use server"

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const updateStatusSchema = z.object({
  matchId: z.string().uuid(),
  status: z.enum(['accepted', 'rejected', 'pending'])
})

export async function updateMatchStatus(matchId: string, status: string) {
  try {
    const validated = updateStatusSchema.parse({ matchId, status })
    const supabase = await createClient()

    const { error } = await supabase
      .from('rfp_match_suggestions')
      .update({ status: validated.status })
      .eq('id', validated.matchId)

    if (error) throw error

    revalidatePath('/rfps')
    return { success: true }
  } catch (error) {
    console.error('Failed to update match:', error)
    return { success: false, error: 'Falha ao atualizar correspondência' }
  }
}
```

## Database Patterns

### Query with Relations

```typescript
// Get matches with item and article details
const { data } = await supabase
  .from('rfp_match_suggestions')
  .select(`
    *,
    rfp_items (
      id,
      description,
      quantity
    ),
    artigos (
      codigo,
      descricao,
      unidade
    )
  `)
  .eq('job_id', jobId)
  .order('confidence', { ascending: false })
```

### Realtime Subscription

```typescript
"use client"

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/browser'

export function useJobStatus(jobId: string, onStatusChange: (status: string) => void) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rfp_upload_jobs',
          filter: `id=eq.${jobId}`
        },
        (payload) => {
          onStatusChange(payload.new.status)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [jobId, onStatusChange])
}
```

## UI Patterns

### Portuguese Labels

All user-facing text must be in Portuguese (Portugal):

```typescript
const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  processing: 'A processar',
  completed: 'Concluído',
  failed: 'Falhou',
  accepted: 'Aceite',
  rejected: 'Rejeitado'
}
```

### Confidence Display

```typescript
// Always show 2 decimal places as percentage
function formatConfidence(score: number): string {
  return `${(score * 100).toFixed(2)}%`
}

// Color coding
function getConfidenceColor(score: number): string {
  if (score >= 0.9) return 'text-green-600'
  if (score >= 0.7) return 'text-yellow-600'
  return 'text-red-600'
}
```

### Loading States

```typescript
import { Skeleton } from '@/components/ui/skeleton'

function MatchCardSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
```

## Error Handling Pattern

```typescript
interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// Usage in Server Action
export async function someAction(): Promise<ActionResult<DataType>> {
  try {
    // ... operation
    return { success: true, data: result }
  } catch (error) {
    console.error('Action failed:', error)
    return { success: false, error: 'Mensagem amigável em português' }
  }
}

// Usage in Client Component
const result = await someAction()
if (!result.success) {
  toast.error(result.error)
  return
}
// Use result.data
```

## n8n Webhook Pattern

```typescript
// Trigger n8n workflow
async function triggerN8nWorkflow(webhookUrl: string, payload: FormData) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET ?? ''
    },
    body: payload
  })

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`)
  }

  return response.json()
}
```

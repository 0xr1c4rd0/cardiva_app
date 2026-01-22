# Phase 6: Processing Status - Research

**Researched:** 2026-01-22
**Domain:** Real-time status updates, toast notifications, progress indicators, Supabase Realtime
**Confidence:** HIGH

## Summary

Phase 6 implements real-time processing status tracking for RFP uploads during the 3-5 minute AI processing wait. The research reveals that most of the infrastructure is already in place from Phase 5:

- **Supabase Realtime subscription** is already implemented in `use-rfp-upload-status.ts`
- **Toast notifications** via Sonner are already configured and working
- **Status display** in the jobs list component shows pending/processing/completed/failed states
- **Database schema** with Realtime enabled on `rfp_upload_jobs` table

The primary work for Phase 6 is enhancing the existing implementation with:
1. A dedicated progress indicator component for the 3-5 minute wait
2. Improved toast notification patterns for long-running processes
3. Navigation persistence (user can leave and return)
4. Error handling and retry patterns

**Key insight:** The existing `useRFPUploadStatus` hook already handles Realtime subscriptions and toast notifications. Phase 6 is about refinement and UX polish, not building new infrastructure.

**Primary recommendation:** Enhance the existing RFP page with a prominent processing status card, add the shadcn/ui Progress component for visual feedback, and ensure status persists across navigation by leveraging the existing hook's initial fetch pattern.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | ^2.91.0 | Realtime subscriptions | Already configured, handles postgres_changes |
| sonner | ^2.0.7 | Toast notifications | Already integrated, supports toast.loading and ID-based updates |
| lucide-react | ^0.562.0 | Icons for status states | Already in use throughout app |

### To Add
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @radix-ui/react-progress | ^1.1.x | Progress bar component | Required for shadcn/ui Progress component |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui Progress | Custom CSS animation | Progress component provides accessibility, consistent styling |
| Supabase Realtime | Polling interval | Polling adds unnecessary load, Realtime already works |
| Sonner | react-toastify | Sonner already integrated, simpler API |

**Installation:**
```bash
npx shadcn@latest add progress
```

## Architecture Patterns

### Recommended Component Structure
```
app/
├── (dashboard)/
│   └── rfps/
│       ├── page.tsx                    # Server Component: job list + upload button
│       ├── components/
│       │   ├── rfp-upload-button.tsx   # Existing: triggers upload dialog
│       │   ├── rfp-upload-dialog.tsx   # Existing: file selection UI
│       │   ├── rfp-jobs-list.tsx       # Enhanced: with real-time updates
│       │   ├── rfp-processing-card.tsx # NEW: prominent status during processing
│       │   └── pdf-dropzone.tsx        # Existing: drag-drop file input
hooks/
├── use-rfp-upload-status.ts            # Existing: Realtime subscription + toasts
components/
└── ui/
    └── progress.tsx                    # NEW: shadcn/ui Progress component
```

### Pattern 1: Real-time Job List with Client-Side Updates
**What:** Server fetches initial data, client subscribes to updates
**When to use:** Displaying job list that updates without page refresh

**Example:**
```typescript
// Source: Existing pattern in app/(dashboard)/rfps/page.tsx + components
'use client'

import { useEffect, useState } from 'react'
import { useRFPUploadStatus } from '@/hooks/use-rfp-upload-status'

interface RFPJobsListClientProps {
  initialJobs: RFPJob[]
}

export function RFPJobsListClient({ initialJobs }: RFPJobsListClientProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const { activeJob } = useRFPUploadStatus()

  useEffect(() => {
    // When activeJob changes, update the list
    if (activeJob) {
      setJobs(prev => {
        const exists = prev.find(j => j.id === activeJob.id)
        if (exists) {
          return prev.map(j => j.id === activeJob.id ? activeJob : j)
        }
        return [activeJob, ...prev]
      })
    }
  }, [activeJob])

  return (
    // Render jobs list
  )
}
```

### Pattern 2: Processing Status Card with Progress Indicator
**What:** Prominent card showing current processing status with visual progress
**When to use:** When a job is in pending or processing state

**Example:**
```typescript
// Source: shadcn/ui Progress + existing status patterns
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, Clock, FileText } from 'lucide-react'
import { useRFPUploadStatus, RFPUploadJob } from '@/hooks/use-rfp-upload-status'
import { formatDistanceToNow } from 'date-fns'

export function RFPProcessingCard() {
  const { activeJob, isProcessing } = useRFPUploadStatus()
  const [elapsedTime, setElapsedTime] = useState(0)

  // Estimated processing time: 3-5 minutes (use 4 min as midpoint)
  const ESTIMATED_TIME_MS = 4 * 60 * 1000

  useEffect(() => {
    if (!isProcessing || !activeJob) {
      setElapsedTime(0)
      return
    }

    const startTime = new Date(activeJob.created_at).getTime()
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 1000)

    return () => clearInterval(interval)
  }, [isProcessing, activeJob])

  if (!isProcessing || !activeJob) {
    return null
  }

  // Calculate progress (capped at 95% to avoid false completion signal)
  const progressPercent = Math.min(95, (elapsedTime / ESTIMATED_TIME_MS) * 100)
  const isIndeterminate = activeJob.status === 'pending'

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Processing RFP
        </CardTitle>
        <CardDescription>
          {activeJob.status === 'pending'
            ? 'Waiting to start processing...'
            : 'Analyzing document and matching against inventory...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">{activeJob.file_name}</span>
        </div>

        <div className="space-y-2">
          {isIndeterminate ? (
            <Progress value={undefined} className="h-2" />
          ) : (
            <Progress value={progressPercent} className="h-2" />
          )}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Started {formatDistanceToNow(new Date(activeJob.created_at), { addSuffix: true })}
            </span>
            <span>~3-5 minutes total</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          You can navigate away from this page. You&apos;ll receive a notification when processing completes.
        </p>
      </CardContent>
    </Card>
  )
}
```

### Pattern 3: Toast Notifications for Long-Running Processes
**What:** Using toast.loading with ID-based updates for status transitions
**When to use:** Notifying user of status changes, especially completion

**Example:**
```typescript
// Source: Sonner documentation + existing use-rfp-upload-status.ts
import { toast } from 'sonner'

// Show loading toast that persists
const showProcessingToast = (job: RFPUploadJob) => {
  toast.loading(`Processing ${job.file_name}`, {
    id: `rfp-job-${job.id}`,
    description: 'This may take 3-5 minutes...',
    duration: Infinity, // Don't auto-dismiss
  })
}

// Update toast when status changes
const handleStatusChange = (newJob: RFPUploadJob, oldJob: RFPUploadJob) => {
  if (oldJob.status !== newJob.status) {
    switch (newJob.status) {
      case 'processing':
        toast.loading('Processing RFP', {
          id: `rfp-job-${newJob.id}`,
          description: `Analyzing ${newJob.file_name}...`,
          duration: Infinity,
        })
        break
      case 'completed':
        toast.success('RFP processed successfully', {
          id: `rfp-job-${newJob.id}`,
          description: `${newJob.file_name} is ready. View your matches.`,
          duration: 10000, // Show for 10 seconds
          action: {
            label: 'View Results',
            onClick: () => window.location.href = `/rfps/${newJob.id}/matches`,
          },
        })
        break
      case 'failed':
        toast.error('RFP processing failed', {
          id: `rfp-job-${newJob.id}`,
          description: newJob.error_message || 'An unexpected error occurred',
          duration: 15000, // Show longer for errors
        })
        break
    }
  }
}
```

### Pattern 4: Navigation Persistence
**What:** User can leave page and return to see current status
**When to use:** All pages where processing status should be visible

**Example:**
```typescript
// Source: Existing use-rfp-upload-status.ts pattern
// The hook already handles this correctly:

export function useRFPUploadStatus() {
  const [activeJob, setActiveJob] = useState<RFPUploadJob | null>(null)

  // 1. Fetch initial state on mount (handles navigation back)
  const fetchActiveJob = useCallback(async () => {
    const { data } = await supabase
      .from('rfp_upload_jobs')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    setActiveJob(data)
  }, [])

  useEffect(() => {
    // Fetch on mount
    fetchActiveJob()

    // Subscribe to changes
    const channel = supabase
      .channel('rfp_upload_jobs_changes')
      .on('postgres_changes', {...})
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return { activeJob, isProcessing, refetch: fetchActiveJob }
}
```

### Anti-Patterns to Avoid

- **Anti-pattern: Polling for status updates**: Supabase Realtime is already configured. Polling adds unnecessary database load and delays updates.

- **Anti-pattern: Showing determinate progress without real data**: Don't show exact percentages when you don't know actual progress. Use indeterminate or time-based estimates with clear caveats.

- **Anti-pattern: Dismissing loading toast automatically**: For long processes, use `duration: Infinity` and dismiss/update when status actually changes.

- **Anti-pattern: Relying only on toast for status**: Toasts can be dismissed. Always have an in-page status indicator.

- **Anti-pattern: Not handling reconnection**: Supabase Realtime can disconnect. Handle channel errors and resubscribe.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Progress bar UI | Custom div animations | shadcn/ui Progress | Accessibility, consistent styling, Radix primitives |
| Toast notifications | Custom notification system | Sonner (already installed) | Already configured, supports loading states |
| Real-time updates | setInterval polling | Supabase Realtime (already working) | More efficient, instant updates |
| Time formatting | Manual date math | date-fns (already installed) | formatDistanceToNow handles edge cases |
| Status icons | Custom SVGs | Lucide React (already installed) | Consistent icon system |

**Key insight:** All required infrastructure already exists. The focus is on UI refinement, not building new systems.

## Common Pitfalls

### Pitfall 1: Supabase Realtime Filter Not Working
**What goes wrong:** Client receives updates for all users, not just current user.

**Why it happens:** Postgres Changes with RLS enabled only works if the RLS policy allows SELECT. Updates from service_role bypass RLS for the update but the client filter still applies.

**How to avoid:**
```typescript
// Current implementation already handles this correctly
// The hook filters by user_id in the initial fetch
// Real-time updates come from the table level but state update
// checks if the job belongs to current user
const handleJobUpdate = useCallback((payload) => {
  const newJob = payload.new
  // Only update state if job belongs to current user
  if (newJob.user_id === userId) {
    setActiveJob(newJob)
  }
}, [userId])
```

**Warning signs:** Seeing other users' jobs, privacy concerns, unexpected data.

### Pitfall 2: Channel Not Cleaning Up on Unmount
**What goes wrong:** Duplicate events, memory leaks, stale updates appearing.

**Why it happens:** useEffect cleanup not removing channel subscription.

**How to avoid:**
```typescript
// Source: Existing use-rfp-upload-status.ts (correct pattern)
useEffect(() => {
  const channel = supabase
    .channel('unique_channel_name')
    .on('postgres_changes', {...})
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [dependencies])
```

**Warning signs:** Console warnings about duplicate channels, events firing multiple times.

### Pitfall 3: Toast ID Collision
**What goes wrong:** Toasts for different jobs overwrite each other.

**Why it happens:** Using same ID for different jobs.

**How to avoid:**
```typescript
// Always include job ID in toast ID
toast.success('Completed', {
  id: `rfp-job-${job.id}`, // Unique per job
  // NOT: id: 'rfp-toast'  // Would collide
})
```

**Warning signs:** Wrong job info in toast, toasts disappearing unexpectedly.

### Pitfall 4: Progress Showing 100% Before Completion
**What goes wrong:** Progress bar reaches 100% but job isn't done, confusing users.

**Why it happens:** Time-based progress estimate exceeds actual processing time.

**How to avoid:**
```typescript
// Cap progress at 95% until actual completion
const progressPercent = Math.min(95, (elapsedTime / ESTIMATED_TIME_MS) * 100)

// Only show 100% when status is actually 'completed'
if (job.status === 'completed') {
  progressPercent = 100
}
```

**Warning signs:** Users thinking job is stuck at 95%, premature "complete" appearance.

### Pitfall 5: Lost Notifications When Tab Inactive
**What goes wrong:** User misses completion notification because they had another tab active.

**Why it happens:** Some browsers throttle background tabs; toast shown but immediately hidden.

**How to avoid:**
```typescript
// Sonner already handles this with useIsDocumentHidden
// But for critical notifications, consider:

// 1. Browser Notifications API (requires permission)
if (Notification.permission === 'granted' && document.hidden) {
  new Notification('RFP Processing Complete', {
    body: `${job.file_name} is ready to review`,
  })
}

// 2. Use longer duration for completion toasts
toast.success('Complete', {
  duration: 10000, // 10 seconds instead of 4
})

// 3. In-page status persists regardless of toast
```

**Warning signs:** Users not noticing completion, checking back repeatedly.

### Pitfall 6: Realtime Subscription Fails Silently
**What goes wrong:** Updates stop arriving, user stuck on stale status.

**Why it happens:** WebSocket disconnection, network issues, subscription error.

**How to avoid:**
```typescript
// Handle subscription status
const channel = supabase
  .channel('rfp_upload_jobs_changes')
  .on('postgres_changes', {...}, handleUpdate)
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Realtime connected')
    }
    if (status === 'CHANNEL_ERROR') {
      console.error('Realtime subscription error')
      // Attempt reconnection or show user message
    }
    if (status === 'TIMED_OUT') {
      console.error('Realtime subscription timed out')
      // Retry subscription
    }
  })
```

**Warning signs:** Status not updating, need to refresh page manually.

## Code Examples

Verified patterns from official sources and existing codebase:

### shadcn/ui Progress Component
```typescript
// Source: shadcn/ui documentation
// Install: npx shadcn@latest add progress

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

### Indeterminate Progress with CSS Animation
```typescript
// For pending state where we don't have progress info
// Source: Tailwind CSS patterns

const IndeterminateProgress = () => (
  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
    <div
      className="absolute h-full w-1/3 bg-primary animate-[indeterminate_1.5s_infinite_ease-in-out]"
      style={{
        animation: 'indeterminate 1.5s infinite ease-in-out',
      }}
    />
  </div>
)

// Add to globals.css or use inline keyframes
// @keyframes indeterminate {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(400%); }
// }
```

### Sonner Toast with Action Button
```typescript
// Source: Sonner documentation
import { toast } from 'sonner'

toast.success('RFP Processing Complete', {
  id: `rfp-job-${jobId}`,
  description: 'Your matches are ready to review',
  duration: 10000,
  action: {
    label: 'View Matches',
    onClick: () => {
      // Navigate to results page
      window.location.href = `/rfps/${jobId}/matches`
    },
  },
})
```

### Supabase Realtime with Error Handling
```typescript
// Source: Supabase documentation + existing codebase pattern
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

function setupRealtimeSubscription(
  userId: string,
  onUpdate: (job: RFPUploadJob) => void
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel(`rfp_jobs_${userId}`) // Unique channel per user
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rfp_upload_jobs',
        // Filter not available for UPDATE events with RLS
        // Handle filtering in callback
      },
      (payload) => {
        const job = payload.new as RFPUploadJob
        if (job.user_id === userId) {
          onUpdate(job)
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'rfp_upload_jobs',
      },
      (payload) => {
        const job = payload.new as RFPUploadJob
        if (job.user_id === userId) {
          onUpdate(job)
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('Connected to realtime')
      }
      if (status === 'CHANNEL_ERROR') {
        console.error('Realtime error:', err)
        // Could trigger reconnection logic here
      }
    })

  return channel
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Polling with setInterval | Supabase Realtime postgres_changes | 2023 (Supabase Realtime v2) | Instant updates, less server load |
| Custom toast system | Sonner library | 2024 | Simpler API, better UX, ID-based updates |
| Determinate progress for unknown duration | Time-estimate progress or indeterminate | UX best practice | Clearer user expectations |
| Alert dialogs for notifications | Toast notifications | Industry standard | Non-blocking, better UX |

**Deprecated/outdated:**
- **Polling for status**: Use Realtime subscriptions instead
- **Custom WebSocket implementations**: Supabase handles connection management
- **Blocking dialogs for background process updates**: Use non-blocking toasts

## Open Questions

Things that couldn't be fully resolved:

1. **Exact processing time distribution**
   - What we know: n8n workflow takes 3-5 minutes
   - What's unclear: Is it predictable? Does file size affect duration?
   - Recommendation: Use 4-minute estimate, cap progress at 95%, show "~3-5 minutes" text

2. **Should there be a global processing indicator (e.g., in sidebar)?**
   - What we know: Processing card on /rfps page, toasts anywhere
   - What's unclear: Whether users navigate away frequently during processing
   - Recommendation: Start with current page + toasts, add global indicator if user feedback suggests need

3. **Retry behavior for failed jobs**
   - What we know: Jobs can fail, error_message stored
   - What's unclear: Whether users can retry failed jobs, or must re-upload
   - Recommendation: Phase 6 shows error; retry feature could be Phase 10 polish

4. **Multiple concurrent jobs**
   - What we know: Current hook fetches most recent pending/processing job
   - What's unclear: Whether users should be able to queue multiple RFPs
   - Recommendation: Keep single-job focus for Phase 6; queue feature could be future enhancement

## Sources

### Primary (HIGH confidence)
- [Supabase Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes) - Subscription patterns, filtering, error handling
- [Sonner Documentation](https://sonner.emilkowal.ski/toast) - Toast API, loading states, ID-based updates
- [shadcn/ui Progress](https://ui.shadcn.com/docs/components/progress) - Progress component installation and usage
- [shadcn/ui Sonner](https://ui.shadcn.com/docs/components/sonner) - Toast integration with shadcn
- Existing codebase: `use-rfp-upload-status.ts`, `rfp-jobs-list.tsx`, `rfp-upload-button.tsx`

### Secondary (MEDIUM confidence)
- [Radix UI Progress](https://www.radix-ui.com/themes/docs/components/progress) - Accessibility, indeterminate state
- [Microsoft Fluent Design - Progress](https://fluent2.microsoft.design/components/web/react/core/progressbar/usage) - UX best practices for progress indicators

### Tertiary (LOW confidence)
- Various blog posts on progress indicator UX patterns
- Community discussions on Supabase Realtime best practices

## Metadata

**Confidence breakdown:**
- Supabase Realtime: HIGH - Already implemented and working in codebase
- Toast notifications: HIGH - Sonner already integrated, well-documented
- Progress indicators: HIGH - shadcn/ui component, standard pattern
- Navigation persistence: HIGH - Already handled by existing hook pattern
- Error handling: MEDIUM - Basic pattern clear, edge cases may need refinement

**Research date:** 2026-01-22
**Valid until:** 2026-02-22 (30 days - stable ecosystem)

## Existing Code to Leverage

### Already Implemented (Phase 5)
1. **`use-rfp-upload-status.ts`** - Complete Realtime subscription hook with toast notifications
2. **`rfp-jobs-list.tsx`** - Status display with icons and badges for all states
3. **`rfp-upload-button.tsx`** - Processing state disables upload, shows spinner
4. **Database schema** - `rfp_upload_jobs` table with Realtime enabled
5. **Sonner Toaster** - Configured in root layout

### To Enhance
1. **Processing Card** - Add prominent status card when job is active
2. **Progress Component** - Install shadcn/ui progress, add to processing card
3. **Toast patterns** - Extend duration, add action buttons for completion
4. **Jobs list** - Make it update in real-time (currently server-rendered)

### No Changes Needed
1. **Root layout** - Toaster already configured
2. **Supabase client** - Already set up for Realtime
3. **RFP upload flow** - Works correctly, triggers correct status updates

# Continuous Learning Skill

This skill enables automatic extraction and persistence of learnings from sessions.

## Purpose

When Claude discovers something that isn't trivial during a session:
- A debugging technique
- A workaround for a specific issue
- A project-specific pattern
- A useful configuration

That knowledge should be saved for future sessions.

## When to Extract Learnings

Extract learnings when:
1. A non-obvious solution is found
2. A pattern is discovered that could be reused
3. A workaround is needed for a framework limitation
4. A debugging technique proves effective
5. A configuration solves a recurring issue

## Learning Format

Save learnings to `.planning/learnings/` with this format:

```markdown
# Learning: [Short Title]

**Date:** YYYY-MM-DD
**Context:** [What problem was being solved]
**Category:** [debugging|pattern|workaround|config|tool]

## Problem

Brief description of the problem encountered.

## Solution

The solution that worked, with code examples if applicable.

```typescript
// Example code
```

## Why It Works

Explanation of why this solution is effective.

## When to Apply

- Situation 1 where this applies
- Situation 2 where this applies

## Related

- Link to similar learnings
- Link to documentation
```

## Categories

| Category | Description |
|----------|-------------|
| debugging | Techniques for finding and fixing bugs |
| pattern | Reusable code patterns |
| workaround | Solutions for framework limitations |
| config | Configuration discoveries |
| tool | Tool usage tips |
| supabase | Supabase-specific learnings |
| nextjs | Next.js-specific learnings |
| n8n | n8n workflow learnings |

## Session End Checklist

Before ending a session, consider:

1. Did I discover anything non-obvious?
2. Did I find a workaround for a problem?
3. Did I learn a new pattern?
4. Would this help in a future session?

If yes to any, extract the learning.

## Loading Learnings

At session start, relevant learnings can be loaded based on:
- Current task type
- Files being worked on
- Error messages encountered

## Example Learnings

### Supabase Realtime Filter

```markdown
# Learning: Supabase Realtime Filter Syntax

**Date:** 2026-01-24
**Context:** Setting up real-time updates for job status
**Category:** supabase

## Problem
Realtime subscription wasn't filtering correctly.

## Solution
Use `filter` parameter with exact column=value syntax:

```typescript
.on('postgres_changes', {
  event: 'UPDATE',
  schema: 'public',
  table: 'rfp_upload_jobs',
  filter: `id=eq.${jobId}`  // Note: eq. prefix required
}, callback)
```

## Why It Works
Supabase uses PostgREST syntax for filters.

## When to Apply
- Any Realtime subscription with filtering
- Single-record subscriptions
```

### Server Action Revalidation

```markdown
# Learning: Server Action Path Revalidation

**Date:** 2026-01-25
**Context:** Data not updating after mutation
**Category:** nextjs

## Problem
After updating data via Server Action, the UI didn't reflect changes.

## Solution
Call `revalidatePath` after mutation:

```typescript
import { revalidatePath } from 'next/cache'

export async function updateData() {
  // ... mutation
  revalidatePath('/path-to-page')
  return { success: true }
}
```

## When to Apply
- Any Server Action that modifies data
- When UI should reflect changes immediately
```

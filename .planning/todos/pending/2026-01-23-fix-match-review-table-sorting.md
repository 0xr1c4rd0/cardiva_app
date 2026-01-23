---
created: 2026-01-23T10:35
title: Fix match review table sorting not applying
area: ui
priority: critical
files:
  - src/app/(dashboard)/rfps/components/match-review-table.tsx
  - src/app/(dashboard)/rfps/[id]/matches/page.tsx
---

## Problem

The match review table sorting is broken. When clicking column headers:
- ✅ Sort icon changes (responds to click)
- ✅ URL updates with `?sortBy=xxx&sortDir=xxx`
- ❌ Table data remains in same order (doesn't refresh)

## Root Cause Analysis

The issue is with nuqs `setParams` with `shallow: false`. It should trigger full server navigation via `router.push()`, but it's not causing the server component to re-render with new data.

Attempted fixes that didn't work:
1. Removing `startTransition` wrapper (URL updates but data doesn't refresh)

## Solution Options

1. **Use `router.refresh()` after `setParams`**
   - Force Next.js to re-fetch server components
   - May cause double navigation

2. **Use `router.push()` directly**
   - Build URL manually and navigate
   - Bypass nuqs for navigation, keep it for URL parsing only

3. **Check nuqs configuration**
   - Verify NuqsAdapter is correctly configured
   - Check if there's a specific Next.js App Router issue

4. **Add cache invalidation**
   - Use `revalidatePath()` in a server action
   - Force fresh data fetch on sort change

## Verification Steps

Direct URL navigation works:
```
/rfps/[id]/matches?sortBy=artigo&sortDir=asc
```
This returns correctly sorted data, proving:
- Server-side sorting logic is correct
- Database queries work properly
- Issue is client-side navigation not triggering re-render

## Technical Context

- nuqs version: check package.json
- Next.js App Router with `export const dynamic = 'force-dynamic'`
- Server component reads searchParams and queries Supabase

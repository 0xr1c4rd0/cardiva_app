---
created: 2026-01-23T10:30
title: Fix "Por Rever" KPI calculation
area: ui
priority: high
files:
  - src/app/(dashboard)/rfps/page.tsx
  - src/app/(dashboard)/rfps/components/rfp-stats-chips.tsx
---

## Problem

The "Por Rever" (To Review) KPI on the RFPs page is not calculating correctly. 

Current behavior: Unclear what's being counted
Expected behavior: Count only RFPs that still have pending matches to review

An RFP should be counted as "Por Rever" if:
- It has at least one `rfp_item` with `review_status = 'pending'` AND that item has at least one `rfp_match_suggestion` with `status = 'pending'`

An RFP should NOT be counted if:
- All its items have been reviewed (accepted/rejected/manual)
- OR all its items have no pending suggestions left to review

## Solution

1. Query `rfp_upload_jobs` with a subquery/join that checks for unreviewed items with pending suggestions
2. Update the stats calculation logic in the RFPs page
3. Consider caching this count or using a computed column for performance

## Technical Notes

The calculation needs to consider:
- `rfp_items.review_status` (pending/accepted/rejected/manual)
- `rfp_match_suggestions.status` (pending/accepted/rejected)
- Items with 100% match are auto-accepted, so they shouldn't count as "to review"

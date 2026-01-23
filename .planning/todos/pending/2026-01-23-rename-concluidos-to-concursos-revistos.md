---
created: 2026-01-23T10:31
title: Rename "Concluídos" to "Concursos Revistos" KPI
area: ui
priority: high
files:
  - src/app/(dashboard)/rfps/page.tsx
  - src/app/(dashboard)/rfps/components/rfp-stats-chips.tsx
---

## Problem

The "Concluídos" (Completed) KPI label is misleading. It should be renamed to "Concursos Revistos" (Reviewed RFPs) and show the count of RFPs that have NO remaining matches to review.

## Solution

1. Rename label from "Concluídos" to "Concursos Revistos"
2. Calculate count as: RFPs where ALL items have been reviewed (no pending items with pending suggestions)
3. This is the inverse of the "Por Rever" count

## Relationship

- "Por Rever" + "Concursos Revistos" should equal total RFPs with matches
- An RFP moves from "Por Rever" to "Concursos Revistos" when all its items are addressed

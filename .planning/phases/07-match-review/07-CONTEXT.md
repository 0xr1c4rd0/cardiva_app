# Phase 7: Match Review - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Display RFP extraction results with suggested inventory matches. Users review each item, see confidence indicators, and accept or reject individual match suggestions. Each RFP item shows all its potential matches, user makes accept/reject decisions per match.

**Not in scope:** Bulk operations, manual corrections, confirmation step (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Results layout
- Single scrollable list of RFP items, each with nested matches below
- All match suggestions visible without expanding (full density)
- Reviewed items collapse to show only: accepted match (if any) or "rejected/no match" status
- Pending items stay prominent; reviewed items fade to ~70% opacity with small status badge
- Clean, minimalist aesthetic — no heavy colors, let spacing and opacity do the work

### Confidence display
- Visual progress bar showing match confidence (length indicates score)
- Single teal color — no gradient or traffic light colors
- Bar always visible inline with each match suggestion
- No special treatment for low-confidence matches — bar length speaks for itself

### Accept/reject interaction
- Each match suggestion has its own Accept and Reject buttons
- Accepting a match auto-rejects all other matches for that RFP item
- If user rejects all matches for an item, item is marked as "rejected" (no match found)
- Selection state highlighted on each match — user can see and change decisions
- Accepting a different match auto-rejects the previously accepted one
- Subtle animation/pulse on state change for feedback

### Match presentation
- Matches ordered by confidence (highest first)
- Show all matches saved in Supabase for each RFP item (no artificial limit)
- RFP item original text always visible above its matches for context
- Match columns: codigo_spms, artigo, descricao + confidence bar

### Claude's Discretion
- Exact spacing and typography
- Animation timing and easing
- Loading skeleton design
- Error state handling
- Mobile responsiveness details

</decisions>

<specifics>
## Specific Ideas

- "Clean, minimalist, subtle" — opacity-based distinction for reviewed items rather than color
- Items collapse after review showing just the accepted match or rejection status
- User wanted configurable columns in settings — deferred to future phase

</specifics>

<deferred>
## Deferred Ideas

- **Admin column configuration** — Settings page where admin can choose which columns display per match. Future phase after Phase 10.

</deferred>

---

*Phase: 07-match-review*
*Context gathered: 2026-01-22*

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cardiva is an RFP (Request for Proposal) matching application for a pharmaceutical company. Users upload government RFP PDFs, and the system matches requested products against a 20k+ product inventory using AI-powered semantic search. The app provides an interactive dashboard to review matches, accept/reject suggestions, and export results.

**Key Insight**: The heavy lifting (PDF extraction, OCR, AI matching) happens in n8n workflows. This app is the frontend + job orchestration layer.

## Development Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build
npm run test         # Run all Playwright E2E tests
npm run test:ui      # Interactive Playwright test UI
npm run test:headed  # Run tests with visible browser
npm run test:phase1  # Run phase-01 foundation tests only
npm run test:phase2  # Run phase-02 authentication tests only
npm run test:phase3  # Run phase-03 inventory tests only
```

---

## 🚀 GSD Framework - MANDATORY FOR ALL REQUESTS

**Every single request MUST be routed through the Get Shit Done (GSD) framework.** No exceptions.

### Step 0: Always Brainstorm First
```
/superpowers:brainstorming
```
Before ANY GSD command, invoke brainstorming to explore user intent, requirements, and design considerations.

### Step 1: Classify the Request

After brainstorming, determine request complexity:

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST CLASSIFICATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Is this request...                                              │
│                                                                  │
│  ✓ Bug fix (single file, clear cause)?          → /gsd:quick    │
│  ✓ Config change or environment update?         → /gsd:quick    │
│  ✓ Small UI tweak (color, spacing, text)?       → /gsd:quick    │
│  ✓ Adding a simple field or column?             → /gsd:quick    │
│  ✓ One-off script or utility?                   → /gsd:quick    │
│  ✓ Documentation update?                        → /gsd:quick    │
│  ✓ Completable in single session (<30 min)?     → /gsd:quick    │
│                                                                  │
│  ✗ New feature with multiple components?        → /gsd:new-project │
│  ✗ Changes spanning 3+ files with logic?        → /gsd:new-project │
│  ✗ Database schema changes?                     → /gsd:new-project │
│  ✗ New page or route?                           → /gsd:new-project │
│  ✗ Integration with external service?           → /gsd:new-project │
│  ✗ Refactoring across multiple modules?         → /gsd:new-project │
│  ✗ Requires multi-phase planning?               → /gsd:new-project │
│  ✗ Will take multiple sessions?                 → /gsd:new-project │
│                                                                  │
│  WHEN IN DOUBT → /gsd:new-project (better to over-plan)         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Quick Mode: `/gsd:quick`

For simple, contained tasks:
```
/gsd:quick [description of task]
```

**What happens:**
1. Plans the task with atomic steps
2. Executes with fresh context
3. Creates atomic git commit
4. Verifies completion

**Still required in quick mode:**
- Run tests after implementation
- Visual verification via browser automation
- Ask user before committing

### Full Project Mode: `/gsd:new-project`

For substantial work requiring structure:

```
/gsd:new-project
```

**Follow the GSD Phase Loop:**

```
┌──────────────────────────────────────────────────────────────┐
│                    GSD PHASE EXECUTION LOOP                   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   1. DISCUSS    →  /gsd:discuss-phase [N]                    │
│                    Capture implementation decisions           │
│                    before any planning                        │
│                                                               │
│   2. PLAN       →  /gsd:plan-phase [N]                       │
│                    Research + atomic task plans               │
│                    + verification criteria                    │
│                                                               │
│   3. EXECUTE    →  /gsd:execute-phase [N]                    │
│                    Parallel waves with fresh context          │
│                    Atomic commits per task                    │
│                                                               │
│   4. VERIFY     →  /gsd:verify-work [N]                      │
│                    Automated diagnostics +                    │
│                    User acceptance testing                    │
│                                                               │
│   5. REPEAT     →  Next phase or /gsd:complete-milestone     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Essential GSD Commands Reference

| Command | When to Use |
|---------|-------------|
| `/gsd:progress` | Check current position and next steps |
| `/gsd:map-codebase` | Before new-project on existing code |
| `/gsd:add-phase` | Append work to current roadmap |
| `/gsd:insert-phase [N]` | Insert urgent work between phases |
| `/gsd:pause-work` | Stopping mid-phase (creates handoff) |
| `/gsd:resume-work` | Continuing from previous session |
| `/gsd:add-todo [desc]` | Capture ideas for later |
| `/gsd:check-todos` | Review pending ideas |
| `/gsd:debug [desc]` | Systematic debugging with state |
| `/gsd:audit-milestone` | Verify milestone completion |
| `/gsd:complete-milestone` | Archive and tag release |
| `/gsd:help` | Full command reference |

### GSD Directory Structure

All planning artifacts live in `.planning/`:
```
.planning/
├── PROJECT.md           # Vision (always loaded)
├── REQUIREMENTS.md      # V1/V2 scope with traceability
├── ROADMAP.md          # Phases and progress
├── STATE.md            # Decisions, blockers, position
├── research/           # Ecosystem investigation
├── phases/
│   └── {N}-{name}/
│       ├── {N}-CONTEXT.md     # Implementation decisions
│       ├── {N}-RESEARCH.md    # Phase research
│       ├── {N}-{X}-PLAN.md    # Atomic task plans
│       ├── {N}-{X}-SUMMARY.md # Execution results
│       ├── {N}-UAT.md         # User acceptance tests
│       └── {N}-VERIFICATION.md # Automated verification
├── quick/              # Ad-hoc task tracking
└── todos/              # Captured ideas
```

---

## Testing & Verification Strategy

### During GSD Execution

All verification happens in the `/gsd:verify-work` phase using these tools:

**1. agent-browser MCP** (Primary - Visual/E2E)
```bash
agent-browser open http://localhost:3000
agent-browser snapshot                    # Accessibility tree with refs
agent-browser click @e2                   # Click by element ref
agent-browser fill @e3 "text"            # Fill inputs
agent-browser screenshot                  # Capture state
```

**2. chrome-devtools MCP** (DevTools Inspection)
- Network requests and API calls
- Console logs and errors
- Performance traces
- DOM inspection and debugging

**3. playwright MCP** (Complex E2E Flows)
- Multi-step user workflows
- Form submissions with validation
- File upload testing
- Cross-browser scenarios

### Tool Selection Matrix

| Scenario | Primary Tool | Fallback |
|----------|--------------|----------|
| Quick visual check | agent-browser | chrome-devtools |
| Network/API verification | chrome-devtools | playwright |
| Complex user flow | playwright | agent-browser |
| Accessibility audit | agent-browser snapshot | — |
| Performance profiling | chrome-devtools | — |
| File upload testing | playwright | chrome-devtools |

### Verification Checklist (Every Task)

Before marking ANY task complete in GSD:

- [ ] `npm run build` passes (type-check + build)
- [ ] `npm run test` passes (all E2E tests)
- [ ] Visual verification via browser automation completed
- [ ] No console errors in browser DevTools
- [ ] Responsive design verified (if UI change)
- [ ] Portuguese text is correct (if user-facing)
- [ ] Code review agents ran (significant changes)
- [ ] User approved git commit

---

## Skill & MCP Integration with GSD

### During Planning Phase (`/gsd:plan-phase`)

**Context7 MCP** - Library documentation lookup:
- React, Next.js, Supabase, shadcn/ui patterns
- Framework best practices
- API references

**Sequential Thinking MCP** - Complex analysis:
- Architectural decisions
- Multi-step problem decomposition
- Root cause investigation

### During Execution Phase (`/gsd:execute-phase`)

**Frontend Changes** → Invoke skill first:
```
/frontend-design
```
Use for: New components, layouts, styling, responsive design, accessibility.

**Supabase Changes** → Use Supabase MCP:
- Database queries and mutations
- Auth configuration
- Storage operations
- Realtime subscriptions
- RLS policy changes

**CRITICAL**: Always create migration files in `supabase/migrations/` for schema changes.

**n8n Workflow Changes** → Use n8n skills/MCP:
- Webhook integrations
- Workflow modifications
- Trigger configurations
- Endpoint testing

Reference: `docs/n8n-rfp-workflow-guide.md`

### After Execution (`/gsd:verify-work`)

**Code Review Agents** - Run for significant changes:
- `code-reviewer` agent - Quality, bugs, security
- `code-architecture-reviewer` agent - Architectural decisions

**Greptile MCP** - PR review if creating pull request

---

## Git Workflow with GSD

**GSD handles atomic commits automatically.** Each task in a plan gets its own commit with phase prefix.

**However, always ask user before:**
- Pushing to remote
- Creating pull requests
- Force operations

**Commit message format** (GSD default):
```
[phase-N] task description

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router (React 19, TypeScript)
- **Backend**: Supabase (Auth, Postgres DB, Realtime, Storage)
- **Processing**: n8n workflows triggered via webhooks (fire-and-forget)
- **UI**: shadcn/ui (Radix primitives) + Tailwind CSS 4
- **State**: Zustand (client), React Query (server), Nuqs (URL params)

### Route Groups
- `(auth)/` - Public auth pages (login, register, reset-password)
- `(dashboard)/` - Protected pages requiring auth + admin approval
  - `admin/users/` - Admin user management
  - `inventory/` - Product inventory with CSV upload/export
  - `rfps/` - Core RFP processing feature
  - `rfps/[id]/matches/` - Match review interface

### Key Patterns

**Server vs Client Components**: Dashboard layout checks auth server-side and redirects. Data-fetching happens in Server Components, interactive elements are Client Components with `"use client"`.

**Supabase Clients**:
- `lib/supabase/server.ts` - Server Components/Actions (async, uses cookies)
- `lib/supabase/browser.ts` - Client Components (singleton pattern)

**RFP Processing Flow**:
1. User uploads PDF → Creates `rfp_upload_jobs` row with `pending` status
2. Server Action triggers n8n webhook (FormData with binary PDF)
3. n8n processes (3-5 min): extracts items → AI matches → inserts `rfp_items` + `rfp_match_suggestions`
4. n8n updates job status to `completed`
5. Frontend subscribes to Realtime, auto-refreshes on completion

**Upload Queue (RFPUploadStatusContext)**:
- Max 10 concurrent uploads, 3 progressing at once
- Queue restores from DB on page refresh
- Supabase Realtime broadcasts status changes to all users

### Database Tables
- `profiles` - Users with `approved_at` (null = pending approval)
- `artigos` - Inventory products (~20k items)
- `rfp_upload_jobs` - Job tracking (status: pending/processing/completed/failed)
- `rfp_items` - Extracted line items from RFPs
- `rfp_match_suggestions` - AI-generated matches with confidence scores (0.0000-1.0000)

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
N8N_RFP_WEBHOOK_URL          # Triggers RFP processing
N8N_INVENTORY_WEBHOOK_URL    # Triggers inventory updates
N8N_EXPORT_EMAIL_WEBHOOK_URL # Triggers email exports
N8N_WEBHOOK_SECRET           # Optional auth header
```

## Important Conventions

- **UI Language**: Portuguese (Portugal) - dashboard text, labels, messages
- **CSV Encoding**: UTF-8 with ISO-8859-1 fallback for Portuguese characters
- **Confidence Scores**: 4 decimal precision (e.g., 0.9523)
- **Auth Flow**: Registration creates account → Admin approves via `/admin/users` → User gets dashboard access
- **Server Actions**: 10MB body limit configured for large CSV uploads
- **Migrations**: ALL schema changes require migration files in `supabase/migrations/`

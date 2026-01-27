# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Cardiva is an RFP (Request for Proposal) matching application for a pharmaceutical company. Users upload government RFP PDFs, and the system matches requested products against a 20k+ product inventory using AI-powered semantic search. The app provides an interactive dashboard to review matches, accept/reject suggestions, and export results.

**Key Insight**: The heavy lifting (PDF extraction, OCR, AI matching) happens in n8n workflows. This app is the frontend + job orchestration layer.

---

## Critical Rules (ALWAYS FOLLOW)

### 1. Code Organization

**MANY SMALL FILES > FEW LARGE FILES**
- High cohesion, low coupling
- 200-400 lines typical, 800 max per file
- Extract utilities from large components
- Organize by feature/domain, not by type

### 2. Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate:

```typescript
// WRONG: Mutation
function updateUser(user: User, name: string) {
  user.name = name  // MUTATION!
  return user
}

// CORRECT: Immutability
function updateUser(user: User, name: string): User {
  return { ...user, name }
}
```

### 3. Error Handling

ALWAYS handle errors comprehensively:

```typescript
try {
  const result = await riskyOperation()
  return { success: true, data: result }
} catch (error) {
  console.error('Operation failed:', error)
  return { success: false, error: 'User-friendly message' }
}
```

### 4. Input Validation

ALWAYS validate user input with Zod:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  quantity: z.number().int().min(1)
})

const validated = schema.parse(input)
```

### 5. Security

- No hardcoded secrets - use environment variables
- Validate ALL user inputs before processing
- Parameterized queries only (Supabase handles this)
- CSRF protection via Server Actions
- Never expose internal error details to users

### 6. Code Quality Checklist

Before marking ANY work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling with try/catch
- [ ] No console.log in production code
- [ ] No hardcoded values (use constants/env vars)
- [ ] Immutable patterns used throughout

---

## Development Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Production build (includes type-check)
npm run test         # Run all Playwright E2E tests
npm run test:ui      # Interactive Playwright test UI
npm run test:headed  # Run tests with visible browser
```

---

## GSD Framework - MANDATORY FOR ALL REQUESTS

**Every request MUST be routed through the Get Shit Done (GSD) framework.** No exceptions.

### Step 0: Always Brainstorm First
```
/superpowers:brainstorming
```
Before ANY GSD command, explore user intent, requirements, and design considerations.

### Step 1: Classify the Request

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST CLASSIFICATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  QUICK MODE (/gsd:quick) - Single session, <30 min:             │
│  ✓ Bug fix (single file, clear cause)                           │
│  ✓ Config change or environment update                          │
│  ✓ Small UI tweak (color, spacing, text)                        │
│  ✓ Adding a simple field or column                              │
│  ✓ One-off script or utility                                    │
│  ✓ Documentation update                                         │
│                                                                  │
│  FULL PROJECT MODE (/gsd:new-project) - Multi-session:          │
│  ✗ New feature with multiple components                         │
│  ✗ Changes spanning 3+ files with logic                         │
│  ✗ Database schema changes                                      │
│  ✗ New page or route                                            │
│  ✗ Integration with external service                            │
│  ✗ Refactoring across multiple modules                          │
│                                                                  │
│  WHEN IN DOUBT → /gsd:new-project (better to over-plan)         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### GSD Phase Loop (Full Project Mode)

```
┌──────────────────────────────────────────────────────────────┐
│   1. DISCUSS    →  /gsd:discuss-phase [N]                    │
│                    Capture implementation decisions           │
│                                                               │
│   2. PLAN       →  /gsd:plan-phase [N]                       │
│                    Research + atomic task plans               │
│                                                               │
│   3. EXECUTE    →  /gsd:execute-phase [N]                    │
│                    Parallel waves, atomic commits             │
│                                                               │
│   4. VERIFY     →  /gsd:verify-work [N]                      │
│                    Automated + user acceptance testing        │
│                                                               │
│   5. REPEAT     →  Next phase or /gsd:complete-milestone     │
└──────────────────────────────────────────────────────────────┘
```

### Essential GSD Commands

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

### GSD + Quality Integration

The new quality patterns integrate with GSD phases:

| GSD Phase | Quality Enhancement |
|-----------|---------------------|
| `/gsd:plan-phase` | Use `/plan` command, apply TDD planning |
| `/gsd:execute-phase` | Follow TDD (RED-GREEN-REFACTOR), use code quality checklist |
| `/gsd:verify-work` | Run `/code-review`, use browser automation tools |
| `/gsd:pause-work` | Create session handoff with learnings |

### GSD Directory Structure

```
.planning/
├── PROJECT.md           # Vision (always loaded)
├── REQUIREMENTS.md      # Scope with traceability
├── ROADMAP.md          # Phases and progress
├── STATE.md            # Decisions, blockers, position
├── phases/
│   └── {N}-{name}/
│       ├── {N}-CONTEXT.md     # Implementation decisions
│       ├── {N}-RESEARCH.md    # Phase research
│       ├── {N}-{X}-PLAN.md    # Atomic task plans
│       ├── {N}-{X}-SUMMARY.md # Execution results
│       ├── {N}-UAT.md         # User acceptance tests
│       └── {N}-VERIFICATION.md # Automated verification
├── sessions/            # Session handoff files (memory persistence)
│   └── YYYY-MM-DD-handoff.md
├── learnings/           # Extracted learnings (continuous learning)
│   └── {category}-{topic}.md
├── quick/               # Ad-hoc task tracking
└── todos/               # Captured ideas
```

---

## Testing Requirements

### Test-Driven Development (TDD) - MANDATORY

For new features, follow RED-GREEN-REFACTOR:

1. **RED**: Write test first - it should FAIL
2. **GREEN**: Write minimal implementation to pass
3. **REFACTOR**: Clean up while keeping tests green
4. **VERIFY**: Ensure 80%+ coverage

### Test Types Required

1. **Unit Tests** - Individual functions, utilities
2. **Integration Tests** - API endpoints, database operations
3. **E2E Tests** - Critical user flows (Playwright)

### Verification Checklist (Every Task)

Before marking ANY task complete in GSD:

- [ ] `npm run build` passes (type-check + build)
- [ ] `npm run test` passes (all E2E tests)
- [ ] Visual verification via browser automation completed
- [ ] No console errors in browser DevTools
- [ ] Responsive design verified (if UI change)
- [ ] Portuguese text is correct (if user-facing)
- [ ] Code quality checklist passed (see Critical Rules section)
- [ ] Code review agents ran (for significant changes)
- [ ] User approved git commit

**Quick Mode (`/gsd:quick`) still requires:**
- Run tests after implementation
- Visual verification via browser automation
- Ask user before committing

---

## Token Optimization & Context Management

### Model Selection by Task Type

| Task Type | Model | Why |
|-----------|-------|-----|
| File exploration/search | Haiku | Fast, cheap, sufficient |
| Simple single-file edits | Haiku | Clear instructions |
| Multi-file implementation | Sonnet | Best coding balance |
| Complex architecture | Opus | Deep reasoning needed |
| Security analysis | Opus | Can't miss vulnerabilities |
| Debugging complex bugs | Opus | Needs full system context |

**Default to Sonnet for 90% of coding tasks.** Upgrade to Opus when:
- First attempt failed
- Task spans 5+ files
- Architectural decisions needed
- Security-critical code

### MCP Context Window Management

**CRITICAL**: Your 200k context window can shrink to 70k with too many tools enabled.

**Rule of thumb:**
- Have MCPs configured but keep <10 enabled per session
- Disable unused MCPs for the current task
- Prefer CLI + skills over heavy MCPs when possible

### Memory Persistence Across Sessions

When stopping work mid-session or hitting context limits:

1. Create a handoff summary file:
```
.planning/sessions/YYYY-MM-DD-handoff.md
```

2. Include:
   - What approaches worked (with evidence)
   - What was attempted but failed
   - What remains to do
   - Current blockers

3. Next session: Load the handoff file as context

---

## Skill & MCP Integration

### During Planning (`/gsd:plan-phase`)

**Context7 MCP** - Library documentation:
- React, Next.js, Supabase, shadcn/ui patterns
- Framework best practices

**Sequential Thinking MCP** - Complex analysis:
- Architectural decisions
- Multi-step problem decomposition

### During Execution (`/gsd:execute-phase`)

**Frontend Changes** → `/frontend-design` skill first

**Supabase Changes** → Use Supabase MCP
- **CRITICAL**: Always create migration files in `supabase/migrations/`

**n8n Workflow Changes** → Reference `docs/n8n-rfp-workflow-guide.md`

### During Verification (`/gsd:verify-work`)

**Browser Automation Tools:**

| Tool | Use For |
|------|---------|
| agent-browser | Quick visual checks, accessibility |
| chrome-devtools | Network, console, performance |
| playwright | Complex E2E flows, file uploads |

**Code Review Agents:**
- `code-reviewer` - Quality, bugs, security
- `code-architecture-reviewer` - Architectural decisions

---

## Subagent Delegation Patterns

### When to Delegate

Delegate to subagents when:
- Task is well-scoped and independent
- Can be completed with limited tools
- Frees main context for orchestration

### Delegation Guidelines

1. **Pass objective context**, not just the query
2. **Evaluate every return** - ask follow-ups before accepting
3. **Max 3 iteration cycles** per delegation
4. **Store outputs in files** for traceability

### Parallel Execution

For independent tasks, use parallel execution:
- Each task gets isolated context
- Results merge back to main branch
- Use git worktrees for code overlap

---

## Git Workflow

**GSD handles atomic commits automatically.** Each task gets its own commit.

**Commit message format:**
```
[phase-N] task description

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Always ask user before:**
- Pushing to remote
- Creating pull requests
- Force operations
- Commits (even if GSD suggests auto-commit)

**Conventional commits:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring
- `docs:` - Documentation
- `test:` - Test additions/changes

---

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router (React 19, TypeScript)
- **Backend**: Supabase (Auth, Postgres DB, Realtime, Storage)
- **Processing**: n8n workflows triggered via webhooks
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

**Server vs Client Components:**
- Data-fetching in Server Components
- Interactive elements in Client Components with `"use client"`
- Dashboard layout checks auth server-side

**Supabase Clients:**
- `lib/supabase/server.ts` - Server Components/Actions (async, cookies)
- `lib/supabase/browser.ts` - Client Components (singleton)

**RFP Processing Flow:**
1. User uploads PDF → Creates `rfp_upload_jobs` row (pending)
2. Server Action triggers n8n webhook (FormData with binary PDF)
3. n8n processes: extracts items → AI matches → inserts results
4. n8n updates job status to `completed`
5. Frontend subscribes to Realtime, auto-refreshes

### Database Tables
- `profiles` - Users with `approved_at` (null = pending)
- `artigos` - Inventory products (~20k items)
- `rfp_upload_jobs` - Job tracking (status: pending/processing/completed/failed)
- `rfp_items` - Extracted line items from RFPs
- `rfp_match_suggestions` - AI matches with confidence (0.0000-1.0000)

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
N8N_RFP_WEBHOOK_URL          # Triggers RFP processing
N8N_INVENTORY_WEBHOOK_URL    # Triggers inventory updates
N8N_EXPORT_EMAIL_WEBHOOK_URL # Triggers email exports
N8N_WEBHOOK_SECRET           # Optional auth header
```

---

## Important Conventions

- **UI Language**: Portuguese (Portugal) - all dashboard text, labels, messages
- **CSV Encoding**: UTF-8 with ISO-8859-1 fallback for Portuguese characters
- **Confidence Scores**: 4 decimal precision (e.g., 0.9523)
- **Auth Flow**: Registration → Admin approval via `/admin/users` → Dashboard access
- **Server Actions**: 10MB body limit for large CSV uploads
- **Migrations**: ALL schema changes require files in `supabase/migrations/`

---

## Anti-Patterns to Avoid

1. **Don't create mega-files** - Split into focused modules
2. **Don't mutate state** - Always return new objects
3. **Don't skip tests** - TDD is mandatory for features
4. **Don't hardcode values** - Use constants or env vars
5. **Don't ignore errors** - Handle all error cases
6. **Don't auto-commit** - Always ask user first
7. **Don't overload context** - Disable unused MCPs
8. **Don't skip verification** - Always run build + tests before marking complete

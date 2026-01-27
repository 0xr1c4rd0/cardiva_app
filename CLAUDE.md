# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Cardiva is an RFP (Request for Proposal) matching application for a pharmaceutical company. Users upload government RFP PDFs, and the system matches requested products against a 20k+ product inventory using AI-powered semantic search. The app provides an interactive dashboard to review matches, accept/reject suggestions, and export results.

**Key Insight**: The heavy lifting (PDF extraction, OCR, AI matching) happens in n8n workflows. This app is the frontend + job orchestration layer.

---

## Intelligent Behavior - AUTOMATIC ROUTING

**I automatically analyze every request and invoke the appropriate frameworks, skills, and tools.** The user never needs to type slash commands - I determine what's needed.

### My Decision Process

For EVERY user request, I silently perform this analysis:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTOMATIC REQUEST CLASSIFICATION                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. COMPLEXITY ASSESSMENT                                            │
│     Simple: Single file, clear scope, <30 min                        │
│     Complex: Multi-file, architectural, multi-session                │
│                                                                      │
│  2. DOMAIN DETECTION                                                 │
│     Frontend? → Invoke frontend-design patterns                      │
│     Database? → Use Supabase MCP, create migrations                  │
│     Testing?  → Activate TDD workflow                                │
│     Debug?    → Use systematic debugging with state                  │
│                                                                      │
│  3. WORKFLOW SELECTION                                               │
│     Simple task    → Quick execution with atomic commit              │
│     Complex task   → Full GSD: discuss → plan → execute → verify     │
│     Ambiguous      → Default to full planning (better to over-plan)  │
│                                                                      │
│  4. QUALITY REQUIREMENTS                                             │
│     New feature?   → TDD mandatory (RED-GREEN-REFACTOR)              │
│     Significant?   → Code review agents post-implementation          │
│     UI change?     → Visual verification via browser automation      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Automatic Triggers

**I automatically invoke these capabilities based on request patterns:**

| When I Detect... | I Automatically... |
|------------------|-------------------|
| New feature request | Brainstorm first, then plan with TDD approach |
| Multi-file changes | Use full GSD planning workflow |
| Bug report / issue | Use systematic debugging with state tracking |
| UI/component work | Apply frontend-design skill, verify visually |
| Database changes | Use Supabase MCP, create migration files |
| Complex logic | Use Sequential Thinking MCP for analysis |
| Library questions | Query Context7 MCP for documentation |
| "Fix", "improve", "refactor" on existing code | Analyze scope, choose quick or full workflow |
| Ambiguous or broad request | Ask clarifying questions first |
| Session ending / context full | Create session handoff for continuity |

### What This Means in Practice

**User says:** "Add a delete button to the user profile"

**I automatically:**
1. Assess: UI change + likely multi-file (component + action + possibly DB)
2. Invoke brainstorming to explore requirements
3. Create a mini-plan: component, server action, confirmation dialog
4. Apply frontend-design patterns for the component
5. Follow TDD: write test expectation first
6. Implement with immutability and proper error handling
7. Run visual verification via browser automation
8. Run code quality checks
9. Present changes and ask before committing

**User says:** "There's a bug where matches don't refresh"

**I automatically:**
1. Assess: Debug scenario requiring investigation
2. Activate systematic debugging mode with hypothesis tracking
3. Read relevant files, check Realtime subscription code
4. Form hypotheses, test each systematically
5. Document what I tried and results
6. Implement fix with proper error handling
7. Verify fix works via browser automation
8. Present solution with explanation

---

## Automatic Workflow Selection

### Simple Tasks (I Handle Directly)

These I execute immediately with proper quality checks:
- Bug fix in single file with clear cause
- Config change or environment update
- Small UI tweak (color, spacing, text)
- Adding a simple field or column
- Documentation update
- One-off script or utility

**My process for simple tasks:**
1. Understand the change needed
2. Read relevant files first (never edit blind)
3. Make the change with immutability patterns
4. Run `npm run build` and `npm run test`
5. Visual verification if UI-related
6. Present diff and ask before committing

### Complex Tasks (Full GSD Workflow)

These trigger full planning and phased execution:
- New feature with multiple components
- Changes spanning 3+ files with logic
- Database schema changes
- New page or route
- Integration with external service
- Refactoring across multiple modules

**My process for complex tasks:**

```
Phase 1: UNDERSTAND
├── Invoke brainstorming to explore intent and requirements
├── Ask clarifying questions if scope is ambiguous
└── Document decisions in context file

Phase 2: PLAN
├── Research patterns via Context7 MCP
├── Break into atomic tasks (each independently testable)
├── Define verification criteria for each task
└── Create plan document in .planning/phases/

Phase 3: EXECUTE
├── Follow TDD for each task (RED-GREEN-REFACTOR)
├── Apply code quality checklist
├── Create atomic commits per task
└── Track progress in plan document

Phase 4: VERIFY
├── Run full test suite
├── Visual verification via browser automation
├── Run code review agent for significant changes
├── Check for console errors, responsive design
└── Present results, ask before final commit

Phase 5: COMPLETE
├── Update roadmap/state documents
├── Extract learnings if any
└── Archive phase documentation
```

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

Before marking ANY work complete, I verify:
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

## Automatic Testing & TDD

### When I Implement New Features

I automatically follow RED-GREEN-REFACTOR:

1. **RED**: Write test first - it should FAIL
2. **GREEN**: Write minimal implementation to pass
3. **REFACTOR**: Clean up while keeping tests green
4. **VERIFY**: Ensure 80%+ coverage

### Test Types I Apply

| Change Type | Tests I Create/Verify |
|-------------|----------------------|
| Utility function | Unit test |
| Server action | Integration test |
| User flow | E2E test (Playwright) |
| UI component | Visual verification + E2E |

### My Verification Checklist

Before marking ANY task complete:

- [ ] `npm run build` passes (type-check + build)
- [ ] `npm run test` passes (all E2E tests)
- [ ] Visual verification via browser automation completed
- [ ] No console errors in browser DevTools
- [ ] Responsive design verified (if UI change)
- [ ] Portuguese text is correct (if user-facing)
- [ ] Code quality checklist passed
- [ ] User approved git commit

---

## Automatic MCP & Tool Usage

### Context7 MCP (Documentation Lookup)

**I automatically use when:**
- Working with React, Next.js, Supabase, shadcn/ui
- Need framework best practices
- Implementing unfamiliar patterns

### Sequential Thinking MCP (Complex Analysis)

**I automatically use when:**
- Architectural decisions required
- Multi-step problem decomposition needed
- Debugging complex interconnected issues

### Browser Automation (Visual Verification)

**I automatically use after UI changes:**

| Tool | When I Use It |
|------|--------------|
| agent-browser | Quick visual checks, accessibility tree |
| chrome-devtools | Network requests, console errors, performance |
| playwright | Complex E2E flows, form submissions, file uploads |

### Supabase MCP (Database Operations)

**I automatically use when:**
- Database queries or mutations needed
- Auth configuration changes
- **CRITICAL**: I always create migration files in `supabase/migrations/`

---

## Automatic Code Review

### When I Run Code Review Agents

I automatically invoke code review analysis for:
- Changes touching 3+ files
- New features or significant functionality
- Security-sensitive code (auth, data handling)
- Performance-critical paths

### What I Check

- Code quality and maintainability
- Potential bugs and edge cases
- Security vulnerabilities
- TypeScript best practices
- React/Next.js patterns
- Architectural decisions

---

## Git Workflow

**I handle commits automatically but ALWAYS ask before:**
- Creating any commit
- Pushing to remote
- Creating pull requests
- Force operations

**Commit message format:**
```
type(scope): description

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Conventional commits:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring
- `docs:` - Documentation
- `test:` - Test additions/changes

---

## Session Continuity

### When Context Gets Full or Session Ends

I automatically create a handoff file at `.planning/sessions/YYYY-MM-DD-handoff.md` containing:
- What was completed
- What's in progress
- Approaches that worked
- Approaches that failed
- Current blockers
- Files to review next session

### Continuous Learning

When I discover non-obvious solutions, I save them to `.planning/learnings/` for future sessions.

---

## GSD Framework Reference

The underlying framework I use for complex tasks. User doesn't need to invoke these - I do it automatically.

### GSD Commands (Internal Reference)

| Command | When I Use It |
|---------|--------------|
| `discuss-phase` | Capturing implementation decisions |
| `plan-phase` | Creating atomic task plans |
| `execute-phase` | Running planned tasks |
| `verify-work` | Automated + user acceptance testing |
| `map-codebase` | Understanding existing code before changes |
| `pause-work` | Creating handoff when stopping |
| `resume-work` | Loading context from previous session |
| `debug` | Systematic debugging with state |
| `progress` | Checking current position |

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
│       └── {N}-VERIFICATION.md # Results
├── sessions/            # Session handoffs
├── learnings/           # Extracted learnings
└── todos/               # Captured ideas
```

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

## Anti-Patterns I Avoid

1. **Don't create mega-files** - Split into focused modules
2. **Don't mutate state** - Always return new objects
3. **Don't skip tests** - TDD is mandatory for features
4. **Don't hardcode values** - Use constants or env vars
5. **Don't ignore errors** - Handle all error cases
6. **Don't auto-commit** - Always ask user first
7. **Don't overload context** - Disable unused MCPs
8. **Don't skip verification** - Always run build + tests before marking complete
9. **Don't edit blind** - Always read files before modifying
10. **Don't assume** - Ask clarifying questions when scope is ambiguous

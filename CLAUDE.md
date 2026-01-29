# CLAUDE.md - Cardiva RFP Matching App

## Project Overview

Cardiva is an RFP (Request for Proposal) matching application for a pharmaceutical company. Users upload government RFP PDFs, and the system matches requested products against a 20k+ product inventory using AI-powered semantic search. The app provides an interactive dashboard to review matches, accept/reject suggestions, and export results.

**Key Insight**: The heavy lifting (PDF extraction, OCR, AI matching) happens in n8n workflows. This app is the frontend + job orchestration layer.

---

## Installed Frameworks

I have access to four powerful frameworks. I automatically invoke the right commands based on your request—you never need to type slash commands.

| Framework | Purpose |
|-----------|---------|
| **GSD** | Full project lifecycle, spec-driven development, phases, subagents |
| **Superpowers** | Design brainstorming, TDD enforcement, plan-first approach |
| **Everything Claude Code** | Code review agents, security audit, specialized tools |
| **Ralph Loop** | Autonomous iteration until completion (overnight work) |

---

## Installed Skills (Auto-Activated)

Skills are specialized knowledge modules that auto-activate based on context. They enhance code quality without explicit invocation.

| Skill | Purpose | Auto-Activates When |
|-------|---------|---------------------|
| **vercel-react-best-practices** | React/Next.js performance optimization (57 rules) | Writing/reviewing React components, data fetching, bundle optimization |
| **tailwind-design-system** | CVA components, design tokens, responsive patterns | Creating UI components, working with Tailwind CSS |
| **ui-ux-pro-max** | UI/UX design intelligence (50 styles, 97 palettes) | Designing pages, choosing colors/typography, building dashboards |
| **writing-clearly-and-concisely** | Clear prose using Strunk's principles | Writing documentation, commit messages, UI text, error messages |
| **agentation** | Development annotation toolbar | Setup on request (not auto-activated) |

### Skill Auto-Activation Rules

**React/Next.js Development** (vercel-react-best-practices):
- Creating React components → Apply waterfall elimination, bundle optimization
- Data fetching → Use parallel fetching, Suspense boundaries, caching
- Performance issues → Check re-render optimization, rendering performance
- Code review → Validate against 57 performance rules by priority

**UI Component Development** (tailwind-design-system + ui-ux-pro-max):
- Creating new components → Use CVA pattern, semantic color tokens
- Building pages/dashboards → Generate design system first via:
  ```bash
  python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<product> <style>" --design-system
  ```
- Styling decisions → Reference design tokens, not raw Tailwind classes
- Dark mode → Use CSS variables pattern from tailwind-design-system

**Writing for Humans** (writing-clearly-and-concisely):
- Documentation/README → Use active voice, omit needless words
- Commit messages → Be specific, avoid AI-speak ("leverage", "robust", "seamless")
- Error messages → Clear, positive framing, specific language
- UI text → Concrete, not vague; definite, not general

### Skill Integration with Frameworks

**GSD Workflow + Skills:**
```
/gsd:plan-phase N     # Plan includes skill considerations
    ↓
Skills auto-apply     # Performance rules, design patterns, clear writing
    ↓
/gsd:verify-work N    # Verification includes skill compliance
```

**UI/UX Work Enhanced Flow:**
```
1. Generate design system (ui-ux-pro-max)
   python3 .agents/skills/ui-ux-pro-max/scripts/search.py "dashboard analytics" --design-system -p "Cardiva"

2. Build components (tailwind-design-system)
   - Use CVA for variants
   - Semantic color tokens
   - forwardRef pattern

3. Optimize performance (vercel-react-best-practices)
   - Parallel data fetching
   - Bundle optimization
   - Re-render prevention
```

### Skill Reference Files

| Skill | Key Files | When to Read |
|-------|-----------|--------------|
| vercel-react-best-practices | `rules/async-*.md`, `rules/bundle-*.md` | Performance issues |
| tailwind-design-system | `SKILL.md` (complete patterns) | Creating components |
| ui-ux-pro-max | Run CLI with `--domain ux` | UX best practices |
| writing-clearly-and-concisely | `elements-of-style/03-*.md` | Active voice, concision |

### Pre-Delivery Checklist (Skill-Enhanced)

Before delivering UI code, verify against skills:

**From ui-ux-pro-max:**
- [ ] No emojis as icons (use SVG from Lucide)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states don't cause layout shift
- [ ] Light/dark mode contrast verified
- [ ] Touch targets ≥44x44px

**From vercel-react-best-practices:**
- [ ] No request waterfalls (parallel fetching)
- [ ] Dynamic imports for heavy components
- [ ] Proper Suspense boundaries
- [ ] Memoization where beneficial

**From tailwind-design-system:**
- [ ] Using semantic colors (`primary`, not `blue-500`)
- [ ] CVA pattern for component variants
- [ ] Proper focus states for accessibility

**From writing-clearly-and-concisely:**
- [ ] Active voice in UI text
- [ ] No AI-speak ("leverage", "robust", "seamless")
- [ ] Specific, concrete language

---

## Command Routing (Auto-Invocation)

When you make a request, I classify it and invoke the appropriate commands automatically.

### Quick Reference

| You Say | I Run |
|---------|-------|
| "Build X" / "New feature" | `/gsd:new-milestone` or `/superpowers:brainstorm` |
| "Quick fix" / "Small change" | `/gsd:quick` |
| "Bug" / "Not working" | `/gsd:debug` |
| "Continue" / "Resume" | `/gsd:resume-work` → `/gsd:progress` |
| "Pause" / "Stopping" | `/gsd:pause-work` |
| "Review this" | `/code-review` |
| "Brainstorm" / "Design" | `/superpowers:brainstorm` |
| "Plan this" | `/gsd:plan-phase N` or `/superpowers:write-plan` |
| "Execute" / "Build it" | `/gsd:execute-plan` |
| "Verify" / "Test it" | `/gsd:verify-work N` |
| "Run overnight" / "Autonomous" | `/ralph-loop` |
| "Where am I?" | `/gsd:progress` |
| "Map the codebase" | `/gsd:map-codebase` |

### Decision Tree

```
User Request
    │
    ├─► "overnight" / "autonomous" / "ralph" / "loop until"
    │       └─► /ralph-loop "<task>" --max-iterations N
    │
    ├─► "brainstorm" / "design" / "explore" / "think through"
    │       └─► /superpowers:brainstorm
    │
    ├─► "review" / "check code" / "any issues"
    │       └─► /code-review
    │
    ├─► "bug" / "error" / "not working" / "broken"
    │       └─► /gsd:debug
    │
    ├─► "continue" / "resume" / "where were we"
    │       └─► /gsd:resume-work → /gsd:progress
    │
    ├─► "pause" / "stop" / "taking a break"
    │       └─► /gsd:pause-work
    │
    ├─► Small scope (single file, config, tweak)?
    │       └─► /gsd:quick
    │
    ├─► New project from scratch?
    │       └─► /gsd:new-project
    │
    ├─► New feature on existing project?
    │       └─► /gsd:new-milestone OR /superpowers:brainstorm
    │
    ├─► Inside active GSD workflow?
    │   ├─► Need to plan? → /gsd:plan-phase N
    │   ├─► Need to execute? → /gsd:execute-plan
    │   └─► Need to verify? → /gsd:verify-work N
    │
    └─► Ambiguous?
            └─► Ask clarifying question first
```

---

## Detailed Command Routing

### 🆕 New Project / Major Feature

**Triggers:** "build", "create", "new project", "new feature", "implement", "add [complex thing]"

**Decision:**
- Starting from scratch → `/gsd:new-project`
- Adding to existing project → `/gsd:new-milestone`
- Need design exploration first → `/superpowers:brainstorm`

**Full GSD workflow:**
```
/gsd:new-project          # Extract requirements through questioning
    ↓
/gsd:create-roadmap       # Break into phases
    ↓
/gsd:discuss-phase 1      # Clarify phase scope
    ↓
/gsd:plan-phase 1         # Create atomic task plans (2-3 tasks max)
    ↓
/gsd:execute-plan         # Subagent implements with fresh 200k context
    ↓
/gsd:verify-work 1        # User acceptance testing
```

### ⚡ Quick Tasks

**Triggers:** "quick fix", "small change", "just update", "config change", "tweak", "minor"

**Command:** `/gsd:quick`

Skips full planning. Provides atomic commits with state tracking. Use for: bug fixes, small features, config changes, one-off tasks.

### 🐛 Bug Investigation

**Triggers:** "bug", "not working", "broken", "error", "fails", "issue", "debug"

**Command:** `/gsd:debug`

Systematic debugging with hypothesis tracking and state preservation.

### 🧠 Design / Brainstorming

**Triggers:** "brainstorm", "think through", "explore options", "design", "what's the best approach"

**Command:** `/superpowers:brainstorm`

Socratic questioning to refine ideas, explore alternatives, validate design in digestible chunks before any code is written.

### 📋 Planning

**Triggers:** "plan", "break down", "create plan", "implementation plan"

**Commands:**
- Inside GSD workflow → `/gsd:plan-phase N`
- Standalone planning → `/superpowers:write-plan` or `/plan`

### ▶️ Execution

**Triggers:** "execute", "implement", "build it", "go", "start coding"

**Commands:**
- GSD plan exists → `/gsd:execute-plan` or `/gsd:execute-phase N`
- Superpowers plan exists → `/superpowers:execute-plan`

Each task runs in a fresh subagent context—200k tokens purely for implementation, zero degradation.

### ✅ Verification

**Triggers:** "verify", "check", "test", "does it work", "UAT"

**Command:** `/gsd:verify-work [N]`

User acceptance testing with evidence capture. If issues found → `/gsd:plan-fix`

### 🔍 Code Review

**Triggers:** "review", "check my code", "code review", "is this good"

**Command:** `/code-review`

**Available agents (spawn via Task):**
- `code-reviewer` - Quality and patterns
- `security-reviewer` - Vulnerability analysis
- `refactor-cleaner` - Dead code cleanup
- `build-error-resolver` - Build errors
- `e2e-runner` - Playwright E2E testing

### 🗺️ Codebase Understanding

**Triggers:** "understand codebase", "map the code", "brownfield", "existing project"

**Command:** `/gsd:map-codebase`

Creates documentation in `.planning/codebase/`: STACK.md, ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, INTEGRATIONS.md, CONCERNS.md

### 🤖 Autonomous / Overnight Work

**Triggers:** "run overnight", "autonomous", "keep going until done", "ralph", "loop"

**Command:** `/ralph-loop "<task>" --completion-promise "DONE" --max-iterations N`

**Example:**
```
/ralph-loop "Implement all PRD items. Output <promise>DONE</promise> when complete" --max-iterations 50
```

**Safety:** Always set `--max-iterations`. Cancel with `/ralph-loop:cancel-ralph`

### 🔄 Session Management

| Action | Command |
|--------|---------|
| Resume previous work | `/gsd:resume-work` |
| Check progress | `/gsd:progress` |
| Pause and create handoff | `/gsd:pause-work` |

### 📊 Phase Management

| Action | Command |
|--------|---------|
| Add phase | `/gsd:add-phase` |
| Insert urgent work | `/gsd:insert-phase N "description"` |
| Remove phase | `/gsd:remove-phase N` |
| Research domain | `/gsd:research-phase N` |
| Check assumptions | `/gsd:list-phase-assumptions N` |

### 🏁 Milestone Management

| Action | Command |
|--------|---------|
| Ship milestone | `/gsd:complete-milestone` |
| Start next version | `/gsd:new-milestone` |
| Discuss next milestone | `/gsd:discuss-milestone` |

---

## Complete Command Reference

### GSD Commands
```
/gsd:new-project              # Start new project with questioning
/gsd:create-roadmap           # Create phases and state tracking
/gsd:map-codebase             # Analyze existing codebase (brownfield)
/gsd:discuss-phase N          # Gather context before planning
/gsd:research-phase N         # Deep ecosystem research
/gsd:list-phase-assumptions N # See what Claude assumes
/gsd:plan-phase N             # Generate task plans for phase
/gsd:execute-plan             # Run plan via subagent
/gsd:execute-phase N          # Execute specific phase
/gsd:verify-work N            # User acceptance testing
/gsd:plan-fix                 # Plan fixes for UAT issues
/gsd:progress                 # Where am I? What's next?
/gsd:quick                    # Fast path for small tasks
/gsd:debug                    # Systematic debugging
/gsd:add-phase                # Append phase to roadmap
/gsd:insert-phase N           # Insert urgent work
/gsd:remove-phase N           # Remove future phase
/gsd:complete-milestone       # Ship it, prep next version
/gsd:discuss-milestone        # Gather context for next milestone
/gsd:new-milestone            # Create new milestone with phases
/gsd:pause-work               # Create handoff when stopping
/gsd:resume-work              # Restore from last session
/gsd:help                     # Show all commands
/gsd:update                   # Update GSD
```

### Superpowers Commands
```
/superpowers:brainstorm       # Interactive design refinement
/superpowers:write-plan       # Create implementation plan
/superpowers:execute-plan     # Execute plan in batches with TDD
/superpowers:help             # Show help
```

### Everything Claude Code Commands
```
/plan                         # Implementation planning
/code-review                  # Quality and security review
/learn                        # Extract patterns from codebase
```

**Agents:** `planner`, `architect`, `tdd-guide`, `code-reviewer`, `security-reviewer`, `build-error-resolver`, `e2e-runner`, `refactor-cleaner`, `doc-updater`

### Ralph Loop Commands
```
/ralph-loop "<prompt>" --completion-promise "X" --max-iterations N
/ralph-loop:cancel-ralph      # Cancel active loop
/ralph-loop:help              # Show help
```

---

## Framework Selection Guide

| Scenario | Best Framework | Why |
|----------|----------------|-----|
| New greenfield project | GSD | Full spec-driven workflow |
| New feature (multi-file) | GSD | Structured phases and subagents |
| Quick fix / config | GSD Quick | Fast path, atomic commits |
| Bug investigation | GSD Debug | Systematic hypothesis tracking |
| Design exploration | Superpowers | Socratic questioning |
| TDD enforcement | Superpowers | Strict red-green-refactor |
| Code review | Everything Claude Code | Dedicated review agents |
| Security audit | Everything Claude Code | Security reviewer agent |
| Autonomous overnight | Ralph Loop | Runs until completion |

### Combining Frameworks

```
# Design + GSD Execution
/superpowers:brainstorm     # Explore design
/gsd:new-milestone          # Create from design
/gsd:plan-phase 1           # Plan implementation
/gsd:execute-plan           # Execute

# GSD + Code Review
/gsd:execute-plan           # Implement
/code-review                # Review with agent
/gsd:verify-work            # Final verification

# Ralph for Long Tasks
/gsd:plan-phase 1           # Create plan
/ralph-loop "Execute plan" --max-iterations 30
```

---

## Tech Stack

- **Framework**: Next.js 16 with App Router (React 19, TypeScript)
- **Backend**: Supabase (Auth, Postgres DB, Realtime, Storage)
- **Processing**: n8n workflows triggered via webhooks
- **UI**: shadcn/ui (Radix primitives) + Tailwind CSS 4
- **State**: Zustand (client), React Query (server), Nuqs (URL params)
- **Testing**: Playwright E2E

---

## Architecture

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

## Code Standards

### Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate:

```typescript
// ❌ WRONG: Mutation
function updateUser(user: User, name: string) {
  user.name = name
  return user
}

// ✅ CORRECT: Immutability
function updateUser(user: User, name: string): User {
  return { ...user, name }
}
```

### Error Handling

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

### Input Validation

ALWAYS validate user input with Zod:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  quantity: z.number().int().min(1)
})

const validated = schema.parse(input)
```

### File Organization

- **Many small files > Few large files**
- 200-400 lines typical, 800 max per file
- High cohesion, low coupling
- Organize by feature/domain, not by type

### Security

- No hardcoded secrets - use environment variables
- Validate ALL user inputs before processing
- Parameterized queries only (Supabase handles this)
- CSRF protection via Server Actions
- Never expose internal error details to users

---

## Quality Checklist

Before marking ANY work complete:

- [ ] `bun run build` passes (type-check + build)
- [ ] `bun test` passes (all E2E tests)
- [ ] No console errors in browser DevTools
- [ ] Code is readable with clear naming
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling with try/catch
- [ ] No console.log in production code
- [ ] No hardcoded values (use constants/env vars)
- [ ] Immutable patterns used throughout
- [ ] Portuguese text correct (if user-facing)
- [ ] Responsive design verified (if UI change)
- [ ] User approved git commit

---

## Development Commands

```bash
bun dev              # Start dev server (port 3000)
bun run build        # Production build (includes type-check)
bun test             # Run all Playwright E2E tests
bun test:ui          # Interactive Playwright test UI
bun test:headed      # Run tests with visible browser
```

---

## Conventions

- **UI Language**: Portuguese (Portugal) - all dashboard text, labels, messages
- **CSV Encoding**: UTF-8 with ISO-8859-1 fallback for Portuguese characters
- **Confidence Scores**: 4 decimal precision (e.g., 0.9523)
- **Auth Flow**: Registration → Admin approval via `/admin/users` → Dashboard access
- **Server Actions**: 10MB body limit for large CSV uploads
- **Migrations**: ALL schema changes require files in `supabase/migrations/`

---

## Git Workflow

**Always ask before:**
- Creating any commit
- Pushing to remote
- Force operations

**Commit format:**
```
type(scope): description

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:** `feat:`, `fix:`, `refactor:`, `docs:`, `test:`

---

## Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| Create mega-files | Split into focused modules |
| Mutate state | Return new objects |
| Skip tests | TDD is mandatory for features |
| Hardcode values | Use constants or env vars |
| Ignore errors | Handle all error cases |
| Auto-commit | Always ask user first |
| Edit blind | Always read files before modifying |
| Assume scope | Ask clarifying questions when ambiguous |
| Jump to `/gsd:execute-plan` | Run `/gsd:discuss-phase` → `/gsd:plan-phase` first |
| Use Ralph for quick tasks | Use `/gsd:quick` instead |
| Skip verification | Always run `/gsd:verify-work` after execution |
| Start feature without context | Run `/gsd:map-codebase` first for brownfield |
| Let context fill up | Watch context, run `/gsd:pause-work` proactively |

---

## Help Commands

| Framework | Command |
|-----------|---------|
| GSD | `/gsd:help` |
| Superpowers | `/superpowers:help` |
| Ralph Loop | `/ralph-loop:help` |
| All available | `/help` |
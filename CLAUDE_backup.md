# CLAUDE.md - Cardiva RFP Matching App

## Project Overview

Cardiva is an RFP (Request for Proposal) matching application for a pharmaceutical company. Users upload government RFP PDFs, and the system matches requested products against a 20k+ product inventory using AI-powered semantic search. The app provides an interactive dashboard to review matches, accept/reject suggestions, and export results.

**Key Insight**: The heavy lifting (PDF extraction, OCR, AI matching) happens in n8n workflows. This app is the frontend + job orchestration layer.

---

## Framework Installation & Updates

### Initial Setup

**GSD:**
```bash
npx get-shit-done-cc --claude --global
```

**Everything Claude Code:**
```bash
/plugin install https://github.com/affaan-m/everything-claude-code
```

**Superpowers:**
```bash
/plugin install https://skills.sh/obra/superpowers
```

**Skills:**
```bash
/plugin install https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
/plugin install https://skills.sh/softaworks/agent-toolkit/writing-clearly-and-concisely
/plugin install https://skills.sh/benjitaylor/agentation/agentation
/plugin install https://skills.sh/wshobson/agents/tailwind-design-system
/plugin install https://skills.sh/nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max
```

**Ralph Loop:**
```bash
/plugin install <ralph-loop-url>
```

### Updates

**GSD:**
```bash
/gsd:update
```

**Everything Claude Code & Skills:**
Restart Claude Code after plugin updates to apply changes.

### Recommended Claude Code Flags

For frictionless automation (use with caution):
```bash
claude --dangerously-skip-permissions
```

This eliminates approval prompts for GSD automation.

---

## Installed Frameworks

I have access to four powerful frameworks. I automatically invoke the right commands based on your request—you never need to type slash commands.

| Framework | Purpose |
|-----------|---------|
| **GSD** | Full project lifecycle, spec-driven development, phases, subagents, context engineering |
| **Superpowers** | Design brainstorming, TDD enforcement, plan-first approach |
| **Everything Claude Code** | Code review agents, security audit, TDD workflow, continuous learning |
| **Ralph Loop** | Autonomous iteration until completion (overnight work) |

---

## Installed Skills (Auto-Activated)

Skills are specialized knowledge modules that auto-activate based on context. They enhance code quality without explicit invocation.

| Skill | Purpose | Auto-Activates When |
|-------|---------|---------------------|
| **vercel-react-best-practices** | React/Next.js performance optimization (57 rules by priority) | Writing/reviewing React components, data fetching, bundle optimization |
| **tailwind-design-system** | CVA components, design tokens, responsive patterns, dark mode | Creating UI components, working with Tailwind CSS |
| **ui-ux-pro-max** | UI/UX design intelligence (50+ styles, 97 palettes, 57 font pairings, 99 UX guidelines) | Designing pages, choosing colors/typography, building dashboards |
| **writing-clearly-and-concisely** | Clear prose using Strunk's principles, avoid AI-speak patterns | Writing documentation, commit messages, UI text, error messages |
| **agentation** | Development annotation toolbar (bottom-right corner)<br/>**Requirements:** React 18+, Next.js<br/>**Auto-disables in production** (NODE_ENV check) | Setup on request (not auto-activated) |

### Skill Auto-Activation Rules

**React/Next.js Development** (vercel-react-best-practices):
- Creating React components → Apply waterfall elimination, bundle optimization
- Data fetching → Use parallel fetching, Suspense boundaries, caching
- Performance issues → Check re-render optimization, rendering performance
- Code review → Validate against 57 performance rules by priority (P0, P1, P2)

**UI Component Development** (tailwind-design-system + ui-ux-pro-max):
- Creating new components → Use CVA pattern, semantic color tokens
- Building pages/dashboards → Generate design system FIRST (mandatory):
  ```bash
  python3 .agents/skills/ui-ux-pro-max/scripts/search.py "<product> <style>" --design-system -p "Cardiva"
  ```
- Styling decisions → Reference design tokens, not raw Tailwind classes
- Dark mode → Use CSS variables pattern from tailwind-design-system

**Writing for Humans** (writing-clearly-and-concisely):
- Documentation/README → Use active voice, omit needless words
- Commit messages → Be specific, avoid AI-speak patterns (see below)
- Error messages → Clear, positive framing, specific language
- UI text → Concrete, not vague; definite, not general
- Keep related words together
- Place emphatic words at sentence end

**AI-Speak Patterns to AVOID:**
- **Puffery**: pivotal, crucial, vital, testament, groundbreaking
- **Empty "-ing" phrases**: ensuring reliability, showcasing features, leveraging
- **Promotional adjectives**: seamless, robust, revolutionary, cutting-edge
- **Overused vocabulary**: delve, multifaceted, tapestry, unlock, harness
- **Formatting excess**: Too many bullets, excessive bold text

**Examples:**
❌ "Leveraging robust authentication to ensure seamless user experience"
✅ "Users log in with email and password"

❌ "This pivotal feature showcases our groundbreaking approach"
✅ "This feature processes payments in real-time"

### Tailwind Design System Patterns

**Design Token Hierarchy:**
```
Brand Token → Semantic Token → Component Token
blue-500    → primary        → button-bg
```

**Component Architecture Layers:**
1. Base styles (foundation)
2. Variants (visual variations)
3. Sizes (scale options)
4. States (hover, focus, disabled)
5. Overrides (component-specific)

**CVA Pattern (Type-Safe Variants):**
```typescript
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md", // base
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
      },
    },
  }
)
```

**Essential Utilities:**
- `cn()` - Merge Tailwind classes (clsx + tailwind-merge)
- `focusRing` - Reusable focus-visible styling
- `disabled` - Disabled state utility

**DO's:**
- ✅ Use CSS variables for runtime theming
- ✅ Compose with CVA for type safety
- ✅ Employ semantic colors (primary, not blue-500)
- ✅ Forward refs for composition
- ✅ Include ARIA attributes and focus states

**DON'Ts:**
- ❌ Arbitrary values (extend theme instead)
- ❌ Nest @apply directives
- ❌ Skip keyboard focus states
- ❌ Hardcode colors
- ❌ Test only light mode (test both themes)

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
⚠️ ALWAYS generate design system FIRST before building any UI

1. Generate design system (ui-ux-pro-max) - MANDATORY FIRST STEP
   python3 .agents/skills/ui-ux-pro-max/scripts/search.py "dashboard analytics" --design-system -p "Cardiva"

   This provides:
   - 50+ UI styles to choose from
   - 97 color palettes (industry-specific: SaaS, e-commerce, healthcare, fintech)
   - 57 font pairings from Google Fonts
   - 99 UX guidelines by priority

2. Build components (tailwind-design-system)
   Architecture: Base styles → Variants → Sizes → States → Overrides

   - CVA for type-safe variants
   - Design token hierarchy: brand → semantic → component
   - Semantic colors (`primary`, NEVER `blue-500`)
   - forwardRef pattern for composition
   - cn() utility for class merging

3. Apply UX rules (ui-ux-pro-max)
   - No emojis as icons (use Lucide SVG)
   - Touch targets ≥44x44px
   - Hover states without layout shift
   - ARIA attributes for accessibility
   - Light/dark mode contrast verified (4.5:1 minimum)

4. Optimize performance (vercel-react-best-practices)
   - Parallel data fetching (eliminate waterfalls)
   - Dynamic imports for heavy components (>50KB)
   - Proper Suspense boundaries
   - Memoization where beneficial
```

### Skill CLI Tools

Some skills provide CLI tools for enhanced workflows:

**ui-ux-pro-max:**
```bash
# Generate design system (do this FIRST before building UI)
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "SaaS dashboard" --design-system -p "Cardiva"

# Search specific domain
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "accessibility" --domain ux

# Search with specific stack
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "button variants" --stack html-tailwind
```

**Available Domains:**
- `ux` - UX guidelines (99 rules)
- `styles` - UI styles (50+ options)
- `palettes` - Color palettes (97 options)
- `fonts` - Font pairings (57 options)
- `charts` - Chart types (25 options)

### Skill Reference Files

| Skill | Key Files | When to Read |
|-------|-----------|--------------|
| vercel-react-best-practices | `rules/async-*.md`, `rules/bundle-*.md` | Performance issues |
| tailwind-design-system | `SKILL.md` (complete patterns) | Creating components |
| ui-ux-pro-max | Run CLI with `--domain ux` | UX best practices |
| writing-clearly-and-concisely | `elements-of-style/03-*.md` | Active voice, concision |

### Pre-Delivery Checklist (Skill-Enhanced)

Before delivering UI code, verify against skills:

**From ui-ux-pro-max (Critical UX Rules):**
- [ ] No emojis as icons (use SVG from Lucide)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states don't cause layout shift
- [ ] Light/dark mode contrast verified (4.5:1 minimum)
- [ ] Touch targets ≥44x44px (mobile accessibility)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Loading states shown for async operations
- [ ] Error states are clear and actionable
- [ ] Empty states guide users to action

**From vercel-react-best-practices (Performance):**
- [ ] No request waterfalls (parallel fetching)
- [ ] Dynamic imports for heavy components (>50KB)
- [ ] Proper Suspense boundaries
- [ ] Memoization where beneficial (expensive calculations)
- [ ] Images optimized (next/image with proper sizing)

**From tailwind-design-system (Architecture):**
- [ ] Using semantic colors (`primary`, not `blue-500`)
- [ ] CVA pattern for component variants (type-safe)
- [ ] Proper focus states for accessibility (focus-visible)
- [ ] forwardRef used for composition
- [ ] cn() utility for class merging

**From writing-clearly-and-concisely (Prose):**
- [ ] Active voice in UI text ("Save changes" not "Changes will be saved")
- [ ] No AI-speak ("leverage", "robust", "seamless", "showcase")
- [ ] Specific, concrete language (not vague or general)
- [ ] Positive framing ("Enter password" not "Don't leave password empty")

---

## Token Optimization & Context Management

### Context Rot Problem

As Claude's context window fills, response quality degrades ("context rot"). Both frameworks solve this differently:

**GSD Solution:**
- Breaks work into phases with fresh context per executor
- Main session stays at 30-40% context usage
- Executors get full 200k tokens for implementation
- Size-limited state files prevent bloat

**Everything Claude Code Solution:**
- Model selection strategies (Haiku for simple tasks, Opus for complex)
- Specialized agents with limited tool access
- Iterative retrieval pattern refines context progressively

### MCP Warning ⚠️

**CRITICAL:** Don't enable all MCPs at once. Your 200k context window can shrink to 70k with too many tools enabled.

**Best Practice:**
- Enable only MCPs you're actively using
- Disable unused integrations
- Monitor context usage with `/gsd:progress`

### Context Budget Recommendations

| Task Type | Recommended Context | Framework |
|-----------|---------------------|-----------|
| Simple bug fix | <30k tokens | GSD Quick |
| Feature planning | 40-60k tokens | GSD discuss + plan |
| Feature execution | Fresh 200k per task | GSD execute |
| Code review | 50-80k tokens | Everything Claude Code |
| Security audit | 60-100k tokens | Everything Claude Code |

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
| "TDD" / "Write tests" | `/tdd` |
| "Build errors" | `/build-fix` |

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
    ├─► "TDD" / "write tests first"
    │       └─► /tdd
    │
    ├─► "build errors" / "build failing"
    │       └─► /build-fix
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

**How It Works:**
1. **Understanding Phase** - Examines project state (files, commits), asks ONE question at a time
2. **Exploration Phase** - Presents 2-3 approaches with trade-offs and recommendations
3. **Design Presentation** - Delivers design in bite-sized sections (200-300 words), validates each before continuing
4. **Documentation** - Writes validated designs to `.planning/` with timestamps
5. **Optional** - Can setup git worktrees and create implementation plans

**Key Characteristics:**
- Incremental validation (no big reveals)
- Ruthless YAGNI (eliminates unnecessary features)
- Multiple-choice questions when practical
- Focuses on purpose, constraints, success metrics

**When to Use:**
- Need to explore alternatives before committing to implementation
- Unclear requirements that need clarification
- Want to validate design before writing code
- Complex features where approach matters

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
| Plan milestone gaps | `/gsd:plan-milestone-gaps` |

### 🏁 Milestone Management

| Action | Command |
|--------|---------|
| Audit milestone | `/gsd:audit-milestone` |
| Ship milestone | `/gsd:complete-milestone` |
| Start next version | `/gsd:new-milestone [name]` |
| Discuss next milestone | `/gsd:discuss-milestone` |

---

## GSD Framework Deep Dive

### Core Philosophy

GSD solves **"context rot"** (quality degradation as context fills) by breaking development into manageable phases with fresh context windows per task. The main session stays at 30-40% context usage while executors get fresh 200k tokens.

**Key Innovation:** XML-structured plans + Multi-agent orchestration + Atomic commits

### Context Engineering

GSD maintains these critical files:
- `PROJECT.md` - Project overview and goals
- `REQUIREMENTS.md` - v1/v2/out-of-scope requirements
- `ROADMAP.md` - Phase breakdown with descriptions
- `STATE.md` - Current progress and blockers
- `.planning/research/` - Ecosystem knowledge artifacts
- `.planning/phase-{N}/` - Per-phase plans, research, summaries

**Why It Works:** Size-limited files prevent quality degradation. Each file serves specific purpose.

### XML-Structured Plans

Every task uses precise XML format:
```xml
<task>
  <action>What to do</action>
  <verification>How to verify success</verification>
  <completion-criteria>When it's done</completion-criteria>
</task>
```

This eliminates ambiguity and enables automated verification.

### Multi-Agent Orchestration

**Research Phase:**
- 4 parallel researchers (stack, features, architecture, pitfalls)
- Outputs consolidated into {phase}-RESEARCH.md

**Execution Phase:**
- Plans executed in parallel waves
- Each executor gets fresh 200k context
- Zero accumulated garbage
- Atomic commit per completed task

**Verification Phase:**
- Automated checking against phase goals
- User acceptance testing with clear deliverables
- Automatic diagnosis of failures
- Fix plans generated for issues

### Model Profiles

Configure via `/gsd:settings` or `/gsd:set-profile <profile>`:

| Profile | Planning | Execution | Verification | Best For |
|---------|----------|-----------|--------------|----------|
| **quality** | Opus | Opus | Sonnet | Critical features, complex logic |
| **balanced** (default) | Opus | Sonnet | Sonnet | Most development work |
| **budget** | Sonnet | Sonnet | Haiku | Simple tasks, prototyping |

### Workflow Agents

Toggle via `/gsd:settings`:
- `workflow.research` (default: true) - Domain investigation before planning
- `workflow.plan_check` (default: true) - Verify plans meet requirements
- `workflow.verifier` (default: true) - Confirm delivery completeness

### Configuration Options

**Mode:**
- `interactive` (default) - Human approval at decision points
- `yolo` - Auto-approve everything (use with caution)

**Depth:**
- `quick` - Fast, less thorough
- `standard` (default) - Balanced depth
- `comprehensive` - Maximum thoroughness

**Execution:**
- `parallelization.enabled` (default: true) - Run independent plans simultaneously
- `planning.commit_docs` (default: true) - Track .planning/ in git

### GSD Complete Workflow Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE WORKFLOW                            │
└─────────────────────────────────────────────────────────────┘

1. /gsd:new-project
   ├─► Questions (goals, constraints, tech, edge cases)
   ├─► Parallel Research (4 researchers: stack, features, arch, pitfalls)
   ├─► Extract Requirements (v1, v2, out-of-scope)
   └─► Create Roadmap
       Creates: PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md

2. /gsd:discuss-phase N
   ├─► Capture implementation preferences
   ├─► Identify gray areas (visual, API, content, organizational)
   └─► User shapes decisions before research
       Creates: CONTEXT.md (guides downstream work)

3. /gsd:plan-phase N
   ├─► Research guided by CONTEXT.md
   ├─► Create 2-3 atomic task plans (XML-structured)
   ├─► Verification loop ensures plans meet requirements
   └─► Plans sized for single fresh context window
       Creates: {phase}-RESEARCH.md, {phase}-{N}-PLAN.md

4. /gsd:execute-phase N
   ├─► Parallel plan execution in waves
   ├─► Fresh 200k context per executor
   ├─► Atomic commit per task
   └─► Automatic verification against phase goals
       Creates: {phase}-{N}-SUMMARY.md, {phase}-VERIFICATION.md

5. /gsd:verify-work N
   ├─► User acceptance testing
   ├─► Extract must-haves from requirements
   ├─► Automatic diagnosis of failures
   └─► Creates fix plans for reexecution
       Creates: {phase}-UAT.md, fix plans if needed

6. /gsd:complete-milestone
   ├─► Archive .planning/ to .archive/
   ├─► Git tag release
   └─► Prepare for next milestone

┌─────────────────────────────────────────────────────────────┐
│                    QUICK MODE                                │
└─────────────────────────────────────────────────────────────┘

/gsd:quick
   ├─► Skips research, plan checking, verification
   ├─► Same planner + executor agents
   ├─► Separate tracking in .planning/quick/
   └─► Same atomic commits and state tracking

Use for: Bug fixes, small features, config changes, one-off tasks
```

---

## Complete Command Reference

### GSD Commands (Complete Reference)

**Core Workflow (Main Development Flow):**
```
/gsd:new-project              # Initialize with questions → research → roadmap
/gsd:discuss-phase [N]        # Capture decisions before planning
/gsd:plan-phase [N]           # Research + create plans + verify
/gsd:execute-phase <N>        # Run all plans in parallel waves
/gsd:verify-work [N]          # User acceptance testing
/gsd:audit-milestone          # Verify milestone completion
/gsd:complete-milestone       # Archive and tag release
/gsd:new-milestone [name]     # Start next version
```

**Navigation & Status:**
```
/gsd:progress                 # Current position and next steps
/gsd:help                     # Commands and usage guide
/gsd:update                   # Update GSD with changelog
/gsd:join-discord             # Join community
```

**Brownfield Development:**
```
/gsd:map-codebase             # Analyze existing codebase before initialization
```

**Phase Management:**
```
/gsd:add-phase                # Append phase to roadmap
/gsd:insert-phase [N]         # Insert urgent work
/gsd:remove-phase [N]         # Remove future phase
/gsd:list-phase-assumptions [N] # View Claude's planned approach
/gsd:plan-milestone-gaps      # Create phases for audit gaps
```

**Session Management:**
```
/gsd:pause-work               # Create handoff when stopping
/gsd:resume-work              # Restore from last session
```

**Utilities:**
```
/gsd:quick                    # Ad-hoc task execution (skips full workflow)
/gsd:debug [desc]             # Systematic debugging
/gsd:add-todo [desc]          # Capture idea for later
/gsd:check-todos              # List pending items
/gsd:settings                 # Configure model profile and agents
/gsd:set-profile <profile>    # Switch model (quality/balanced/budget)
```

**Research & Planning:**
```
/gsd:research-phase [N]       # Deep ecosystem research for phase
/gsd:plan-fix                 # Plan fixes for UAT issues
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
/build-fix                    # Resolve build errors
/tdd                          # Test-driven development workflow
/skill-create                 # Generate skills from repository history
/instinct-status              # View learned patterns
/evolve                       # Cluster instincts into reusable skills
/learn                        # Extract patterns from codebase
```

**Agents:** `planner`, `architect`, `tdd-guide`, `code-reviewer`, `security-reviewer`, `build-error-resolver`, `e2e-runner`, `refactor-cleaner`, `doc-updater`

**Key Features:**
- **Token Optimization** - Model selection strategies to preserve context (200k → 70k with too many MCPs)
- **Memory Persistence** - Hooks save/load context across sessions
- **Continuous Learning** - Instinct-based system learns from coding patterns with confidence scoring
- **MCP Integration** - Pre-configured for GitHub, Supabase, Vercel, Railway
- **Cross-Platform** - Node.js scripts work on Windows, macOS, Linux
- **80% Test Coverage** - Mandatory requirement for all features

**Subagent Pattern:**
- Main Claude delegates specialized tasks to focused agents
- Agents operate with limited tool access
- Specific models per task (Opus for complex reviews, Sonnet for execution)
- Iterative retrieval pattern refines context progressively

**Typical TDD Workflow:**
1. Define interfaces and tests first
2. Write failing tests (RED phase)
3. Implement minimal code (GREEN phase)
4. Refactor for clarity (IMPROVE phase)
5. Verify 80%+ coverage requirement

### Ralph Loop Commands
```
/ralph-loop "<prompt>" --completion-promise "X" --max-iterations N
/ralph-loop:cancel-ralph      # Cancel active loop
/ralph-loop:help              # Show help
```

---

## When to Use Brainstorming vs Planning

| Situation | Use Brainstorming | Use GSD Planning |
|-----------|-------------------|------------------|
| Unclear requirements | ✅ `/superpowers:brainstorm` | ❌ Skip |
| Multiple valid approaches | ✅ `/superpowers:brainstorm` | ❌ Skip |
| Need to explore trade-offs | ✅ `/superpowers:brainstorm` | ❌ Skip |
| Design is validated | ❌ Skip | ✅ `/gsd:plan-phase N` |
| Implementation steps clear | ❌ Skip | ✅ `/gsd:plan-phase N` |
| Inside active GSD workflow | ❌ Skip | ✅ `/gsd:plan-phase N` |

**Best Practice Flow:**
```
Unclear idea → /superpowers:brainstorm → Validated design → /gsd:new-milestone → /gsd:plan-phase 1
```

---

## Framework Selection Guide

| Scenario | Best Framework | Why |
|----------|----------------|-----|
| New greenfield project | GSD | Full spec-driven workflow with context engineering |
| New feature (multi-file) | GSD | Structured phases with fresh context per task |
| Quick fix / config | GSD Quick | Fast path, atomic commits, no overhead |
| Bug investigation | GSD Debug | Systematic hypothesis tracking |
| Design exploration | Superpowers Brainstorm | Socratic questioning, incremental validation |
| TDD enforcement | Everything Claude Code | Strict red-green-refactor with /tdd command |
| Code review | Everything Claude Code | Dedicated review agents with security focus |
| Security audit | Everything Claude Code | Security reviewer agent with vulnerability detection |
| Build errors | Everything Claude Code | Build error resolver agent |
| Autonomous overnight | Ralph Loop | Runs until completion |
| **Test coverage verification** | **Everything Claude Code** | **Enforces 80% minimum coverage** |
| **Context management** | **GSD** | **Prevents context rot, stays at 30-40% usage** |
| **Skill extraction** | **Everything Claude Code** | **/skill-create from repository history** |
| **Brownfield projects** | **GSD** | **/gsd:map-codebase analyzes existing code** |

### Combining Frameworks (Advanced Patterns)

**Pattern 1: Design → GSD Execution**
```
/superpowers:brainstorm        # Explore design (incremental validation)
/gsd:new-milestone             # Create milestone from validated design
/gsd:discuss-phase 1           # Capture implementation preferences
/gsd:plan-phase 1              # Research + create XML plans
/gsd:execute-phase 1           # Execute with fresh context
/gsd:verify-work 1             # User acceptance testing
/code-review                   # Quality + security audit
```

**Pattern 2: Brownfield + GSD**
```
/gsd:map-codebase              # Analyze existing codebase
                               # Creates: STACK.md, ARCHITECTURE.md, etc.
/gsd:new-milestone             # Plan new feature with context
/gsd:discuss-phase 1           # Align with existing patterns
/gsd:plan-phase 1              # Create plans respecting architecture
/gsd:execute-phase 1           # Implement with awareness
```

**Pattern 3: TDD + GSD Execution**
```
/gsd:discuss-phase 1           # Gather requirements
/tdd                           # Write tests first (Everything Claude Code)
/gsd:execute-phase 1           # Implement to pass tests
/gsd:verify-work 1             # Verify 80%+ coverage
```

**Pattern 4: Build Errors + GSD Fix**
```
/gsd:execute-phase 1           # Attempt implementation
# Build fails
/build-fix                     # Everything Claude Code resolves errors
/gsd:verify-work 1             # Confirm resolution
```

**Pattern 5: Ralph for Long GSD Plans**
```
/gsd:plan-phase 1              # Create comprehensive plan
/ralph-loop "Execute GSD phase 1 plans" --max-iterations 30
# Ralph runs until all plans complete
```

**Pattern 6: Skill Evolution**
```
# During development with Everything Claude Code
/instinct-status               # View learned patterns
/evolve                        # Cluster related instincts
/skill-create                  # Generate reusable skill
# New skill available for future projects
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
| Enable all MCPs at once | Enable only what you need (preserves context) |
| Skip /gsd:discuss-phase | Capture decisions before planning |
| Use /gsd:execute-plan without verification | Always run /gsd:verify-work after |
| Ignore context usage | Monitor with /gsd:progress |
| Skip test coverage | Use /tdd, verify 80%+ coverage |
| Manually manage state files | Let GSD handle PROJECT.md, STATE.md, etc. |
| Execute plans sequentially | Use parallelization (GSD default) |
| Use GSD for trivial tasks | Use /gsd:quick for small changes |
| Forget to archive milestones | Run /gsd:complete-milestone before new version |

---

## Help Commands

| Framework | Command |
|-----------|---------|
| GSD | `/gsd:help` |
| Superpowers | `/superpowers:help` |
| Ralph Loop | `/ralph-loop:help` |
| Everything Claude Code | Check command list above |
| All available | `/help` |
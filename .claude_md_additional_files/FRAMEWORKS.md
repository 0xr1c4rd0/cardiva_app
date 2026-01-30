# Frameworks Documentation

> **Read this when**: Starting new features, debugging, planning work, or using automation frameworks.

---

## Quick Reference

| Framework | Purpose | Primary Command |
|-----------|---------|-----------------|
| **GSD** | Full project lifecycle, spec-driven development | `/gsd:new-project` |
| **Superpowers** | Design brainstorming, TDD, plan-first approach | `/superpowers:brainstorm` |
| **Everything Claude Code** | Code review, security audit, TDD workflow | `/code-review` |
| **Ralph Loop** | Autonomous iteration until completion | `/ralph-loop` |

---

## Command Routing

| You Say | I Run |
|---------|-------|
| "Build X" / "New feature" | `/gsd:new-milestone` or `/superpowers:brainstorm` |
| "Quick fix" / "Small change" | `/gsd:quick` |
| "Bug" / "Not working" | `/gsd:debug` |
| "Continue" / "Resume" | `/gsd:resume-work` |
| "Pause" / "Stopping" | `/gsd:pause-work` |
| "Review this" | `/code-review` |
| "Brainstorm" / "Design" | `/superpowers:brainstorm` |
| "Plan this" | `/gsd:plan-phase N` |
| "Execute" / "Build it" | `/gsd:execute-plan` |
| "Verify" / "Test it" | `/gsd:verify-work N` |
| "Run overnight" | `/ralph-loop` |
| "Where am I?" | `/gsd:progress` |
| "Map the codebase" | `/gsd:map-codebase` |

---

## GSD Framework

### Core Philosophy

GSD solves **"context rot"** (quality degradation as context fills) by breaking development into phases with fresh context windows per task.

- Main session stays at 30-40% context usage
- Executors get fresh 200k tokens per task
- XML-structured plans eliminate ambiguity

### Full Workflow

```
/gsd:new-project          # Requirements gathering
    ↓
/gsd:create-roadmap       # Break into phases
    ↓
/gsd:discuss-phase 1      # Clarify scope
    ↓
/gsd:plan-phase 1         # Create atomic task plans
    ↓
/gsd:execute-plan         # Fresh context per executor
    ↓
/gsd:verify-work 1        # User acceptance testing
```

### Key Commands

**Core Workflow:**
```
/gsd:new-project              # Initialize project
/gsd:discuss-phase [N]        # Capture decisions before planning
/gsd:plan-phase [N]           # Research + create plans
/gsd:execute-phase <N>        # Run all plans
/gsd:verify-work [N]          # User acceptance testing
/gsd:complete-milestone       # Archive and tag release
```

**Navigation:**
```
/gsd:progress                 # Current status
/gsd:pause-work               # Create handoff
/gsd:resume-work              # Restore session
```

**Utilities:**
```
/gsd:quick                    # Ad-hoc task (skips full workflow)
/gsd:debug [desc]             # Systematic debugging
/gsd:map-codebase             # Analyze existing codebase
```

### Model Profiles

Configure via `/gsd:settings`:

| Profile | Planning | Execution | Best For |
|---------|----------|-----------|----------|
| **quality** | Opus | Opus | Critical features |
| **balanced** | Opus | Sonnet | Most work (default) |
| **budget** | Sonnet | Sonnet | Prototyping |

### Context Engineering

GSD maintains these files:
- `PROJECT.md` - Project overview
- `REQUIREMENTS.md` - v1/v2/out-of-scope
- `ROADMAP.md` - Phase breakdown
- `STATE.md` - Current progress
- `.planning/phase-{N}/` - Per-phase plans and research

---

## Superpowers Framework

### When to Use

Use Superpowers for **design exploration** before committing to implementation:
- Unclear requirements
- Multiple valid approaches
- Need to explore trade-offs

### Brainstorming Process

1. **Understanding** - Examines project, asks ONE question at a time
2. **Exploration** - Presents 2-3 approaches with trade-offs
3. **Validation** - Delivers design in 200-300 word sections
4. **Documentation** - Writes validated designs to `.planning/`

### Commands

```
/superpowers:brainstorm       # Interactive design refinement
/superpowers:write-plan       # Create implementation plan
/superpowers:execute-plan     # Execute with TDD
```

---

## Everything Claude Code

### Agents

| Agent | Purpose |
|-------|---------|
| `code-reviewer` | Quality and patterns |
| `security-reviewer` | Vulnerability analysis |
| `build-error-resolver` | Build errors |
| `e2e-runner` | Playwright testing |
| `refactor-cleaner` | Dead code cleanup |

### Commands

```
/code-review                  # Quality + security review
/build-fix                    # Resolve build errors
/tdd                          # Test-driven development
/plan                         # Implementation planning
/learn                        # Extract patterns from codebase
```

### TDD Workflow

1. Define interfaces and tests first
2. Write failing tests (RED)
3. Implement minimal code (GREEN)
4. Refactor for clarity (IMPROVE)
5. Verify 80%+ coverage

---

## Ralph Loop

### Usage

For autonomous, long-running tasks:

```
/ralph-loop "<task>" --completion-promise "DONE" --max-iterations N
```

**Example:**
```
/ralph-loop "Implement all PRD items. Output <promise>DONE</promise> when complete" --max-iterations 50
```

### Safety

- **Always set `--max-iterations`**
- Cancel with `/ralph-loop:cancel-ralph`
- Use for overnight work, not quick tasks

---

## Framework Selection Guide

| Scenario | Framework | Why |
|----------|-----------|-----|
| New greenfield project | GSD | Full spec-driven workflow |
| New multi-file feature | GSD | Structured phases |
| Quick fix / config | GSD Quick | Fast path, no overhead |
| Bug investigation | GSD Debug | Systematic hypothesis tracking |
| Design exploration | Superpowers | Socratic questioning |
| Code review | Everything Claude Code | Dedicated review agents |
| TDD enforcement | Everything Claude Code | Strict red-green-refactor |
| Autonomous overnight | Ralph Loop | Runs until completion |
| Brownfield analysis | GSD | `/gsd:map-codebase` |

---

## Combining Frameworks

### Pattern 1: Design → GSD Execution
```
/superpowers:brainstorm        # Explore design
/gsd:new-milestone             # Create milestone
/gsd:plan-phase 1              # Create plans
/gsd:execute-phase 1           # Execute
/code-review                   # Quality audit
```

### Pattern 2: Brownfield + GSD
```
/gsd:map-codebase              # Analyze existing code
/gsd:new-milestone             # Plan new feature
/gsd:execute-phase 1           # Implement
```

### Pattern 3: TDD + GSD
```
/tdd                           # Write tests first
/gsd:execute-phase 1           # Implement to pass tests
/gsd:verify-work 1             # Verify coverage
```

---

## Token Optimization

### Context Rot Problem

As context fills, response quality degrades. Solutions:

**GSD**: Fresh context per executor (main stays at 30-40%)

**Everything Claude Code**: Model selection strategies, specialized agents

### MCP Warning ⚠️

**Don't enable all MCPs at once.** Your 200k context can shrink to 70k.

- Enable only MCPs you're actively using
- Disable unused integrations
- Monitor with `/gsd:progress`

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Jump to `/gsd:execute-plan` | Run `/gsd:discuss-phase` → `/gsd:plan-phase` first |
| Use Ralph for quick tasks | Use `/gsd:quick` |
| Skip verification | Always run `/gsd:verify-work` |
| Start without context | Run `/gsd:map-codebase` for brownfield |
| Let context fill up | Watch context, use `/gsd:pause-work` |
| Enable all MCPs | Enable only what you need |

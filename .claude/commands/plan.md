# /plan Command

Create a detailed implementation plan for a feature or change.

## Usage

```
/plan [feature description]
/plan add user role management
/plan refactor match confirmation flow
```

## Process

### Step 1: Understand Requirements

I will ask clarifying questions:
- What is the expected behavior?
- What are the acceptance criteria?
- Are there any constraints?

### Step 2: Analyze Codebase

I will:
- Find relevant existing code
- Identify patterns to follow
- Note dependencies

### Step 3: Create Plan

Output a structured implementation plan.

## Plan Template

```markdown
# Implementation Plan: [Feature Name]

## Overview
Brief description of what will be implemented.

## Prerequisites
- [ ] Prerequisite 1
- [ ] Prerequisite 2

## Tasks

### Task 1: [Name]
**Files:** `path/to/file.ts`
**Description:** What this task accomplishes
**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

### Task 2: [Name]
**Files:** `path/to/file.ts`
**Depends on:** Task 1
**Description:** What this task accomplishes
**Acceptance Criteria:**
- [ ] Criterion 1

## Parallel Execution
- Tasks 2 and 3 can run in parallel
- Task 4 depends on both 2 and 3

## Testing Strategy
- Unit tests for: [components]
- Integration tests for: [APIs]
- E2E tests for: [flows]

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Risk description | Mitigation strategy |

## Estimated Effort
- Total tasks: N
- Complexity: Low/Medium/High
```

## Integration with GSD

This plan can be:
1. Saved to `.planning/phases/` for GSD execution
2. Used directly for quick implementation
3. Reviewed and modified before execution

## Quick Actions

After planning, I can:
- Start implementing Task 1
- Save plan to GSD structure
- Generate tests first (TDD)

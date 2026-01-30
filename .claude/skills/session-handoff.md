# Session Handoff Skill

This skill provides a template for creating session handoff files when stopping work mid-task or hitting context limits.

## When to Create Handoff

Create a handoff file when:
1. Stopping work mid-task
2. Context window is getting full (>80%)
3. Switching to a different major task
4. End of work session

## Handoff File Location

```
.planning/sessions/YYYY-MM-DD-handoff.md
```

## Handoff Template

```markdown
# Session Handoff: YYYY-MM-DD

## Session Summary
Brief description of what was worked on.

## Completed Work
- [x] Task 1 completed
- [x] Task 2 completed
- [ ] Task 3 in progress (50%)

## Current State

### Files Modified
- `path/to/file1.ts` - Description of changes
- `path/to/file2.tsx` - Description of changes

### Tests Status
- All tests passing: Yes/No
- New tests added: Yes/No
- Coverage: X%

### Build Status
- `npm run build`: Pass/Fail
- `npm run lint`: Pass/Fail

## What's Left To Do

### Immediate (Next Session)
1. Task description
2. Task description

### Later
1. Lower priority task
2. Lower priority task

## Blockers & Issues

### Active Blockers
- Blocker description

### Known Issues
- Issue description

## What Worked

Approaches that were successful:
1. Approach description
2. Approach description

## What Didn't Work

Approaches that were attempted but failed:
1. Approach description - Why it failed
2. Approach description - Why it failed

## Context for Next Session

Important context the next session should know:
- Context point 1
- Context point 2

## Related Files to Review
- `path/to/important/file.ts` - Why it's important
- `.planning/phases/N-name/N-X-PLAN.md` - Current plan

## Commands to Run First
```bash
# Verify state is correct
npm run build
npm run test

# Check for uncommitted changes
git status
```
```

## Usage

### Creating Handoff

```
/gsd:pause-work
```

Or manually:
1. Copy the template above
2. Fill in all sections
3. Save to `.planning/sessions/`

### Resuming from Handoff

```
/gsd:resume-work
```

Or manually:
1. Read the latest handoff file
2. Run verification commands
3. Continue from "What's Left To Do"

## Best Practices

1. **Be Specific**: Include file paths and line numbers
2. **Include Evidence**: Link to test results, build output
3. **Document Failures**: Failed approaches save time next session
4. **Keep It Updated**: Update during session, not just at end
5. **Review Before Stopping**: Ensure handoff is complete

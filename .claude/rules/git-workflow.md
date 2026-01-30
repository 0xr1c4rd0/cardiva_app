# Git Workflow Rules

## Branch Strategy

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `refactor/*` - Code improvements

## Commit Message Format

Use conventional commits:

```
<type>(<scope>): <description>

[optional body]

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructuring (no behavior change) |
| `docs` | Documentation only |
| `test` | Adding/updating tests |
| `style` | Formatting, no code change |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |

### Scope (optional)

Use the feature area: `auth`, `rfp`, `matches`, `admin`, `inventory`, `ui`

### Examples

```bash
feat(rfp): add bulk export functionality
fix(matches): correct confidence score display
refactor(auth): extract validation logic to hook
docs: update API documentation
test(inventory): add CSV upload tests
chore: update dependencies
```

## Commit Guidelines

### Atomic Commits

Each commit should:
- Do ONE thing
- Be independently deployable
- Have passing tests

```bash
# GOOD: Atomic commits
git commit -m "feat(matches): add accept button"
git commit -m "feat(matches): add reject button"
git commit -m "test(matches): add acceptance tests"

# BAD: Kitchen sink commit
git commit -m "feat: add buttons, fix bug, update styles, refactor"
```

### Before Committing

Always verify:
1. `npm run build` passes
2. `npm run test` passes
3. No console.log statements
4. No hardcoded values
5. Code reviewed if significant change

## GSD Integration

When using GSD framework, commits follow this format:

```
[phase-N] task description

Co-Authored-By: Claude <noreply@anthropic.com>
```

Example:
```
[phase-9] add email export configuration to admin settings

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Pull Request Guidelines

### PR Title

Same format as commit messages:
```
feat(scope): description
```

### PR Description Template

```markdown
## Summary
- Brief description of changes

## Changes
- [ ] Change 1
- [ ] Change 2

## Test Plan
- How to test these changes

## Screenshots (if UI changes)
```

### PR Checklist

- [ ] Tests pass
- [ ] Build succeeds
- [ ] Code reviewed
- [ ] Documentation updated (if needed)
- [ ] No console.log statements
- [ ] Follows coding standards

## Protected Operations

**ALWAYS ask user before:**
- Pushing to remote
- Creating pull requests
- Force push operations
- Merging to main
- Deleting branches

## Resolving Conflicts

1. Pull latest from target branch
2. Resolve conflicts locally
3. Test merged code
4. Commit with clear message

```bash
git fetch origin
git rebase origin/main
# Resolve conflicts
npm run test
git add .
git rebase --continue
```

## Emergency Rollback

If something breaks in production:

```bash
# Find the last good commit
git log --oneline

# Revert to previous commit (creates new commit)
git revert HEAD

# Or reset to specific commit (destructive)
# git reset --hard <commit-hash>  # Only with user permission!
```

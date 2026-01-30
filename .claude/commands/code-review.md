# /code-review Command

Review code for quality, security, and maintainability.

## Usage

```
/code-review [file or directory]
/code-review                    # Review recent changes
/code-review src/components/    # Review specific directory
/code-review --staged           # Review staged files only
```

## Review Checklist

### Code Quality
- [ ] Readable and well-named
- [ ] Functions <50 lines
- [ ] Files <800 lines
- [ ] No deep nesting (>4 levels)
- [ ] DRY principles followed

### Security
- [ ] No hardcoded secrets
- [ ] Input validation with Zod
- [ ] Proper error handling
- [ ] Auth/authz checks present

### TypeScript
- [ ] Explicit types (no `any`)
- [ ] Proper null handling
- [ ] Type guards where needed

### React/Next.js
- [ ] Correct Server/Client usage
- [ ] Proper data fetching
- [ ] Hook dependencies correct
- [ ] Key props in lists

### Performance
- [ ] No unnecessary re-renders
- [ ] Proper memoization
- [ ] No N+1 queries
- [ ] Reasonable bundle size

### Accessibility
- [ ] Semantic HTML
- [ ] ARIA labels where needed
- [ ] Keyboard navigation
- [ ] Portuguese labels correct

## Output Format

```markdown
## Code Review: [file/directory]

### Critical (Must Fix)
1. **[Issue]** at `file:line`
   - Problem: Description
   - Fix: Suggested solution

### Warnings (Should Fix)
1. **[Issue]** at `file:line`
   - Problem: Description
   - Fix: Suggested solution

### Suggestions (Nice to Have)
1. **[Suggestion]** at `file:line`
   - Description

### Positive Observations
- Good pattern at `file:line`
```

## Quick Actions

After review, I can:
- Fix critical issues automatically
- Create tasks for each issue
- Generate a summary report

# /build-fix Command

Diagnose and fix build errors automatically.

## Usage

```
/build-fix              # Fix current build errors
/build-fix --analyze    # Analyze without fixing
```

## Process

### Step 1: Run Build

```bash
npm run build
```

### Step 2: Analyze Errors

I will categorize errors:

| Type | Example | Fix Strategy |
|------|---------|--------------|
| TypeScript | `TS2322` | Type fixes |
| ESLint | Linting errors | Code style |
| Next.js | SSR issues | Component fixes |
| Module | Import errors | Dependency fixes |

### Step 3: Fix Errors

For each error:
1. Locate the source file
2. Understand the root cause
3. Apply the fix
4. Verify the fix works

### Step 4: Verify

```bash
npm run build  # Should pass
npm run test   # Should pass
```

## Common Fixes

### TypeScript Errors

**Type mismatch**: Add proper types or type assertions
**Missing property**: Extend interface or add optional chaining
**Module not found**: Check imports and install dependencies

### Next.js Errors

**Server/Client mismatch**: Add "use client" directive
**Hydration error**: Ensure consistent server/client render
**Dynamic import**: Use next/dynamic for client-only components

### ESLint Errors

**Unused variables**: Remove or prefix with `_`
**Missing dependencies**: Add to useEffect dependency array
**Import order**: Follow project conventions

## Output

After fixing:

```markdown
## Build Fix Summary

### Errors Fixed
1. `file.ts:line` - Error description
   - Fix applied: Description

### Build Status
- Build: PASS
- Tests: PASS
- Linting: PASS

### Remaining Issues (if any)
- Manual intervention needed for: ...
```

# CLAUDE.md - Cardiva RFP Matching App

## Overview

Cardiva is an RFP matching application for a pharmaceutical company. Users upload government RFP PDFs, and the system matches requested products against a 20k+ product inventory using AI-powered semantic search.

**Key Insight**: The heavy lifting (PDF extraction, OCR, AI matching) happens in n8n workflows. This app is the frontend + job orchestration layer.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Backend**: Supabase (Auth, Postgres, Realtime, Storage)
- **Processing**: n8n workflows via webhooks
- **UI**: shadcn/ui + Tailwind CSS 4
- **State**: Zustand (client), React Query (server), Nuqs (URL)
- **Testing**: Playwright E2E

---

## Code Standards

### Immutability (Critical)
```typescript
// ❌ WRONG
user.name = name; return user;

// ✅ CORRECT
return { ...user, name };
```

### Error Handling
```typescript
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: 'User-friendly message' };
}
```

### Input Validation
Always validate with Zod before processing user input.

### File Organization
- 200-400 lines typical, 800 max
- Many small files > few large files
- Organize by feature/domain

---

## Conventions

| Item | Standard |
|------|----------|
| UI Language | Portuguese (Portugal) |
| CSV Encoding | UTF-8 with ISO-8859-1 fallback |
| Confidence Scores | 4 decimal precision (0.9523) |
| Auth Flow | Registration → Admin approval → Access |
| Server Actions | 10MB body limit for large uploads |

---

## Development Commands

```bash
bun dev              # Dev server (port 3000)
bun run build        # Production build + type-check
bun test             # Playwright E2E tests
bun test:ui          # Interactive test UI
```

---

## Quality Checklist

Before marking work complete:

- [ ] `bun run build` passes
- [ ] `bun test` passes
- [ ] No console errors in DevTools
- [ ] Immutable patterns used
- [ ] Proper error handling
- [ ] Portuguese text correct (if UI)
- [ ] User approved git commit

---

## Git Workflow

**Always ask before committing or pushing.**

```
type(scope): description

Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`

---

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Mutate state | Return new objects |
| Skip tests | TDD is mandatory |
| Hardcode values | Use constants/env vars |
| Auto-commit | Always ask user first |
| Edit blind | Read files before modifying |
| Create mega-files | Split into focused modules |
| Ignore errors | Handle all error cases |

---

## Extended Documentation

For detailed information, read these files when relevant:

| Document | When to Read |
|----------|--------------|
| `.claude_md_additional_files/ARCHITECTURE.md` | Understanding codebase structure, routes, database, data flow |
| `.claude_md_additional_files/FRAMEWORKS.md` | Using GSD, Superpowers, Everything Claude Code, Ralph Loop |
| `.claude_md_additional_files/SKILLS.md` | UI/UX work, component design, performance optimization |
| `.claude_md_additional_files/N8N_INTEGRATION.md` | Working with n8n webhooks, RFP processing flow |

**Read the relevant doc before starting work in that area.**

# Coding Conventions

**Analysis Date:** 2026-01-25

## Naming Patterns

**Files:**
- kebab-case for all files: `rfp-upload-dialog.tsx`, `user-menu.tsx`, `rfp-webhook.ts`
- Server Actions: `actions.ts` in route directories
- Route handlers: `route.ts` in route directories
- Schemas: `schema.ts` for validation schemas
- Types: `types.ts` for TypeScript type definitions

**Functions:**
- camelCase for all functions: `createClient()`, `sanitizeFilename()`, `triggerRFPUpload()`
- Server Actions prefixed with verb: `login()`, `logout()`, `deleteRFPJob()`, `acceptMatch()`
- Async functions use `async` keyword with Promise return types
- Helper functions typically start with verb: `fetchItemWithMatches()`, `updateLastEditedBy()`

**Variables:**
- camelCase for variables: `fileBuffer`, `searchPattern`, `updatedItem`
- Constants in SCREAMING_SNAKE_CASE not observed (uses camelCase even for constants)
- Boolean variables use `is`/`has` prefixes: `isManualMatch`, `hasData`, `isInvalid`

**Types:**
- PascalCase for interfaces and types: `RFPUploadResult`, `ActionResult`, `InventorySearchResult`
- Props interfaces suffixed with `Props`: `RFPUploadDialogProps`, `UserMenuClientProps`, `KPIStatsCardProps`
- Zod schema inferred types use `z.infer<typeof schema>` pattern
- Type exports: `export type LoginFormData = z.infer<typeof loginSchema>`

## Code Style

**Formatting:**
- No Prettier/ESLint config detected - relies on default Next.js + TypeScript settings
- Single quotes for strings (TypeScript default)
- 2-space indentation (observed in all files)
- Semicolons used consistently
- Trailing commas in multiline objects/arrays

**Linting:**
- TypeScript strict mode enabled: `"strict": true` in `tsconfig.json`
- No explicit ESLint or Prettier configuration files
- Relies on Next.js built-in linting

## Import Organization

**Order:**
1. React/Next.js core imports
2. Third-party library imports
3. Internal UI components (`@/components`)
4. Internal lib/utils (`@/lib`, `@/hooks`)
5. Types/interfaces (`@/types`)
6. Relative imports (rare, uses path aliases)

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- All internal imports use `@/` prefix: `import { createClient } from '@/lib/supabase/client'`
- No relative imports like `../../../` observed

**Examples:**
```typescript
import { createContext, useContext, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { triggerRFPUpload } from '@/app/(dashboard)/rfps/actions'
```

## Error Handling

**Patterns:**
- Try-catch blocks in async Server Actions with error logging
- Return objects with `{ success: boolean; error?: string }` pattern
- Console.error for errors, console.log for debugging (some debug logs still in production code)
- Supabase errors returned via `.error` property destructuring
- Non-fatal errors continue execution with console.error logging

**Server Actions:**
```typescript
export async function deleteRFPJob(jobId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    // ... operations
    if (error) {
      console.error('Failed to delete RFP job:', error)
      return { success: false, error: `Failed to delete job: ${error.message}` }
    }
    return { success: true }
  } catch (error) {
    console.error('Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
```

**Client Components:**
- Errors displayed via `toast.error()` from `sonner` library
- Try-catch in async handlers with user-friendly error messages
- Silent failures for non-critical operations (e.g., storage cleanup)

## Logging

**Framework:** Console API (native JavaScript)

**Patterns:**
- `console.error()` for errors with context objects
- `console.log()` for debugging (should be removed in production)
- Debug logs include structured data: `console.log('Profile check:', { hasUser, hasProfile, isApproved })`
- Error logs include operation name: `console.error('Failed to create RFP upload job:', jobError)`

**Current Issues:**
- Debug logs present in production code (e.g., `src/app/(dashboard)/layout.tsx` lines 36, 47)
- No structured logging framework (e.g., pino, winston)
- Console logs used for tracing in Server Actions (e.g., `[acceptMatch]` prefixes in `matches/actions.ts`)

## Comments

**When to Comment:**
- JSDoc-style comments for exported Server Actions and complex functions
- Inline comments for non-obvious business logic
- Step-by-step comments in multi-step operations (e.g., `// Step 1: Accept the selected match`)
- TypeScript file headers explaining purpose for type definition files

**JSDoc/TSDoc:**
- Extensive use for Server Actions:
```typescript
/**
 * Create an RFP upload job, store file in Supabase Storage, and trigger n8n webhook
 * Fire-and-forget pattern: returns immediately, n8n processes async
 */
export async function triggerRFPUpload(formData: FormData): Promise<RFPUploadResult>
```
- Type interfaces documented with inline comments:
```typescript
export interface RFPItem {
  id: string
  job_id: string

  // Extracted data from RFP
  lote_pedido: number | null
  posicao_pedido: string | null

  // Review status
  review_status: 'pending' | 'accepted' | 'rejected' | 'manual'
}
```

**Inline Comments:**
- Used to explain business logic and edge cases
- Non-obvious operations explained: `// +2: index 0 = row 2 (after header)`
- Side effects documented: `// CASCADE will handle rfp_items and rfp_match_suggestions`

## Function Design

**Size:** Functions range from 10-100 lines; complex Server Actions can be 50-80 lines with multiple database operations

**Parameters:**
- Prefer explicit parameters over options objects
- FormData used for Server Actions triggered from forms
- Object parameters for complex configurations (e.g., webhook payloads)
- TypeScript interfaces for structured parameters

**Return Values:**
- Async functions return `Promise<T>`
- Server Actions use result objects: `Promise<{ success: boolean; error?: string; data?: T }>`
- Validation functions return structured results: `ValidationResult` with errors, warnings, counts
- Helper functions return null on failure: `fetchItemWithMatches(): Promise<RFPItemWithMatches | null>`

**Examples:**
```typescript
// Simple parameter pattern
export async function deleteRFPJob(jobId: string): Promise<{ success: boolean; error?: string }>

// Complex result pattern
export async function getRFPJobStatus(jobId: string) {
  // ...
  return { success: true, job: data }
}

// Structured result pattern
export function validateCSVData(data: Record<string, unknown>[]): ValidationResult {
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validRowCount,
    totalRowCount: data.length,
  }
}
```

## Module Design

**Exports:**
- Named exports only - no default exports observed in application code
- UI components export component functions directly: `export { Button, buttonVariants }`
- Server Actions export individual action functions
- Utility modules export helper functions: `export function cn(...inputs: ClassValue[])`
- Type modules export interfaces and types

**Barrel Files:**
- Not used - each file imported directly via path alias
- UI components in `@/components/ui/` imported individually: `import { Button } from '@/components/ui/button'`

**File Organization:**
- Server Actions in `actions.ts` alongside page components
- Types in dedicated `types.ts` or inline in the file using them
- Schemas in `schema.ts` for route-level validation
- Component co-location: related components in same directory

---

*Convention analysis: 2026-01-25*

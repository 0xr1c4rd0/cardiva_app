# Coding Style Rules

## Immutability (CRITICAL)

ALWAYS create new objects, NEVER mutate:

```typescript
// WRONG: Mutation
function updateItem(item: Item, status: string) {
  item.status = status  // MUTATION!
  return item
}

// CORRECT: Immutability
function updateItem(item: Item, status: string): Item {
  return { ...item, status }
}

// WRONG: Array mutation
function addItem(items: Item[], newItem: Item) {
  items.push(newItem)  // MUTATION!
  return items
}

// CORRECT: Array immutability
function addItem(items: Item[], newItem: Item): Item[] {
  return [...items, newItem]
}
```

## File Organization

**MANY SMALL FILES > FEW LARGE FILES**

- High cohesion, low coupling
- 200-400 lines typical, 800 max per file
- Extract utilities from large components
- Organize by feature/domain, not by type

**File Size Guidelines:**
| File Type | Typical Lines | Max Lines |
|-----------|---------------|-----------|
| React Component | 50-150 | 300 |
| Utility/Helper | 50-100 | 200 |
| Page Component | 100-200 | 400 |
| Server Action | 30-80 | 150 |
| Hook | 30-100 | 200 |

## Naming Conventions

- **Components**: PascalCase (`MatchCard.tsx`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_UPLOAD_SIZE`)
- **Types/Interfaces**: PascalCase with descriptive names (`RFPMatchSuggestion`)
- **Boolean variables**: `is`, `has`, `should` prefix (`isLoading`, `hasError`)

## Function Guidelines

- Functions should be <50 lines
- Single responsibility per function
- Descriptive names that indicate action (`fetchMatches`, `validateInput`)
- Early returns for guard clauses

```typescript
// GOOD: Early returns
function processItem(item: Item | null): Result {
  if (!item) return { success: false, error: 'No item' }
  if (!item.isValid) return { success: false, error: 'Invalid item' }

  // Main logic here
  return { success: true, data: processedItem }
}

// BAD: Deep nesting
function processItem(item: Item | null): Result {
  if (item) {
    if (item.isValid) {
      // Main logic buried in nesting
    }
  }
}
```

## Import Organization

Order imports consistently:
1. React/Next.js
2. External libraries
3. Internal components
4. Internal utilities
5. Types
6. Styles

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { z } from 'zod'
import { toast } from 'sonner'

// 3. Internal components
import { Button } from '@/components/ui/button'
import { MatchCard } from '@/components/match-card'

// 4. Internal utilities
import { formatConfidence } from '@/lib/utils'
import { createClient } from '@/lib/supabase/browser'

// 5. Types
import type { RFPMatch } from '@/types/rfp'
```

## Error Handling

ALWAYS handle errors comprehensively:

```typescript
// Server Action pattern
export async function updateMatch(matchId: string, status: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('rfp_match_suggestions')
      .update({ status })
      .eq('id', matchId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Failed to update match:', error)
    return { success: false, error: 'Falha ao atualizar correspondência' }
  }
}
```

## Code Quality Checklist

Before marking work complete:
- [ ] Code is readable and well-named
- [ ] Functions are small (<50 lines)
- [ ] Files are focused (<800 lines)
- [ ] No deep nesting (>4 levels)
- [ ] Proper error handling with try/catch
- [ ] No console.log in production code
- [ ] No hardcoded values (use constants/env vars)
- [ ] Immutable patterns used throughout
- [ ] TypeScript types are explicit, not `any`

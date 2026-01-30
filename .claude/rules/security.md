# Security Rules

## Critical Security Requirements

### 1. No Hardcoded Secrets

NEVER hardcode secrets, API keys, or credentials:

```typescript
// WRONG
const apiKey = 'sk-1234567890abcdef'
const dbPassword = 'mypassword123'

// CORRECT
const apiKey = process.env.API_KEY
const dbPassword = process.env.DATABASE_PASSWORD
```

### 2. Environment Variables

All sensitive data must use environment variables:

```bash
# .env.local (never commit this file)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
N8N_WEBHOOK_SECRET=...
```

**Public vs Private:**
- `NEXT_PUBLIC_*` - Safe for client-side (non-sensitive)
- No prefix - Server-side only (sensitive)

### 3. Input Validation

ALWAYS validate user input with Zod:

```typescript
import { z } from 'zod'

// Define schema
const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  fileSize: z.number().int().min(1).max(10_000_000), // 10MB max
  mimeType: z.enum(['application/pdf'])
})

// Validate before processing
export async function uploadFile(input: unknown) {
  const validated = uploadSchema.safeParse(input)

  if (!validated.success) {
    return { success: false, error: 'Dados inválidos' }
  }

  // Safe to use validated.data
}
```

### 4. SQL Injection Prevention

Use Supabase parameterized queries (automatic):

```typescript
// SAFE: Supabase handles parameterization
const { data } = await supabase
  .from('artigos')
  .select('*')
  .ilike('descricao', `%${searchTerm}%`)

// UNSAFE: Never build raw SQL with user input
// const query = `SELECT * FROM artigos WHERE descricao LIKE '%${searchTerm}%'`
```

### 5. Authentication & Authorization

Always verify user authentication:

```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // User is authenticated
}
```

Check authorization for sensitive operations:

```typescript
// Server Action
export async function deleteUser(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Não autenticado' }
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Não autorizado' }
  }

  // Proceed with admin action
}
```

### 6. Error Handling

Never expose internal error details to users:

```typescript
// WRONG
catch (error) {
  return { success: false, error: error.message } // Exposes internal details
}

// CORRECT
catch (error) {
  console.error('Internal error:', error) // Log for debugging
  return { success: false, error: 'Ocorreu um erro. Tente novamente.' }
}
```

### 7. File Upload Security

Validate file uploads:

```typescript
const ALLOWED_TYPES = ['application/pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function validateFile(file: File): boolean {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de ficheiro não permitido')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Ficheiro demasiado grande')
  }

  return true
}
```

### 8. CSRF Protection

Server Actions provide automatic CSRF protection. Always use them for mutations:

```typescript
// Server Action (CSRF protected)
'use server'

export async function updateSettings(formData: FormData) {
  // Automatically protected against CSRF
}
```

### 9. Rate Limiting

Implement rate limiting for sensitive endpoints:

```typescript
// Consider implementing at the edge or in middleware
// Supabase has built-in rate limiting for auth endpoints
```

## Security Checklist

Before deploying any code:

- [ ] No hardcoded secrets or credentials
- [ ] All user input is validated with Zod
- [ ] Authentication checked on protected routes
- [ ] Authorization verified for admin operations
- [ ] Error messages don't expose internals
- [ ] File uploads validated (type, size)
- [ ] Using Server Actions for mutations (CSRF protection)
- [ ] Sensitive env vars not prefixed with NEXT_PUBLIC_

## Reporting Security Issues

If you discover a security vulnerability:
1. Do NOT commit the vulnerable code
2. Report to the team immediately
3. Document the issue privately

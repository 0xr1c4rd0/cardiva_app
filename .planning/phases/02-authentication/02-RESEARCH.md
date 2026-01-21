# Phase 2: Authentication - Research

**Researched:** 2026-01-21
**Domain:** Supabase Auth, Next.js 16 App Router, RBAC, SSR Authentication
**Confidence:** HIGH

## Summary

This research covers authentication implementation patterns for Phase 2, which adds user authentication with email/password, manual approval workflow, role-based access control (user vs admin), and password reset functionality. The implementation builds on Phase 1's Supabase SSR foundation with @supabase/ssr clients and middleware already configured.

Key findings:
- Supabase Auth provides server actions (`signUp`, `signInWithPassword`, `signOut`, `resetPasswordForEmail`, `updateUser`) for all auth flows
- Manual approval workflow requires ban_duration approach: new accounts created with permanent ban, admin manually unbans approved users
- RBAC implemented via Custom Access Token Auth Hook that injects user role from profiles table into JWT claims
- Protected routes use middleware for initial filtering + server-side `getUser()` validation in layouts
- Password reset uses email link with token_hash verification in callback route

**Primary recommendation:** Use server actions for all auth operations, implement ban_duration-based approval workflow, create Custom Access Token Hook for role injection, protect routes at layout level with `getUser()`, and configure email templates for password reset flow.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.90+ | Supabase Auth API | Official client, full auth feature support |
| @supabase/ssr | 0.8+ | SSR-compatible clients | Cookie-based sessions, server components support |
| Next.js Server Actions | 16.x | Auth mutations | Type-safe, no API routes needed, progressive enhancement |
| Supabase Auth Hooks | latest | Custom JWT claims | Server-side role injection, official RBAC pattern |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 3.x | Form validation | Validate email/password before submission |
| react-hook-form | 7.x | Form state management | Client-side form handling, error display |
| shadcn/ui Form | latest | Form components | Accessible forms with validation integration |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Supabase Auth | NextAuth.js | More providers but complex RBAC, no built-in user management |
| Supabase Auth | Clerk | Faster setup but vendor lock-in, higher cost at scale |
| Server Actions | API Routes | More boilerplate, no progressive enhancement |
| ban_duration | RLS-only approach | Works but no admin UI in Supabase dashboard |
| Custom Access Token Hook | app_metadata updates | Requires service role on client, security risk |

**Installation:**

```bash
# Already installed from Phase 1:
# @supabase/supabase-js @supabase/ssr

# Form handling and validation
npm install zod react-hook-form @hookform/resolvers

# Add shadcn/ui form components
npx shadcn@latest add form input label button card
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── (auth)/                    # Auth route group (public)
│   │   ├── login/
│   │   │   ├── page.tsx           # Login form
│   │   │   └── actions.ts         # Login server action
│   │   ├── register/
│   │   │   ├── page.tsx           # Registration form
│   │   │   └── actions.ts         # Signup server action
│   │   ├── reset-password/
│   │   │   ├── page.tsx           # Request reset form
│   │   │   └── actions.ts         # Reset request action
│   │   └── update-password/
│   │       ├── page.tsx           # Update password form (callback)
│   │       └── actions.ts         # Update password action
│   ├── (dashboard)/               # Protected route group
│   │   ├── layout.tsx             # Auth check + sidebar
│   │   └── ...                    # Protected pages
│   ├── auth/
│   │   └── confirm/
│   │       └── route.ts           # Email confirmation handler
│   └── unauthorized/
│       └── page.tsx               # 403 page
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser client (from Phase 1)
│   │   ├── server.ts              # Server client (from Phase 1)
│   │   └── admin.ts               # Admin client (service role)
│   ├── auth/
│   │   ├── validation.ts          # Zod schemas for auth forms
│   │   └── utils.ts               # Auth helper functions
│   └── hooks/
│       └── use-user.tsx           # Client hook for current user
└── middleware.ts                  # Token refresh (from Phase 1)
```

### Pattern 1: Server Actions for Authentication

**What:** Use Next.js server actions for all auth mutations (signup, login, logout, password reset)
**When to use:** All authentication flows
**Example:**

```typescript
// src/app/(auth)/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/auth/validation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Validate input
  const validated = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { error: 'Invalid email or password format' }
  }

  const { email, password } = validated.data

  // Attempt sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Check if user is banned (pending approval)
    if (error.message.includes('banned')) {
      return { error: 'Your account is pending admin approval' }
    }
    return { error: error.message }
  }

  // Revalidate and redirect
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const validated = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { error: 'Invalid email or password format' }
  }

  const { email, password } = validated.data

  // Create account (will be auto-banned via database trigger)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // Optional: store additional metadata
        full_name: formData.get('full_name'),
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Success - show pending approval message
  redirect('/login?message=Account created. Pending admin approval.')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
```

**Source:** [Supabase Next.js Tutorial - Server Actions](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

### Pattern 2: Manual Approval Workflow with ban_duration

**What:** Implement manual approval by auto-banning new users, then admins unban approved users
**When to use:** Registration flow + admin approval interface
**Example:**

```sql
-- Database setup: Auto-ban new users via trigger
-- Run in Supabase SQL Editor

-- Create function to ban new users
CREATE OR REPLACE FUNCTION ban_new_user()
RETURNS trigger AS $$
BEGIN
  -- Use admin API to ban user for 876000 hours (100 years)
  -- This is done via separate admin API call
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION ban_new_user();
```

```typescript
// src/lib/supabase/admin.ts
// Admin client with service role (server-side only)
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Never expose to client
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

// Server action for admin approval
// src/app/admin/users/actions.ts
'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function approveUser(userId: string) {
  const admin = createAdminClient()

  // Unban user by setting ban_duration to 'none'
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function rejectUser(userId: string) {
  const admin = createAdminClient()

  // Keep user banned or delete account
  // Option 1: Delete user
  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
```

**Note:** Trigger-based auto-ban requires database function that calls admin API. Simpler approach: Use signup webhook or have registration server action immediately ban the user using admin client.

**Alternative simpler pattern:**

```typescript
// src/app/(auth)/register/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // ... validation ...

  // Step 1: Create user account
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error || !data.user) {
    return { error: error?.message || 'Signup failed' }
  }

  // Step 2: Immediately ban user pending approval
  const admin = createAdminClient()
  await admin.auth.admin.updateUserById(data.user.id, {
    ban_duration: '876000h', // 100 years
  })

  redirect('/login?message=Account created. Pending admin approval.')
}
```

**Sources:**
- [Supabase Admin API - updateUserById](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid)
- [GitHub Discussion: How to disable/deactivate a user](https://github.com/orgs/supabase/discussions/9239)

### Pattern 3: Role-Based Access Control with Custom Access Token Hook

**What:** Inject user role from profiles table into JWT claims using Auth Hook
**When to use:** All authenticated requests, checked in RLS policies and server components
**Example:**

```sql
-- Step 1: Create profiles table with roles
-- Run in Supabase SQL Editor

CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Only admins can update profiles
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Step 2: Create Custom Access Token Hook function
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims JSONB;
  user_role user_role;
BEGIN
  -- Fetch user role from profiles table
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = (event->>'user_id')::UUID;

  -- Set claims
  claims := event->'claims';

  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{user_role}', 'null');
  END IF;

  -- Update the 'claims' object in the original event
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

-- Grant execute to supabase_auth_admin
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

-- Revoke execute from PUBLIC and authenticated
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated;

-- Step 3: Create trigger on auth.users to create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Dashboard Configuration:**
1. Go to Supabase Dashboard → Authentication → Hooks (Beta)
2. Select "custom_access_token_hook" from dropdown
3. Enable hook

**Accessing role in application:**

```typescript
// Server component
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Decode JWT to access custom claims
  const token = (await supabase.auth.getSession()).data.session?.access_token
  if (!token) {
    redirect('/login')
  }

  // Parse JWT (base64 decode middle part)
  const payload = JSON.parse(
    Buffer.from(token.split('.')[1], 'base64').toString()
  )

  const userRole = payload.user_role

  if (userRole !== 'admin') {
    redirect('/unauthorized')
  }

  return <div>Admin content</div>
}
```

**Helper function:**

```typescript
// src/lib/auth/utils.ts
import { createClient } from '@/lib/supabase/server'

export async function getUserRole(): Promise<'user' | 'admin' | null> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(session.access_token.split('.')[1], 'base64').toString()
    )
    return payload.user_role || 'user'
  } catch {
    return null
  }
}

export async function requireAdmin() {
  const role = await getUserRole()
  if (role !== 'admin') {
    redirect('/unauthorized')
  }
}
```

**Sources:**
- [Supabase Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [Supabase Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)

### Pattern 4: Protected Routes with Middleware + Layout Auth Checks

**What:** Filter unauthorized requests in middleware, validate in layouts
**When to use:** All protected routes
**Example:**

```typescript
// src/middleware.ts (already exists from Phase 1)
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session - always do this
  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/register')) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

```typescript
// src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/utils'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Always validate with getUser() on server - never trust getSession()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Optional: Get user role for UI rendering
  const role = await getUserRole()

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar userRole={role} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto">
            <form action={logout}>
              <button type="submit">Logout</button>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

**Source:** [Supabase Server-Side Auth - Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)

### Pattern 5: Password Reset Flow

**What:** Send password reset email, handle callback, update password
**When to use:** Forgot password feature
**Example:**

```typescript
// src/app/(auth)/reset-password/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password reset email sent. Check your inbox.' }
}
```

```typescript
// src/app/(auth)/update-password/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updatePassword } from './actions'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verify the token_hash from email link
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (type === 'recovery' && tokenHash) {
      // Token is valid, show form
      return
    }

    // Invalid or missing token
    setError('Invalid password reset link')
  }, [searchParams])

  async function handleSubmit(formData: FormData) {
    const result = await updatePassword(formData)

    if (result.error) {
      setError(result.error)
    } else {
      router.push('/login?message=Password updated successfully')
    }
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <form action={handleSubmit}>
      <input
        type="password"
        name="password"
        placeholder="New password"
        required
        minLength={6}
      />
      <button type="submit">Update Password</button>
    </form>
  )
}
```

```typescript
// src/app/(auth)/update-password/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/login?message=Password updated successfully')
}
```

**Email Template Configuration:**
In Supabase Dashboard → Authentication → Email Templates → Reset Password:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .SiteURL }}/update-password?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a></p>
```

**Sources:**
- [Supabase Password-based Auth](https://supabase.com/docs/guides/auth/passwords)
- [Supabase resetPasswordForEmail API](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail)

### Pattern 6: Client-Side User Hook

**What:** React hook to access current user in Client Components
**When to use:** Client components that need user data or role
**Example:**

```typescript
// src/lib/hooks/use-user.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'user' | 'admin' | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)

      // Decode role from JWT
      if (user) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.access_token) {
            try {
              const payload = JSON.parse(
                atob(session.access_token.split('.')[1])
              )
              setRole(payload.user_role || 'user')
            } catch {
              setRole('user')
            }
          }
        })
      }

      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)

        if (session?.access_token) {
          try {
            const payload = JSON.parse(
              atob(session.access_token.split('.')[1])
            )
            setRole(payload.user_role || 'user')
          } catch {
            setRole('user')
          }
        } else {
          setRole(null)
        }

        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, role, loading }
}
```

**Usage:**

```typescript
'use client'

import { useUser } from '@/lib/hooks/use-user'

export function UserProfile() {
  const { user, role, loading } = useUser()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Not logged in</div>
  }

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Role: {role}</p>
      {role === 'admin' && <p>You have admin privileges</p>}
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Using getSession() for server-side auth checks:** Use `getUser()` which validates the token, not `getSession()` which only reads from storage
- **Storing service_role key in client-side code:** Service role key grants full admin access - only use in server actions/routes
- **Trusting JWT claims without validation:** Always verify user is authenticated before trusting role claims
- **Not revalidating after auth state changes:** Call `revalidatePath('/', 'layout')` after login/logout to clear cached data
- **Implementing custom ban logic when ban_duration exists:** Use Supabase's built-in ban_duration instead of custom database flags
- **Checking auth only in middleware:** Middleware is for filtering; always validate in server components with `getUser()`
- **Updating user_metadata for roles:** Use app_metadata or profiles table for roles; user_metadata can be modified by users

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT decoding | Custom base64 decoder | Built-in Buffer or atob() | Edge cases, encoding issues, security risks |
| Email templates | HTML emails from scratch | Supabase Email Templates | Template variables, testing, deliverability |
| Password validation | Regex patterns | Zod schema + Supabase validation | Complexity rules, i18n, consistent errors |
| Session management | Custom tokens/cookies | @supabase/ssr | SSR compatibility, refresh logic, security |
| User approval workflow | Custom status flags | ban_duration API | Admin UI integration, built-in enforcement |
| RBAC claims | Manual JWT manipulation | Custom Access Token Hook | Server-side, consistent, official pattern |

**Key insight:** Supabase's ban_duration API provides admin dashboard integration - banned users appear with a "Banned" badge in the Users table, making it easy for admins to see pending approvals. Custom database flags don't integrate with the dashboard.

## Common Pitfalls

### Pitfall 1: getSession() vs getUser() Security Risk

**What goes wrong:** Using `getSession()` in server components or API routes to check authentication. Attackers can forge session data.

**Why it happens:** getSession() is faster (no API call) and examples show it being used.

**How to avoid:**
- Always use `supabase.auth.getUser()` in Server Components and Server Actions
- getSession() only reads from storage without validation
- getUser() makes API call to validate JWT signature

**Warning signs:** Documentation warnings about "never trust getSession() inside server code"

**Source:** [Supabase Server-Side Auth - Security](https://supabase.com/docs/guides/auth/server-side/nextjs)

### Pitfall 2: Service Role Key Exposure

**What goes wrong:** Accidentally exposing SUPABASE_SERVICE_ROLE_KEY to client code, granting full database access to anyone.

**Why it happens:** Confusion between SUPABASE_ANON_KEY (safe for client) and SERVICE_ROLE_KEY (server-only).

**How to avoid:**
- Never prefix service role key with NEXT_PUBLIC_
- Only import service role key in Server Actions or Route Handlers
- Use separate admin client file in lib/supabase/admin.ts
- Add service role key to .gitignore check

**Warning signs:** Service role key visible in browser DevTools, client-side errors mentioning service role

### Pitfall 3: Role Claims Not Updating After Change

**What goes wrong:** Admin changes user role in database, but user still has old role in UI until they log out and back in.

**Why it happens:** Custom claims are baked into JWT at sign-in time. JWTs can't be invalidated until expiry.

**How to avoid:**
- Document that role changes require user to log out/in
- Consider shorter JWT expiry (default 1 hour)
- For immediate effect, implement server-side role checks in addition to JWT claims
- Show "Role updated. Please log out and log back in." message to admins

**Warning signs:** User sees old role, RLS policies deny access despite role change

**Source:** [Supabase Custom Claims - Limitations](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)

### Pitfall 4: Email Confirmation vs Manual Approval Confusion

**What goes wrong:** Email confirmation is enabled AND manual approval is implemented, creating double-gated workflow that confuses users.

**Why it happens:** Email confirmation is default setting in Supabase.

**How to avoid:**
- Disable "Confirm Email" in Supabase Dashboard → Authentication → Providers → Email
- Manual approval (ban_duration) replaces need for email confirmation
- If both are needed, make UX clear: "Confirm email first, then wait for approval"

**Warning signs:** Users confirm email but still can't log in (banned), confusion in support requests

### Pitfall 5: Redirect Loop on Auth Pages

**What goes wrong:** Authenticated users trying to access /login get redirected to /dashboard, which redirects back to /login infinitely.

**Why it happens:** Middleware and layout both checking auth, conflicting redirect logic.

**How to avoid:**
- Handle auth page redirects in middleware only
- Don't check auth in auth page layouts
- Use `searchParams` to show messages instead of multiple redirects
- Test: Log in, manually navigate to /login - should redirect to dashboard

**Warning signs:** Browser "too many redirects" error, auth state inconsistent

### Pitfall 6: Password Reset Token Expiry Not Handled

**What goes wrong:** User clicks reset link after 24 hours (default expiry), sees generic error, doesn't know to request new link.

**Why it happens:** No explicit expiry check, poor error handling.

**How to avoid:**
- Check token validity on update-password page load
- Show clear error: "Reset link expired. Request a new one."
- Add timestamp to reset request success message: "Link valid for 24 hours"
- Consider configuring shorter expiry for security

**Warning signs:** Users confused why reset doesn't work, expired token errors

## Code Examples

Verified patterns from official sources:

### Complete Login Form with Error Handling

```typescript
// src/app/(auth)/login/page.tsx
'use client'

import { useActionState } from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null)

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded">
                {state.error}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                disabled={pending}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={pending}
              />
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Logging in...' : 'Log in'}
            </Button>

            <div className="text-sm text-center space-y-2">
              <Link href="/reset-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
              <div>
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Source:** [Next.js Server Actions with useActionState](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### Admin User Management Interface

```typescript
// src/app/admin/users/page.tsx
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/utils'
import { approveUser, rejectUser } from './actions'
import { Button } from '@/components/ui/button'

export default async function AdminUsersPage() {
  // Protect route - redirects if not admin
  await requireAdmin()

  const admin = createAdminClient()

  // Fetch all users
  const { data: { users }, error } = await admin.auth.admin.listUsers()

  if (error) {
    return <div>Error loading users: {error.message}</div>
  }

  // Filter pending users (banned)
  const pendingUsers = users.filter(user => user.banned_until)
  const approvedUsers = users.filter(user => !user.banned_until)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Pending Approval</h2>
        <div className="mt-4 space-y-2">
          {pendingUsers.length === 0 ? (
            <p className="text-muted-foreground">No pending users</p>
          ) : (
            pendingUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded">
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={approveUser.bind(null, user.id)}>
                    <Button type="submit" variant="default">
                      Approve
                    </Button>
                  </form>
                  <form action={rejectUser.bind(null, user.id)}>
                    <Button type="submit" variant="destructive">
                      Reject
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">Approved Users</h2>
        <div className="mt-4 space-y-2">
          {approvedUsers.map(user => (
            <div key={user.id} className="p-4 border rounded">
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                Role: {user.user_metadata?.role || 'user'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Form Validation with Zod

```typescript
// src/lib/auth/validation.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| API routes for auth | Server Actions | Next.js 13+ App Router | Simpler, type-safe, progressive enhancement |
| Manual RLS for roles | Custom Access Token Hook | Supabase 2024 | Server-side role injection, official pattern |
| Custom approval flags | ban_duration API | Supabase GoTrue updates | Dashboard integration, built-in enforcement |
| user_metadata for roles | app_metadata or profiles | Security best practice | Prevents client-side role manipulation |
| getSession() everywhere | getUser() on server | Security advisory 2024 | Prevents JWT forgery attacks |
| Manual email templates | Supabase Email Templates UI | Supabase Dashboard updates | Template variables, easier testing |

**Deprecated/outdated:**
- Using `getSession()` for server-side auth checks: Security risk, always use `getUser()`
- Storing roles in `user_metadata`: Client can modify, use `app_metadata` or profiles table
- Custom account status flags: Use `ban_duration` for better dashboard integration
- API routes for auth mutations: Use Server Actions for simpler, type-safe code

## Open Questions

Things that couldn't be fully resolved:

1. **Automated ban on signup without database trigger**
   - What we know: Can ban user in signup server action after account creation
   - What's unclear: Whether there's a Supabase setting to auto-ban new signups
   - Recommendation: Use server action approach (simpler, no database functions needed)

2. **Email confirmation and manual approval interaction**
   - What we know: Both create approval gates
   - What's unclear: Best UX when both are needed vs disabling email confirmation
   - Recommendation: Disable email confirmation for simpler UX, use manual approval only

3. **JWT expiry vs role change latency**
   - What we know: Role changes don't take effect until new JWT issued
   - What's unclear: Best practices for immediate role revocation
   - Recommendation: Document limitation, consider server-side checks for critical operations

4. **Permission overrides at email level (AUTH-09)**
   - What we know: Requirement mentions email-level permission overrides
   - What's unclear: How to implement email-specific overrides beyond role
   - Recommendation: Add `permission_overrides` JSONB column to profiles table, check in RLS policies

## Sources

### Primary (HIGH confidence)

- [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) - SSR clients, middleware patterns, getUser() security
- [Supabase User Management Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs) - Server actions, auth flow examples
- [Supabase Password-based Auth](https://supabase.com/docs/guides/auth/passwords) - Password reset, email templates
- [Supabase Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) - Auth hooks, role injection
- [Supabase Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook) - Hook implementation
- [Supabase Admin API - updateUserById](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid) - ban_duration usage
- [Supabase Managing User Data](https://supabase.com/docs/guides/auth/managing-user-data) - Metadata, profiles table patterns
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) - App Router auth patterns

### Secondary (MEDIUM confidence)

- [GitHub Discussion: How to disable/deactivate a user](https://github.com/orgs/supabase/discussions/9239) - ban_duration discussion
- [GitHub Discussion: RLS policy based on user metadata](https://github.com/orgs/supabase/discussions/13091) - Metadata in policies
- [Password Reset Flow Discussion](https://github.com/orgs/supabase/discussions/30402) - Community patterns
- [Medium: Next.js + Supabase Cookie-Based Auth (2025)](https://the-shubham.medium.com/next-js-supabase-cookie-based-auth-workflow-the-best-auth-solution-2025-guide-f6738b4673c1) - Current best practices
- [Medium: Supabase SSR in Next.js 14 (Jan 2026)](https://medium.com/@zeyd.ajraou/the-easiest-way-to-setup-supabase-ssr-in-next-js-14-c590f163773d) - Recent setup guide

### Tertiary (LOW confidence)

- Community tutorials on role-based routing - Patterns vary, official docs preferred

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Supabase and Next.js documentation
- Architecture: HIGH - Based on official patterns and examples
- Manual approval workflow: MEDIUM - No built-in feature, using ban_duration workaround
- RBAC implementation: HIGH - Official Custom Access Token Hook pattern
- Pitfalls: HIGH - From official security advisories and common issues

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable auth patterns, active development)

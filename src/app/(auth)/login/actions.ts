'use server'

import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/auth/validation'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  // Validate input
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!result.success) {
    return { error: 'Invalid email or password format' }
  }

  const { email, password } = result.data

  // Attempt sign in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Check if user is banned (pending approval)
    if (error.message.toLowerCase().includes('banned')) {
      return {
        error:
          'Your account is pending admin approval. Please contact an administrator.',
      }
    }
    return { error: error.message }
  }

  // Revalidate and redirect to dashboard
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

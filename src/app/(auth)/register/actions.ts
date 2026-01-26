'use server'

import { createClient } from '@/lib/supabase/server'
import { signupSchema } from '@/lib/auth/validation'
import { redirect } from 'next/navigation'

export async function signup(prevState: any, formData: FormData) {
  // Extract form data
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate with Zod schema
  const result = signupSchema.safeParse({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  })

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const errorMessage =
      errors.firstName?.[0] ||
      errors.lastName?.[0] ||
      errors.email?.[0] ||
      errors.password?.[0] ||
      errors.confirmPassword?.[0] ||
      'Validation failed'

    return { error: errorMessage }
  }

  // Create user with Supabase, passing names as metadata
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: {
        first_name: result.data.firstName,
        last_name: result.data.lastName,
      },
    },
  })

  if (error || !data.user) {
    return { error: error?.message || 'Failed to create account' }
  }

  // Profile is auto-created by database trigger with approved_at = NULL
  // User will be redirected to pending-approval page when they try to access dashboard

  // Redirect to login with success message
  redirect('/login?message=Account created. Pending admin approval.')
}

'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { signupSchema } from '@/lib/auth/validation'
import { redirect } from 'next/navigation'

export async function signup(prevState: any, formData: FormData) {
  // Extract form data
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate with Zod schema
  const result = signupSchema.safeParse({
    email,
    password,
    confirmPassword,
  })

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const errorMessage =
      errors.email?.[0] ||
      errors.password?.[0] ||
      errors.confirmPassword?.[0] ||
      'Validation failed'

    return { error: errorMessage }
  }

  // Create user with Supabase
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  })

  if (error || !data.user) {
    return { error: error?.message || 'Failed to create account' }
  }

  // Immediately ban user pending admin approval
  // Using ban_duration of 876000h (100 years) as a "pending approval" state
  const admin = createAdminClient()
  const { error: banError } = await admin.auth.admin.updateUserById(
    data.user.id,
    {
      ban_duration: '876000h',
    }
  )

  if (banError) {
    console.error('Failed to ban user:', banError)
    // Don't fail registration if ban fails - user can be banned manually
  }

  // Redirect to login with success message
  redirect('/login?message=Account created. Pending admin approval.')
}

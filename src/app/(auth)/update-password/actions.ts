'use server'

import { createClient } from '@/lib/supabase/server'
import { updatePasswordSchema } from '@/lib/auth/validation'
import { redirect } from 'next/navigation'

export async function updatePassword(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const validated = updatePasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validated.success) {
    const errors = validated.error.issues.map((e: any) => e.message).join(', ')
    return { error: errors }
  }

  const { password } = validated.data

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/login?message=Password updated successfully. Please log in.')
}

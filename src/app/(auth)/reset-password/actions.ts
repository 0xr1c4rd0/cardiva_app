'use server'

import { createClient } from '@/lib/supabase/server'
import { resetPasswordSchema } from '@/lib/auth/validation'

export async function requestPasswordReset(
  prevState: any,
  formData: FormData
) {
  const supabase = await createClient()

  const validated = resetPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validated.success) {
    return { error: 'Invalid email address' }
  }

  const { email } = validated.data

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?type=recovery&next=/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password reset email sent. Check your inbox.' }
}

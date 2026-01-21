'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'
import { revalidatePath } from 'next/cache'

export async function approveUser(userId: string) {
  await requireAdmin() // Double-check admin status

  const admin = createAdminClient()

  // Remove ban
  const { error: banError } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })

  if (banError) {
    return { error: banError.message }
  }

  // Update profile approved_at timestamp
  const supabase = await createClient()
  await supabase
    .from('profiles')
    .update({ approved_at: new Date().toISOString() })
    .eq('id', userId)

  revalidatePath('/admin/users')
  return { success: true }
}

export async function rejectUser(userId: string) {
  await requireAdmin()

  const admin = createAdminClient()

  // Delete the user account
  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

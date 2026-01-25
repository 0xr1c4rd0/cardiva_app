'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/utils'
import { revalidatePath } from 'next/cache'

interface EmailSettingsInput {
  email_default_recipients: string[]
  email_user_can_edit: boolean
  email_defaults_replaceable: boolean
}

export async function updateEmailSettings(settings: EmailSettingsInput) {
  await requireAdmin()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('app_settings')
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
      updated_by: user?.id,
    })
    .eq('id', 1)

  if (error) {
    console.error('updateEmailSettings error:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/settings')
  return { success: true }
}

interface ColumnConfigInput {
  id: number
  display_name: string
  visible: boolean
  display_order: number
}

export async function updateExportColumnConfig(columns: ColumnConfigInput[]) {
  await requireAdmin()

  const supabase = await createClient()

  // Update each column
  for (const col of columns) {
    const { error } = await supabase
      .from('export_column_config')
      .update({
        display_name: col.display_name,
        visible: col.visible,
        display_order: col.display_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', col.id)

    if (error) {
      console.error('updateExportColumnConfig error:', error)
      return { error: error.message }
    }
  }

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function updateInventoryColumnConfig(columns: ColumnConfigInput[]) {
  await requireAdmin()

  const supabase = await createClient()

  for (const col of columns) {
    const { error } = await supabase
      .from('inventory_column_config')
      .update({
        display_name: col.display_name,
        visible: col.visible,
        display_order: col.display_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', col.id)

    if (error) {
      console.error('updateInventoryColumnConfig error:', error)
      return { error: error.message }
    }
  }

  revalidatePath('/admin/settings')
  revalidatePath('/inventory')
  return { success: true }
}

export async function syncExportColumns() {
  await requireAdmin()

  const supabase = await createClient()

  const { error } = await supabase.rpc('sync_export_columns')

  if (error) {
    console.error('syncExportColumns error:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/settings')
  return { success: true }
}

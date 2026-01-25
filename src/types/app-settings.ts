/**
 * App settings from the app_settings table (single-row pattern)
 */
export interface AppSettings {
  id: number
  email_default_recipients: string[]
  email_user_can_edit: boolean
  email_defaults_replaceable: boolean
  updated_at: string
  updated_by: string | null
}

/**
 * Behavior modes for email recipient configuration
 *
 * | Mode | Conditions | UX |
 * |------|------------|-----|
 * | no-defaults | empty recipients | Empty input, user adds 1-10 |
 * | locked | has recipients, !user_can_edit | Read-only chips only |
 * | add-only | has recipients, user_can_edit, !defaults_replaceable | Locked chips + input |
 * | replaceable | has recipients, user_can_edit, defaults_replaceable | Removable chips + input |
 */
export type EmailRecipientMode = 'no-defaults' | 'locked' | 'add-only' | 'replaceable'

/**
 * Derive the email recipient mode from app settings
 */
export function getEmailRecipientMode(settings: AppSettings | null): EmailRecipientMode {
  if (!settings || settings.email_default_recipients.length === 0) {
    return 'no-defaults'
  }
  if (!settings.email_user_can_edit) {
    return 'locked'
  }
  if (!settings.email_defaults_replaceable) {
    return 'add-only'
  }
  return 'replaceable'
}

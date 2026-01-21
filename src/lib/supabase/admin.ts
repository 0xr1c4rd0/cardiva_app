import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client with service_role key
 *
 * Used for privileged operations like:
 * - Banning users during registration
 * - Admin-only database operations
 *
 * IMPORTANT: Only use on server-side (never expose service_role key to client)
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin client')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

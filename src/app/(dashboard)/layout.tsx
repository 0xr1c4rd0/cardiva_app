import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { UserMenu } from '@/components/layout/user-menu'

// Force dynamic rendering to prevent caching of auth state
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth check - validate user session
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Check if user is approved
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('approved_at')
    .eq('id', user.id)
    .single()

  // Log for debugging (remove in production)
  console.log('Profile check:', {
    userId: user.id,
    userEmail: user.email,
    profile: profile,
    profileError: profileError?.message,
    approved_at: profile?.approved_at,
    approved_at_type: typeof profile?.approved_at,
  })

  // If profile doesn't exist or approved_at is null, redirect to pending approval
  if (profileError || !profile || !profile.approved_at) {
    console.log('Redirecting to pending-approval because:', {
      hasProfileError: !!profileError,
      hasProfile: !!profile,
      hasApprovedAt: !!profile?.approved_at,
    })
    redirect('/pending-approval')
  }

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <UserMenu />
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[1200px] p-6 lg:p-10">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

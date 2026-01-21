import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { UserMenu } from '@/components/layout/user-menu'

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

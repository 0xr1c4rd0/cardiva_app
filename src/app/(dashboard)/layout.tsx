import { cookies } from 'next/headers'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          {/* User menu will be added in Auth phase */}
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

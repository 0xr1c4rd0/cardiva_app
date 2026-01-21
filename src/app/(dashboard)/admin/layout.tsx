import { requireAdmin } from '@/lib/auth/utils'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This will redirect to /unauthorized if not admin
  await requireAdmin()

  return <>{children}</>
}

/**
 * Auth route group layout
 *
 * Provides a simple centered layout without sidebar for authentication pages:
 * - /login
 * - /register
 * - /reset-password
 * - /update-password
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {children}
    </div>
  )
}

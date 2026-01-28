import Image from 'next/image'

/**
 * Auth route group layout
 *
 * Provides a split-screen layout with illustration for authentication pages:
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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Illustration */}
      <div className="hidden lg:flex lg:flex-col bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-6 items-center justify-center">
        <div className="relative w-full max-w-2xl">
          <Image
            src="/cardiva-ai-illustration.webp"
            alt="Cardiva AI - Pharmaceutical RFP Matching Platform"
            width={800}
            height={800}
            priority
            className="w-full h-auto"
          />
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}

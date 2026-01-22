import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/(auth)/login/actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, LogOut, Mail } from 'lucide-react'

// Force dynamic rendering to prevent caching of auth state
export const dynamic = 'force-dynamic'

export default async function PendingApprovalPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not logged in, redirect to login
  if (!user) {
    redirect('/login')
  }

  // Check if user is already approved
  const { data: profile } = await supabase
    .from('profiles')
    .select('approved_at')
    .eq('id', user.id)
    .single()

  // If approved, redirect to dashboard
  if (profile?.approved_at) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          <CardDescription className="mt-2">
            Your account has been created but requires administrator approval
            before you can access the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Signed in as</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            An administrator will review your account and grant access. You will
            be able to log in once your account has been approved.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <form action={logout} className="w-full">
            <Button type="submit" variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            Need help? Contact your administrator.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

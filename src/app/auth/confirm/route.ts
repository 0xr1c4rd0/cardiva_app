import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Redirect to the next URL after successful verification
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // Redirect to error page or login with error message
  return NextResponse.redirect(
    new URL('/login?message=Invalid or expired link', request.url)
  )
}

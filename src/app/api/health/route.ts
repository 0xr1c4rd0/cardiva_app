import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test connection by making a simple query
    // This query will fail gracefully if table doesn't exist
    const { error } = await supabase
      .from('artigos')
      .select('count')
      .limit(0)
      .single()

    // If we get a "relation does not exist" error, connection works
    // but table doesn't exist - that's fine for this check
    if (error && !error.message.includes('does not exist')) {
      // Real connection error
      return NextResponse.json(
        {
          status: 'error',
          message: error.message,
          supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      supabase: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing'
      },
      { status: 500 }
    )
  }
}

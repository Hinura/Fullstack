// app/api/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/auth/login?error=Authentication failed', requestUrl.origin))
      }

      // Profile creation should be handled by the database trigger
      // The trigger will automatically create a profile when a user is created
      // No need to manually create profiles in the callback
    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(new URL('/auth/login?error=Authentication failed', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL('/dashboard/learn?welcome=true', requestUrl.origin))
}
// app/api/auth/callback/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')

  // Handle auth errors from Supabase
  if (error) {
    console.error('Auth callback error:', error, error_description)
    const errorMessage = error === 'access_denied'
      ? 'Access was denied. Please try again.'
      : 'Authentication failed. Please try again.'
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin))
  }

  if (code) {
    try {
      const cookieStore = await cookies()

      // Create Supabase client with proper cookie handling for PKCE
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              try {
                cookieStore.set({ name, value, ...options })
              } catch {
                // The `set` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing user sessions.
              }
            },
            remove(name: string, options: CookieOptions) {
              try {
                cookieStore.set({ name, value: '', ...options })
              } catch {
                // The `delete` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing user sessions.
              }
            },
          },
        }
      )

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Auth callback exchange error:', exchangeError)
        return NextResponse.redirect(new URL('/auth/login?error=Email verification failed', requestUrl.origin))
      }

      // Check if this is a new user (first time confirming email)
      const isNewUser = data.user?.email_confirmed_at &&
                       new Date(data.user.email_confirmed_at).getTime() - new Date(data.user.created_at!).getTime() < 60000 // Within 1 minute

      // Profile creation should be handled by the database trigger
      // The trigger will automatically create a profile when a user is created
      // No need to manually create profiles in the callback

      // Add small delay to ensure database triggers have completed
      if (isNewUser) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Check if user has completed assessment (has skill levels)
      let hasCompletedAssessment = false
      if (data.user?.id) {
        const { data: skillLevels } = await supabase
          .from('user_skill_levels')
          .select('id')
          .eq('user_id', data.user.id)
          .limit(1)

        hasCompletedAssessment = Boolean(skillLevels && skillLevels.length > 0)
      }

      // Redirect logic based on user status
      let redirectUrl = '/dashboard'

      if (isNewUser && !hasCompletedAssessment) {
        // New user - show confirmation success page first
        redirectUrl = '/auth/confirmed'
      } else if (isNewUser && hasCompletedAssessment) {
        // New user who already completed assessment (edge case)
        redirectUrl = '/dashboard?welcome=true&new_user=true'
      } else if (!hasCompletedAssessment) {
        // Existing user who hasn't completed assessment yet
        redirectUrl = '/dashboard/assessment'
      } else {
        // Existing user who completed assessment - go to dashboard
        redirectUrl = '/dashboard'
      }

      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))

    } catch (error) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(new URL('/auth/login?error=Authentication failed', requestUrl.origin))
    }
  }

  // No code parameter - invalid callback
  return NextResponse.redirect(new URL('/auth/login?error=Invalid authentication callback', requestUrl.origin))
}
// lib/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  let user = null

  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser()

    if (error) {
      // If refresh token is invalid, clear the session
      await supabase.auth.signOut()
    } else {
      user = authUser
    }
  } catch (error) {
    // Handle any auth errors by treating user as logged out
    console.error('Auth error in middleware:', error)
  }

  // Protect /dashboard routes - redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const redirectUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/auth') && user) {
    const redirectUrl = new URL('/dashboard/learn', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
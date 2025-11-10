import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Test Login Endpoint for API Testing
 *
 * Use this to get authenticated session for Postman/curl testing
 * This sets the session cookies properly for subsequent API calls
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Cookies are automatically set by Supabase
    return NextResponse.json({
      success: true,
      message: 'Login successful! Cookies have been set.',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        access_token: data.session.access_token,
        expires_at: data.session.expires_at,
      },
      next_steps: 'You can now make authenticated requests to other endpoints'
    })

  } catch (error) {
    console.error('Test login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

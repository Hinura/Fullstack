// lib/api-middleware.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function requireAuth(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      user: null,
      supabase: null
    }
  }

  return { error: null, user, supabase }
}

// Usage in route handlers:
// const auth = await requireAuth(request)
// if (auth.error) return auth.error
// const { user, supabase } = auth

// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use default browser client without custom cookie handlers
  // This allows Supabase to use its built-in storage mechanism
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
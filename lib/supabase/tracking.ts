import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * A lightweight, cookie-free Supabase client for fire-and-forget
 * operations like click tracking inside next/server `after()` callbacks.
 *
 * `after()` runs AFTER the response has been streamed to the client,
 * so `next/headers` cookies() is no longer available. We bypass that
 * entirely by using the anon key directly with no auth context.
 * RLS on the `clicks` table must allow anon inserts (or use service role).
 */
export function createTrackingClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // No persistent session needed — this client only inserts clicks
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}

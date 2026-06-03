import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  // Behind Coolify's reverse proxy, request.url gives localhost:3000.
  // Prefer x-forwarded-host, then NEXT_PUBLIC_SITE_URL, then request origin.
  const forwardedHost  = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const siteUrl =
    (process.env.NEXT_PUBLIC_SITE_URL ?? '').split(',')[0].trim().replace(/\/+$/, '')

  const baseUrl = forwardedHost
    ? `${forwardedProto.split(',')[0].trim()}://${forwardedHost.split(',')[0].trim()}`
    : siteUrl || new URL(request.url).origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { /* called from Server Component */ }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // ── Upsert profile with name from provider metadata ──────────
      // Google OAuth provides: given_name, family_name, full_name, name
      // Email signup provides: first_name, last_name (set via options.data)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const meta = user.user_metadata ?? {}
        const firstName =
          (meta.first_name as string) ||
          (meta.given_name as string) ||
          ((meta.full_name || meta.name || '') as string).split(' ')[0] ||
          ''
        const lastName =
          (meta.last_name as string) ||
          (meta.family_name as string) ||
          ((meta.full_name || meta.name || '') as string).split(' ').slice(1).join(' ') ||
          ''

        await supabase.from('profiles').upsert(
          {
            id:         user.id,
            email:      user.email ?? '',
            first_name: firstName || null,
            last_name:  lastName  || null,
          },
          { onConflict: 'id', ignoreDuplicates: false }
        )
      }
      // ─────────────────────────────────────────────────────────────

      return NextResponse.redirect(`${baseUrl}${next}`)
    }
  }

  return NextResponse.redirect(`${baseUrl}/?auth_error=true`)
}

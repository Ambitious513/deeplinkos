import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const errParam = searchParams.get('error')
  const errDesc = searchParams.get('error_description')

  // Construct the base URL using the request origin
  // Since we now use window.location.origin for the redirect, 
  // request.url's host (or x-forwarded-host) will perfectly match.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  
  const baseUrl = forwardedHost
    ? `${forwardedProto.split(',')[0].trim()}://${forwardedHost.split(',')[0].trim()}`
    : new URL(request.url).origin

  if (errParam) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=true&msg=${encodeURIComponent(errDesc || errParam)}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                // Ensure we don't accidentally set domain restrictions that conflict 
                // with what the browser client set if it used the apex domain.
                // It's safest to just forward the options Next.js/Supabase provides.
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Upsert profile with name from provider metadata
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

      return NextResponse.redirect(`${baseUrl}${next}`)
    } else {
      // Provide a helpful fallback parameter if it's the specific PKCE error
      let msg = error.message;
      if (msg.includes("PKCE code verifier not found")) {
         msg = "Login failed due to a missing security cookie. This usually happens if you are using an in-app browser (like Instagram) or strict privacy settings. Please open the site in a standard browser like Safari or Chrome.";
      }
      return NextResponse.redirect(`${baseUrl}/?auth_error=true&msg=${encodeURIComponent(msg)}`)
    }
  }

  return NextResponse.redirect(`${baseUrl}/?auth_error=true&msg=no_code`)
}

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Known app domains — requests from these hosts are treated normally
const APP_HOSTS = new Set([
  'deeplinkos.com',
  'www.deeplinkos.com',
  'localhost',
  '127.0.0.1'
]);

function isAppHost(hostname: string): boolean {
  return APP_HOSTS.has(hostname) || hostname.endsWith('.deeplinkos.com');
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ─── Custom Domain Routing ───────────────────────────────────
  // If the request comes from a host that is NOT the main app domain,
  // treat the path as a slug and rewrite to /r/[slug] for deep link resolution.
  const hostname = request.headers.get('host')?.split(':')[0] || '';
  if (!isAppHost(hostname)) {
    const pathname = request.nextUrl.pathname;
    // Only rewrite root-level paths (not /api, /_next, etc.)
    if (pathname !== '/' && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const slug = pathname.replace(/^\//, '');
      if (slug && !slug.includes('/')) {
        const url = request.nextUrl.clone();
        url.pathname = `/r/${slug}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  const isDashboardRoute =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/analytics') ||
    request.nextUrl.pathname.startsWith('/settings')

  // Protect dashboard routes — redirect unauthenticated users to home (auth modal opens via ?auth=required)
  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('auth', 'required')
    return NextResponse.redirect(url)
  }

  // Enforce onboarding — users without first/last name go to /onboarding first
  if (isDashboardRoute && user) {
    const meta = user.user_metadata || {}
    if (!meta.first_name || !meta.last_name) {
      if (!request.nextUrl.pathname.startsWith('/onboarding')) {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

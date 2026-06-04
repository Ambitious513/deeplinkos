import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  let domain = undefined;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Extract apex domain (e.g., from www.deeplinkos.com to .deeplinkos.com)
    if (!/^\d+\.\d+\.\d+\.\d+$/.test(hostname) && hostname !== 'localhost') {
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        domain = '.' + parts.slice(-2).join('.');
      }
    }
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      }
    }
  )
}

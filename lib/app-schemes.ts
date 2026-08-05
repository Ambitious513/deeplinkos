/**
 * lib/app-schemes.ts
 *
 * Registry of popular apps with their iOS URI schemes and Android package names.
 * Used for:
 *  1. Auto-detecting deep link schemes from a destination URL at link creation time.
 *  2. Generating Android intent:// URIs for seamless IAB routing.
 *  3. Showing "Smart routing ready" in the create-link UI.
 */

export interface AppScheme {
  /** Human-readable app name */
  name: string
  /** iOS URI scheme prefix  e.g. "vnd.youtube://"  */
  iosScheme: string | null
  /** Android package name  e.g. "com.google.android.youtube" */
  androidPackage: string | null
  /**
   * Converts a destination HTTPS URL into the app-specific deep link URL.
   * Returns null if the URL cannot be mapped (fall back to web URL).
   */
  toDeepLink: (url: URL) => string | null
}

// ─── Registry ─────────────────────────────────────────────────────────────────

export const APP_SCHEMES: AppScheme[] = [
  // ── Video / Streaming ──────────────────────────────────────────────────────
  {
    name: 'YouTube',
    iosScheme: 'vnd.youtube://',
    androidPackage: 'com.google.android.youtube',
    toDeepLink: (url) => {
      // youtube.com/watch?v=ID  →  vnd.youtube://ID
      const v = url.searchParams.get('v')
      if (v) return `vnd.youtube://${v}`
      // youtube.com/channel/ID or /c/NAME or /@handle
      const m = url.pathname.match(/^\/(channel|c|@)(\/[^/]+)/)
      if (m) return `vnd.youtube://www.youtube.com${url.pathname}`
      return `vnd.youtube://www.youtube.com${url.pathname}${url.search}`
    },
  },
  {
    name: 'TikTok',
    iosScheme: 'snssdk1128://',
    androidPackage: 'com.zhiliaoapp.musically',
    toDeepLink: (url) => {
      // tiktok.com/@username  →  snssdk1128://user/profile/username
      const user = url.pathname.match(/^\/@([^/]+)/)
      if (user) return `snssdk1128://user/profile/${user[1]}`
      // tiktok.com/video/ID
      const video = url.pathname.match(/\/video\/(\d+)/)
      if (video) return `snssdk1128://video/${video[1]}`
      return null
    },
  },
  {
    name: 'Instagram',
    iosScheme: 'instagram://',
    androidPackage: 'com.instagram.android',
    toDeepLink: (url) => {
      const user = url.pathname.match(/^\/([A-Za-z0-9_.]+)\/?$/)
      if (user) return `instagram://user?username=${user[1]}`
      const p = url.pathname.match(/^\/p\/([^/]+)/)
      if (p) return `instagram://media?id=${p[1]}`
      return `instagram://app`
    },
  },
  {
    name: 'Spotify',
    iosScheme: 'spotify://',
    androidPackage: 'com.spotify.music',
    toDeepLink: (url) => {
      // open.spotify.com/track/ID  →  spotify://track/ID
      const m = url.pathname.match(/^\/(track|album|artist|playlist|episode|show)\/([^/?]+)/)
      if (m) return `spotify://${m[1]}/${m[2]}`
      return `spotify://`
    },
  },
  {
    name: 'Apple Music',
    iosScheme: 'music://',
    androidPackage: null, // No Android app — redirect to web
    toDeepLink: (url) => `music://${url.host}${url.pathname}${url.search}`,
  },
  {
    name: 'Netflix',
    iosScheme: 'nflx://',
    androidPackage: 'com.netflix.mediaclient',
    toDeepLink: (url) => {
      const m = url.pathname.match(/\/title\/(\d+)/)
      if (m) return `nflx://www.netflix.com/title/${m[1]}`
      return `nflx://www.netflix.com${url.pathname}`
    },
  },
  {
    name: 'Twitch',
    iosScheme: 'twitch://',
    androidPackage: 'tv.twitch.android.app',
    toDeepLink: (url) => {
      const user = url.pathname.match(/^\/([^/]+)\/?$/)
      if (user) return `twitch://stream/${user[1]}`
      return `twitch://`
    },
  },

  // ── Social / Messaging ─────────────────────────────────────────────────────
  {
    name: 'Twitter / X',
    iosScheme: 'twitter://',
    androidPackage: 'com.twitter.android',
    toDeepLink: (url) => {
      const user = url.pathname.match(/^\/([A-Za-z0-9_]+)\/?$/)
      if (user) return `twitter://user?screen_name=${user[1]}`
      const status = url.pathname.match(/\/status\/(\d+)/)
      if (status) return `twitter://status?id=${status[1]}`
      return `twitter://`
    },
  },
  {
    name: 'Facebook',
    iosScheme: 'fb://',
    androidPackage: 'com.facebook.katana',
    toDeepLink: () => `fb://`,
  },
  {
    name: 'LinkedIn',
    iosScheme: 'linkedin://',
    androidPackage: 'com.linkedin.android',
    toDeepLink: (url) => {
      const company = url.pathname.match(/\/company\/([^/]+)/)
      if (company) return `linkedin://company/${company[1]}`
      const person = url.pathname.match(/\/in\/([^/]+)/)
      if (person) return `linkedin://profile/${person[1]}`
      return `linkedin://`
    },
  },
  {
    name: 'Pinterest',
    iosScheme: 'pinterest://',
    androidPackage: 'com.pinterest',
    toDeepLink: (url) => `pinterest://${url.pathname}`,
  },
  {
    name: 'Reddit',
    iosScheme: 'reddit://',
    androidPackage: 'com.reddit.frontpage',
    toDeepLink: (url) => {
      const sub = url.pathname.match(/\/r\/([^/]+)/)
      if (sub) return `reddit://r/${sub[1]}`
      return `reddit://`
    },
  },
  {
    name: 'Snapchat',
    iosScheme: 'snapchat://',
    androidPackage: 'com.snapchat.android',
    toDeepLink: () => `snapchat://`,
  },
  {
    name: 'Telegram',
    iosScheme: 'tg://',
    androidPackage: 'org.telegram.messenger',
    toDeepLink: (url) => {
      const user = url.pathname.match(/^\/([A-Za-z0-9_]+)\/?$/)
      if (user) return `tg://resolve?domain=${user[1]}`
      return `tg://`
    },
  },
  {
    name: 'WhatsApp',
    iosScheme: 'whatsapp://',
    androidPackage: 'com.whatsapp',
    toDeepLink: () => `whatsapp://`,
  },
  {
    name: 'Discord',
    iosScheme: 'discord://',
    androidPackage: 'com.discord',
    toDeepLink: (url) => `discord:/${url.pathname}`,
  },

  // ── E-commerce ─────────────────────────────────────────────────────────────
  {
    name: 'Amazon',
    iosScheme: 'com.amazon.mobile.shopping.web://',
    androidPackage: 'com.amazon.mShop.android.shopping',
    toDeepLink: (url) => {
      const dp = url.pathname.match(/\/dp\/([A-Z0-9]{10})/)
      if (dp) return `com.amazon.mobile.shopping.web://www.amazon.com/dp/${dp[1]}`
      return `com.amazon.mobile.shopping.web://www.amazon.com${url.pathname}${url.search}`
    },
  },
  {
    name: 'eBay',
    iosScheme: 'ebay://',
    androidPackage: 'com.ebay.mobile',
    toDeepLink: (url) => `ebay://rover/1/711-53200-19255-0/1?mpre=${encodeURIComponent(url.toString())}`,
  },
  {
    name: 'Etsy',
    iosScheme: 'etsy://',
    androidPackage: 'com.etsy.android',
    toDeepLink: () => `etsy://`,
  },

  // ── Music / Podcasts ───────────────────────────────────────────────────────
  {
    name: 'SoundCloud',
    iosScheme: 'soundcloud://',
    androidPackage: 'com.soundcloud.android',
    toDeepLink: (url) => `soundcloud://${url.pathname.replace(/^\//, '')}`,
  },
  {
    name: 'Deezer',
    iosScheme: 'deezer://',
    androidPackage: 'deezer.android.app',
    toDeepLink: (url) => {
      const m = url.pathname.match(/\/(track|album|artist|playlist)\/(\d+)/)
      if (m) return `deezer://${m[1]}/${m[2]}`
      return `deezer://`
    },
  },

  // ── Productivity / Business ────────────────────────────────────────────────
  {
    name: 'Notion',
    iosScheme: 'notion://',
    androidPackage: 'notion.id',
    toDeepLink: (url) => `notion://${url.pathname}`,
  },
  {
    name: 'Slack',
    iosScheme: 'slack://',
    androidPackage: 'com.Slack',
    toDeepLink: (url) => {
      const team = url.hostname.replace('.slack.com', '')
      return `slack://open?team=${team}`
    },
  },
  {
    name: 'Zoom',
    iosScheme: 'zoomus://',
    androidPackage: 'us.zoom.videomeetings',
    toDeepLink: (url) => {
      const m = url.pathname.match(/\/j\/(\d+)/)
      if (m) return `zoomus://zoom.us/join?confno=${m[1]}&pwd=${url.searchParams.get('pwd') ?? ''}`
      return `zoomus://zoom.us${url.pathname}`
    },
  },

  // ── App Stores ─────────────────────────────────────────────────────────────
  {
    name: 'App Store',
    iosScheme: 'itms-apps://',
    androidPackage: null,
    toDeepLink: (url) => {
      const id = url.pathname.match(/\/id(\d+)/)
      if (id) return `itms-apps://apps.apple.com/app/id${id[1]}`
      return `itms-apps://itunes.apple.com${url.pathname}`
    },
  },
  {
    name: 'Google Play',
    iosScheme: null,
    androidPackage: 'com.android.vending',
    toDeepLink: (url) => {
      const id = url.searchParams.get('id')
      if (id) return `market://details?id=${id}`
      return null
    },
  },

  // ── Finance ────────────────────────────────────────────────────────────────
  {
    name: 'Cash App',
    iosScheme: 'squarecash://',
    androidPackage: 'com.squareup.cash',
    toDeepLink: (url) => {
      const cashtag = url.pathname.match(/^\/$([A-Za-z0-9_]+)/)
      if (cashtag) return `squarecash://cashtag/${cashtag[1]}`
      return `squarecash://`
    },
  },
  {
    name: 'PayPal',
    iosScheme: 'paypal://',
    androidPackage: 'com.paypal.android.p2pmobile',
    toDeepLink: () => `paypal://`,
  },

  // ── Maps / Travel ──────────────────────────────────────────────────────────
  {
    name: 'Google Maps',
    iosScheme: 'comgooglemaps://',
    androidPackage: 'com.google.android.apps.maps',
    toDeepLink: (url) => {
      const q = url.searchParams.get('q')
      if (q) return `comgooglemaps://?q=${encodeURIComponent(q)}`
      return `comgooglemaps://?q=${encodeURIComponent(url.toString())}`
    },
  },
  {
    name: 'Airbnb',
    iosScheme: 'airbnb://',
    androidPackage: 'com.airbnb.android',
    toDeepLink: () => `airbnb://`,
  },
  {
    name: 'Uber',
    iosScheme: 'uber://',
    androidPackage: 'com.ubercab',
    toDeepLink: () => `uber://`,
  },
]

// ─── URL → AppScheme lookup ────────────────────────────────────────────────────

const DOMAIN_MAP: Record<string, number> = {
  'youtube.com': 0,
  'youtu.be': 0,
  'm.youtube.com': 0,
  'tiktok.com': 1,
  'vm.tiktok.com': 1,
  'instagram.com': 2,
  'open.spotify.com': 3,
  'music.apple.com': 4,
  'netflix.com': 5,
  'twitch.tv': 6,
  'twitter.com': 7,
  'x.com': 7,
  'facebook.com': 8,
  'fb.com': 8,
  'linkedin.com': 9,
  'pinterest.com': 10,
  'reddit.com': 11,
  'snapchat.com': 12,
  't.me': 13,
  'telegram.me': 13,
  'wa.me': 14,
  'whatsapp.com': 14,
  'discord.com': 15,
  'discord.gg': 15,
  'amazon.com': 16,
  'amazon.co.uk': 16,
  'amazon.ca': 16,
  'amazon.de': 16,
  'ebay.com': 17,
  'etsy.com': 18,
  'soundcloud.com': 19,
  'deezer.com': 20,
  'notion.so': 21,
  'notion.site': 21,
  'slack.com': 22,
  'zoom.us': 23,
  'apps.apple.com': 24,
  'itunes.apple.com': 24,
  'play.google.com': 25,
  'cash.app': 26,
  'paypal.com': 27,
  'paypal.me': 27,
  'maps.google.com': 28,
  'airbnb.com': 29,
  'uber.com': 30,
}

/**
 * Detects the app scheme for a given destination URL.
 * Returns null if no matching app is found.
 */
export function detectAppScheme(destinationUrl: string): AppScheme | null {
  try {
    const url = new URL(destinationUrl)
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase()
    const idx = DOMAIN_MAP[hostname]
    return idx !== undefined ? (APP_SCHEMES[idx] ?? null) : null
  } catch {
    return null
  }
}

/**
 * Generates the iOS deep link URL for the given destination.
 * Returns null if no scheme is registered or the URL can't be mapped.
 */
export function toIosDeepLink(destinationUrl: string): string | null {
  try {
    const url = new URL(destinationUrl)
    const scheme = detectAppScheme(destinationUrl)
    return scheme ? scheme.toDeepLink(url) : null
  } catch {
    return null
  }
}

/**
 * Generates the Android intent:// URI for the given destination.
 * Format: intent://HOST/PATH#Intent;scheme=SCHEME;package=PKG;S.browser_fallback_url=URL;end
 */
export function toAndroidIntentUri(destinationUrl: string): string | null {
  try {
    const url = new URL(destinationUrl)
    const scheme = detectAppScheme(destinationUrl)
    if (!scheme?.androidPackage) return null

    const fallback = encodeURIComponent(destinationUrl)
    const host = url.hostname
    const path = url.pathname + url.search

    // Use intent:// with HTTPS scheme so Android resolves universal links
    return (
      `intent://${host}${path}` +
      `#Intent;scheme=https;package=${scheme.androidPackage}` +
      `;S.browser_fallback_url=${fallback}` +
      `;end`
    )
  } catch {
    return null
  }
}

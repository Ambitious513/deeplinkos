import type { DevicePlatform } from "@/lib/types";

export function detectBrowser(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("samsungbrowser")) return "Samsung";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("chrome")) return "Chrome";
  if (ua.includes("safari")) return "Safari";
  return "Other";
}

export function detectOS(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) return "iOS";
  if (ua.includes("android")) return "Android";
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("macintosh")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  return "Unknown";
}

export function detectReferrer(userAgent: string, refererHeader: string | null) {
  if (refererHeader) {
    try {
      const host = new URL(refererHeader).hostname.replace(/^www\./, "");
      const map: Record<string, string> = {
        "t.co": "Twitter / X",
        "x.com": "Twitter / X",
        "twitter.com": "Twitter / X",
        "facebook.com": "Facebook",
        "fb.com": "Facebook",
        "l.facebook.com": "Facebook",
        "instagram.com": "Instagram",
        "l.instagram.com": "Instagram",
        "tiktok.com": "TikTok",
        "wa.me": "WhatsApp",
        "whatsapp.com": "WhatsApp",
        "t.me": "Telegram",
        "telegram.org": "Telegram",
        "reddit.com": "Reddit",
        "out.reddit.com": "Reddit",
        "linkedin.com": "LinkedIn",
        "lnkd.in": "LinkedIn",
        "youtube.com": "YouTube",
        "youtu.be": "YouTube",
      };
      return map[host] ?? host;
    } catch {
      return refererHeader;
    }
  }

  if (/WhatsApp\//i.test(userAgent)) return "WhatsApp";
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i.test(userAgent)) return "Facebook";
  if (/Instagram/i.test(userAgent)) return "Instagram";
  if (/musical_ly|TikTok/i.test(userAgent)) return "TikTok";
  if (/Twitter/i.test(userAgent)) return "Twitter / X";
  if (/Telegram/i.test(userAgent)) return "Telegram";
  if (/LinkedInApp/i.test(userAgent)) return "LinkedIn";
  if (/Reddit/i.test(userAgent)) return "Reddit";

  return "direct";
}

export function isBot(userAgent: string) {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();

  return (
    ua.includes("googlebot") ||
    ua.includes("bingbot") ||
    ua.includes("slurp") ||
    ua.includes("duckduckbot") ||
    ua.includes("baiduspider") ||
    ua.includes("yandexbot") ||
    ua.includes("ahrefsbot") ||
    ua.includes("semrushbot") ||
    ua.includes("mj12bot") ||
    ua.includes("uptimerobot") ||
    ua.includes("pingdom") ||
    ua.includes("facebookexternalhit") ||
    ua.includes("facebot") ||
    ua.includes("twitterbot") ||
    ua.includes("linkedinbot") ||
    ua.includes("slackbot") ||
    ua.includes("discordbot") ||
    ua.includes("telegrambot") ||
    ua.includes("applebot") ||
    ua.includes("redditbot") ||
    ua.includes("headlesschrome") ||
    ua.includes("python-requests") ||
    ua.includes("axios") ||
    ua.includes("node-fetch") ||
    ua.includes("curl/") ||
    ua.includes("wget/") ||
    /\b(bot|crawler|spider|scraper|checker|validator)\b/.test(ua)
  );
}

export function isPrefetch(headers: Headers) {
  return headers.get("purpose") === "prefetch" || headers.get("x-purpose") === "preview" || headers.get("sec-purpose") === "prefetch";
}

export function deviceLabel(platform: DevicePlatform) {
  if (platform === "ios" || platform === "android") return "mobile";
  return platform;
}

/**
 * Returns the specific in-app browser name if the UA is a known social WebView,
 * or null if it is a real browser. Used to power IAB-aware routing and analytics.
 */
export function detectIABSource(userAgent: string): string | null {
  const ua = userAgent;
  if (/Instagram/i.test(ua)) return "instagram";
  if (/musical_ly|TikTok|BytedanceWebview/i.test(ua)) return "tiktok";
  if (/FBAN|FBAV|FB_IAB|FBIOS|FB4A|FB_UI|FB_WebView/i.test(ua)) return "facebook";
  if (/Messenger/i.test(ua)) return "messenger";
  if (/\bTwitter\b/i.test(ua)) return "twitter";
  if (/Snapchat/i.test(ua)) return "snapchat";
  if (/MicroMessenger/i.test(ua)) return "wechat";
  if (/LinkedInApp/i.test(ua)) return "linkedin";
  if (/Pinterest/i.test(ua)) return "pinterest";
  if (/Reddit\//i.test(ua)) return "reddit";
  if (/Line\//i.test(ua)) return "line";
  // Generic Android WebView (wv) without a named host app
  if (/wv\)/i.test(ua) && /Android/i.test(ua)) return "android_wv";
  // iOS WKWebView / UIWebView without Safari in UA
  if (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua)) return "ios_wv";
  return null;
}

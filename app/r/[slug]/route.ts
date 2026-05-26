import { NextResponse } from "next/server";
import { getLink } from "@/lib/links";
import { detectPlatform, isInAppWebView, isChromeCustomTab, resolveDestination } from "@/lib/routing";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const record = await getLink(slug);

  if (!record) {
    return NextResponse.redirect(new URL("/missing", request.url));
  }

  const ua = request.headers.get("user-agent");
  const xrw = request.headers.get("x-requested-with");
  const ref = request.headers.get("referer");
  const platform = detectPlatform(ua);
  const webView = isInAppWebView(ua, xrw, ref);
  const cct = isChromeCustomTab(ua, xrw, ref);
  const destination = resolveDestination(record, ua);

  if (!destination) {
    return NextResponse.redirect(new URL("/missing", request.url));
  }

  // ── Fast path: normal browsers (Chrome, Safari, Firefox) ──────────────────
  // Issue a plain 307 redirect to the native URI scheme. The OS intercepts it
  // and opens the app instantly — no HTML page, no JS, sub-100 ms experience.
  if (!webView && (platform === "ios" || platform === "android" || platform === "desktop")) {
    return NextResponse.redirect(destination.destination, 307);
  }

  const webFallback =
    record.desktopUrl ||
    record.iosStoreUrl ||
    record.androidStoreUrl ||
    "/";

  const storeFallback =
    platform === "ios"
      ? (record.iosStoreUrl || webFallback)
      : (record.androidStoreUrl || webFallback);

  const appScheme = destination.destination;
  const isIos = platform === "ios";
  const title = record.title || "your link";

  // ── Chrome Custom Tab path (X.com, Twitter) ───────────────────────────────
  // We are already inside the real Chrome engine (CCT). Targeting Chrome itself
  // is a no-op. Instead we fire a cascade of Android Intents targeting
  // alternative browsers. The first installed one wins. If none are found,
  // we gracefully fall back to the CCT — keeping the user in X.com Chrome
  // which is still a fully-featured browser with cookies and tracking.
  if (cct && platform === "android") {
    const encodedUrl = encodeURIComponent(webFallback);

    // ── Browser-specific URL schemes ──────────────────────────────────────────
    // Using https:// intents triggers Android's activity chooser (showing both
    // Chrome and the target browser). Instead we use each browser's OWN custom
    // URL scheme — these are ONLY registered by that specific browser, so Android
    // opens them directly with zero chooser dialog.
    //
    // Cascade order (most → least likely to be installed on Android):
    const browsers = [
      // 1. Samsung Internet — pre-installed on ALL Samsung devices (~30% of Android market)
      //    sbrowser:// is Samsung's proprietary scheme, only Samsung Internet handles it.
      `sbrowser://${new URL(webFallback).hostname}${new URL(webFallback).pathname}${new URL(webFallback).search}`,
      // 2. Firefox — 400M+ installs, widely popular
      //    firefox://open-url?url=... is Firefox's own scheme
      `firefox://open-url?url=${encodedUrl}`,
      // 3. Brave — privacy-focused, fast-growing
      `brave://open-url?url=${encodedUrl}`,
      // 4. Microsoft Edge — pre-installed on many devices, growing
      `microsoft-edge://${new URL(webFallback).hostname}${new URL(webFallback).pathname}${new URL(webFallback).search}`,
      // 5. DuckDuckGo Browser — very privacy-conscious users
      `ddgquicklink://${new URL(webFallback).hostname}${new URL(webFallback).pathname}${new URL(webFallback).search}`,
    ];

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Opening ${title}…</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100svh;display:flex;flex-direction:column;align-items:center;
         justify-content:center;text-align:center;padding:2rem;
         background:#0d1f3c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0}
    .spinner{width:52px;height:52px;border-radius:50%;border:4px solid rgba(59,130,246,.2);
             border-top-color:#3b82f6;animation:spin .8s linear infinite;margin:0 auto 1.5rem}
    @keyframes spin{to{transform:rotate(360deg)}}
    h1{font-size:1.3rem;font-weight:700;margin-bottom:.5rem}
    p{color:#94a3b8;font-size:.9rem;margin-bottom:.4rem}
    a.tap{display:inline-block;margin-top:2rem;color:#60a5fa;font-size:.85rem;text-decoration:underline}
  </style>
</head>
<body>
  <div class="spinner" aria-hidden="true"></div>
  <h1>Opening ${title}…</h1>
  <p>Opening in your installed browser…</p>
  <a href="${webFallback}" class="tap">Tap here if nothing happens</a>
  <script>
  (function(){
    // Browser cascade: try each alternative browser in order.
    // The first one that IS installed on this device wins.
    // Android fires S.browser_fallback_url for each that isn't installed,
    // which keeps us in the CCT — still a great, fully-featured Chrome session.
    var browsers = ${JSON.stringify(browsers)};
    var web = ${JSON.stringify(webFallback)};
    var idx = 0;

    function tryNext() {
      if (idx >= browsers.length) {
        // All alternatives exhausted — fall back to web URL in CCT
        window.location.href = web;
        return;
      }
      var scheme = browsers[idx++];
      // Hidden anchor click — best method for triggering Android Intents
      var a = document.createElement('a');
      a.href = scheme;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      // If still here after 2.5s, the browser wasn't installed — try next
      setTimeout(tryNext, 2500);
    }

    // Small initial delay to let the page render before firing
    setTimeout(tryNext, 300);
  })();
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // ── Slow path: standard in-app WebView (Facebook, Instagram, TikTok) ──────
  const fallbackDelay = isIos ? 2500 : 2000;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Opening ${title}…</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{min-height:100svh;display:flex;flex-direction:column;align-items:center;
         justify-content:center;text-align:center;padding:2rem;
         background:#0d1f3c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0}
    .spinner{width:52px;height:52px;border-radius:50%;border:4px solid rgba(59,130,246,.2);
             border-top-color:#3b82f6;animation:spin .8s linear infinite;margin:0 auto 1.5rem}
    @keyframes spin{to{transform:rotate(360deg)}}
    h1{font-size:1.3rem;font-weight:700;margin-bottom:.5rem}
    p{color:#94a3b8;font-size:.9rem}
    a.tap{display:inline-block;margin-top:2rem;color:#60a5fa;font-size:.85rem;text-decoration:underline}
  </style>
</head>
<body>
  <a id="dl" href="${appScheme}" style="display:none" aria-hidden="true"></a>
  <div class="spinner" aria-hidden="true"></div>
  <h1>Opening ${title}…</h1>
  <p>You'll be redirected to the app automatically.</p>
  <a href="${webFallback}" class="tap">If nothing happens, tap here to continue</a>
  <script>
  (function(){
    var app="${appScheme}",fb="${storeFallback}",web="${webFallback}";
    var delay=${fallbackDelay};
    var t=Date.now();

    // Method 1: hidden anchor .click() — breaks out of Facebook/IG WebView
    var a=document.getElementById('dl');
    if(a){a.href=app;a.click();}

    // Method 2: window.location as backup
    try{window.location.href=app;}catch(e){}

    // Fallback timer
    setTimeout(function(){
      if(document.hidden||document.webkitHidden)return;
      if(Date.now()-t<delay-200)return;
      window.location.href=fb!==web?fb:web;
    },delay);
  })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

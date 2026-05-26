import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getLink } from "@/lib/links";
import { detectPlatform, isInAppWebView, resolveDestination } from "@/lib/routing";

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
  const platform = detectPlatform(ua);
  const webView = isInAppWebView(ua, xrw);
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

  // ── Slow path: in-app WebView (Facebook, Instagram, TikTok, etc.) ─────────
  // These browsers block scheme-launch redirects. We must serve an HTML page
  // that uses a JS .click() on a hidden <a> to trigger the OS intent handler.
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
  const fallbackDelay = isIos ? 2500 : 2000;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Opening ${record.title || "your link"}…</title>
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
  <h1>Opening ${record.title || "your link"}…</h1>
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

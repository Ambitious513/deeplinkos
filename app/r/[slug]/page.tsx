import { getLink } from "@/lib/links";
import { headers } from "next/headers";
import { detectPlatform } from "@/lib/routing";
import { redirect } from "next/navigation";

export default async function DeepLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = await getLink(slug);

  if (!record) redirect("/missing");

  const ua = (await headers()).get("user-agent") ?? "";
  const platform = detectPlatform(ua);

  // Pick the right native scheme per platform
  const appScheme =
    platform === "ios"
      ? record.iosDeepLink
      : platform === "android"
      ? record.androidDeepLink
      : undefined;

  // Web fallback — used when app is not installed or on desktop
  const webFallback =
    record.desktopUrl ||
    record.iosStoreUrl ||
    record.androidStoreUrl ||
    "/";

  // On desktop just do a server-side redirect right away
  if (platform === "desktop") redirect(webFallback as any);

  // Escape values to safely embed in inline script
  const safeScheme   = appScheme   ? JSON.stringify(appScheme)   : "null";
  const safeFallback = JSON.stringify(webFallback);
  const safeIos      = record.iosStoreUrl
    ? JSON.stringify(record.iosStoreUrl)
    : safeFallback;
  const safeAndroid  = record.androidStoreUrl
    ? JSON.stringify(record.androidStoreUrl)
    : safeFallback;

  const isIos     = platform === "ios";
  const storeFallback = isIos ? safeIos : safeAndroid;

  // The deep link redirect script — mirrors the URLGenius approach:
  //  1. Inject a hidden <a> with the native scheme
  //  2. Use JS .click() to trigger it (bypasses WebView scheme-launch restrictions)
  //  3. Start a fallback timer: if the OS never pauses the page to open the app
  //     within ~2.5 s, redirect to the App/Play Store or web fallback
  const redirectScript = `
(function() {
  var appScheme   = ${safeScheme};
  var webFallback = ${safeFallback};
  var storeFallback = ${storeFallback};
  var isIos = ${isIos};
  var launched = false;

  function launchApp() {
    if (!appScheme) {
      window.location.href = webFallback;
      return;
    }

    // Method 1: hidden anchor click — most reliable for breaking out of WebViews
    var a = document.getElementById('__dl_anchor__');
    if (a) {
      a.href = appScheme;
      a.click();
    }

    // Method 2: direct location assignment as backup
    try { window.location.href = appScheme; } catch(e) {}

    // Fallback timer: if the page is still visible after 2.5 s the app didn't open
    var fallbackDelay = isIos ? 2500 : 2000;
    var startTime = Date.now();

    setTimeout(function() {
      // If document is still visible (app didn't hijack focus), go to store / web
      if (document.hidden || document.webkitHidden) return;
      // Extra guard: if user navigated away fast, skip
      if (Date.now() - startTime < fallbackDelay - 200) return;
      window.location.href = storeFallback !== webFallback ? storeFallback : webFallback;
    }, fallbackDelay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', launchApp);
  } else {
    launchApp();
  }
})();
  `.trim();

  return (
    <>
      {/* Hidden anchor — the click() on this is what breaks out of in-app WebViews */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a id="__dl_anchor__" href={appScheme ?? webFallback} style={{ display: "none" }} aria-hidden="true" />

      <div
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "2rem",
          background: "var(--bg, #f0f4ff)",
        }}
      >
        {/* Spinner */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "4px solid rgba(59,130,246,0.15)",
            borderTopColor: "#3b82f6",
            animation: "spin 0.8s linear infinite",
            marginBottom: "1.5rem",
          }}
          aria-hidden="true"
        />

        <h1
          style={{
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "var(--text, #0d1f3c)",
            marginBottom: "0.5rem",
          }}
        >
          Opening {record.title || "your link"}…
        </h1>
        <p style={{ color: "var(--text-2, #4a617d)", fontSize: "0.95rem" }}>
          You&apos;ll be redirected to the app automatically.
        </p>

        <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "var(--text-3, #8aaccc)" }}>
          If nothing happens,{" "}
          <a
            href={webFallback}
            style={{ color: "#3b82f6", textDecoration: "underline" }}
          >
            tap here to continue
          </a>
          .
        </p>
      </div>

      {/* Inline CSS for spinner animation (no external stylesheet needed on this minimal page) */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* The redirect logic runs client-side so it can bypass WebView restrictions */}
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
    </>
  );
}

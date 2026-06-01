import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getLink } from "@/lib/links";
import { detectPlatform } from "@/lib/routing";
import { createClient } from "@/lib/supabase/server";

export default async function DeepLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const record = await getLink(slug);

  if (!record) redirect("/missing");

  const headersList = await headers();
  const ua = headersList.get("user-agent") ?? "";
  const platform = detectPlatform(ua);

  // Track the click asynchronously
  const supabase = await createClient();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  await supabase.from('clicks').insert({
    link_id: record.id,
    device: platform,
    os: platform, // approximate for now
    browser: ua.includes("Chrome") ? "Chrome" : ua.includes("Safari") ? "Safari" : "Other",
    ip_hash: ip.substring(0, 10), // anonymized
    referrer: headersList.get("referer") ?? null
  });

  const appScheme =
    platform === "ios"
      ? record.iosDeepLink
      : platform === "android"
      ? record.androidDeepLink
      : undefined;

  const webFallback = record.desktopUrl || record.iosStoreUrl || record.androidStoreUrl || "/";

  if (platform === "desktop") redirect(webFallback as any);

  const safeScheme = appScheme ? JSON.stringify(appScheme) : "null";
  const safeFallback = JSON.stringify(webFallback);
  const safeIos = record.iosStoreUrl ? JSON.stringify(record.iosStoreUrl) : safeFallback;
  const safeAndroid = record.androidStoreUrl ? JSON.stringify(record.androidStoreUrl) : safeFallback;
  const isIos = platform === "ios";
  const storeFallback = isIos ? safeIos : safeAndroid;

  const redirectScript = `
(function() {
  var appScheme   = ${safeScheme};
  var webFallback = ${safeFallback};
  var storeFallback = ${storeFallback};
  var isIos = ${isIos};

  function launchApp() {
    if (!appScheme) {
      window.location.href = webFallback;
      return;
    }

    var a = document.getElementById('__dl_anchor__');
    if (a) {
      a.href = appScheme;
      a.click();
    }

    try { window.location.href = appScheme; } catch(e) {}

    var fallbackDelay = isIos ? 2500 : 2000;
    var startTime = Date.now();

    setTimeout(function() {
      if (document.hidden || document.webkitHidden) return;
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
      <a
        id="__dl_anchor__"
        href={appScheme ?? webFallback}
        style={{ display: "none" }}
        aria-hidden="true"
      />

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
          Opening {record.title || "your link"}...
        </h1>
        <p style={{ color: "var(--text-2, #4a617d)", fontSize: "0.95rem" }}>
          You&apos;ll be redirected to the app automatically.
        </p>

        <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "var(--text-3, #8aaccc)" }}>
          If nothing happens,{" "}
          <a href={webFallback} style={{ color: "#3b82f6", textDecoration: "underline" }}>
            tap here to continue
          </a>
          .
        </p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
    </>
  );
}

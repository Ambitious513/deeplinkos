import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "DeepLinkOS vs Linktree | Smart Links That Open Apps (2026)" },
  description:
    "Linktree shows a list of links. DeepLinkOS makes each link open the right app on iOS, Android, and desktop automatically. See the full comparison.",
  alternates: { canonical: "/vs/linktree" },
  openGraph: {
    title: "DeepLinkOS vs Linktree",
    description: "Linktree shows a list. DeepLinkOS makes every link open the right app — Instagram, TikTok, WhatsApp, your store — on the right device, automatically.",
    url: "https://deeplinkos.com/vs/linktree",
  },
};

const rows = [
  { feature: "Core purpose",           deeplinkos: "Smart links that open the right app", linktree: "A page listing multiple links" },
  { feature: "App-opening deep links", deeplinkos: "✅ iOS + Android + Desktop routing",  linktree: "❌ Opens web browser only" },
  { feature: "Deferred deep links",    deeplinkos: "✅ Works after app install",           linktree: "❌ Not supported" },
  { feature: "Direct app routing",     deeplinkos: "✅ instagram://, tiktok://, wa.me/",  linktree: "❌ Always goes to web" },
  { feature: "No landing page needed", deeplinkos: "✅ One link routes directly",          linktree: "❌ Always shows Linktree page" },
  { feature: "UTM attribution",        deeplinkos: "✅ Full UTM support",                  linktree: "⚠️ Limited, paid plans only" },
  { feature: "QR codes",               deeplinkos: "✅ Every plan",                        linktree: "⚠️ Paid plans only" },
  { feature: "Custom domain",          deeplinkos: "✅ From Starter plan",                 linktree: "⚠️ Paid plans only" },
  { feature: "Click analytics",        deeplinkos: "✅ Real-time, all plans",              linktree: "⚠️ Limited on free" },
  { feature: "Password-protected links", deeplinkos: "✅ Creator plan",                   linktree: "⚠️ Paid plans only" },
  { feature: "Free plan",              deeplinkos: "✅ 3 smart links, 50K clicks/mo",      linktree: "⚠️ Basic — no analytics" },
  { feature: "Best for",               deeplinkos: "Creators, sellers & app marketers",   linktree: "Simple link pages" },
];

export default function VsLinktreePage() {
  return (
    <main className="vs-page">
      <div className="container">

        {/* Hero */}
        <section className="vs-hero">
          <span className="blog-eyebrow">Comparison</span>
          <h1 className="vs-headline">
            DeepLinkOS vs<br />
            <span className="grad-text">Linktree</span>
          </h1>
          <p className="vs-sub">
            Linktree is a list of links. That's the problem. When someone clicks your bio link on mobile, they land on a web page — not your app. DeepLinkOS routes every click to the right native app automatically, so you stop losing people to the browser.
          </p>
          <div className="vs-actions">
            <Link className="btn btn-primary" href="/signup">
              Create Free Link
            </Link>
            <Link className="btn btn-secondary" href="/pricing">
              See pricing
            </Link>
          </div>
        </section>

        {/* Comparison table */}
        <section className="vs-table-wrap">
          <table className="vs-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="vs-col--us">DeepLinkOS</th>
                <th className="vs-col--them">Linktree</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature}>
                  <td className="vs-feature">{row.feature}</td>
                  <td className="vs-col--us">{row.deeplinkos}</td>
                  <td className="vs-col--them">{row.linktree}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Bottom CTA */}
        <section className="vs-cta-block">
          <h2>Your link-in-bio should open the app, not a browser tab</h2>
          <p>
            Replace your Linktree URL with a DeepLinkOS smart link. It works everywhere you already use Linktree — Instagram bio, TikTok bio, YouTube description, email signature — but it opens your Instagram, store, WhatsApp chat, or app directly on every device.
          </p>
          <Link className="btn btn-primary" href="/signup">
            Switch from Linktree — it&apos;s free →
          </Link>
        </section>

      </div>
    </main>
  );
}

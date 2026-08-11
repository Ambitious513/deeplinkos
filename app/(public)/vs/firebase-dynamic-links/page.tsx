import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "DeepLinkOS vs Firebase Dynamic Links | Free Alternative (2026)" },
  description:
    "Firebase Dynamic Links shut down in 2025. See how DeepLinkOS replaces every feature — smart app routing, deferred deep links, UTM attribution, QR codes — with no SDK required.",
  alternates: { canonical: "/vs/firebase-dynamic-links" },
  openGraph: {
    title: "DeepLinkOS vs Firebase Dynamic Links",
    description: "Firebase Dynamic Links is gone. DeepLinkOS replaces it with smart routing, deferred deep links, and attribution — no SDK, no enterprise contract.",
    url: "https://deeplinkos.com/vs/firebase-dynamic-links",
  },
};

const rows = [
  { feature: "Status",                deeplinkos: "✅ Active & growing",         firebase: "🚫 Shut down August 2025" },
  { feature: "App-opening smart links", deeplinkos: "✅ iOS + Android + Desktop", firebase: "🚫 No longer available" },
  { feature: "Deferred deep links",   deeplinkos: "✅ Built in",                  firebase: "🚫 Deprecated" },
  { feature: "Custom short domain",   deeplinkos: "✅ Included from Starter",     firebase: "🚫 Gone" },
  { feature: "SDK required",          deeplinkos: "✅ Zero SDK needed",            firebase: "⚠️ Required Firebase SDK" },
  { feature: "QR code generation",    deeplinkos: "✅ Every plan",                firebase: "🚫 Not available" },
  { feature: "UTM attribution",       deeplinkos: "✅ Built in",                  firebase: "⚠️ Manual setup required" },
  { feature: "Click analytics",       deeplinkos: "✅ Real-time dashboard",       firebase: "🚫 No longer available" },
  { feature: "No-code setup",         deeplinkos: "✅ 60 seconds",                firebase: "🚫 Deprecated" },
  { feature: "Free plan",             deeplinkos: "✅ 3 links, 50K clicks/mo",    firebase: "🚫 Gone" },
  { feature: "Pricing",               deeplinkos: "✅ From $0 — transparent",     firebase: "🚫 N/A" },
];

export default function VsFirebasePage() {
  return (
    <main className="vs-page">
      <div className="container">

        {/* Hero */}
        <section className="vs-hero">
          <span className="blog-eyebrow">Comparison</span>
          <h1 className="vs-headline">
            DeepLinkOS vs<br />
            <span className="grad-text">Firebase Dynamic Links</span>
          </h1>
          <p className="vs-sub">
            Firebase Dynamic Links shut down in August 2025. If you are still looking for a replacement that handles app-opening smart links, deferred deep links, and attribution — without an SDK or an enterprise contract — this is it.
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
                <th className="vs-col--them">Firebase Dynamic Links</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.feature}>
                  <td className="vs-feature">{row.feature}</td>
                  <td className="vs-col--us">{row.deeplinkos}</td>
                  <td className="vs-col--them">{row.firebase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Migration CTA */}
        <section className="vs-cta-block">
          <h2>Migrate in under 10 minutes</h2>
          <p>
            Your existing Firebase Dynamic Link URLs can be recreated in DeepLinkOS in seconds. Paste the destination, get a smart link, update your campaign and bio links. No SDK changes, no app update required for basic smart routing.
          </p>
          <Link className="btn btn-primary" href="/signup">
            Start migrating free →
          </Link>
        </section>

      </div>
    </main>
  );
}

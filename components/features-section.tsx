const features = [
  {
    icon: "⚡",
    colorClass: "feat-icon--a",
    title: "Instant Platform Detection",
    body: "Paste any URL and DeepLinkOS identifies the platform automatically: YouTube, Instagram, WhatsApp, TikTok, Telegram, Google Maps, and more. No manual selection needed.",
  },
  {
    icon: "📱",
    colorClass: "feat-icon--b",
    title: "iOS & Android Routing",
    body: "Every smart link carries separate deep link destinations for iOS and Android. Users are sent into the native app every time, with automatic App Store or Play Store fallbacks when the app isn't installed.",
  },
  {
    icon: "🔗",
    colorClass: "feat-icon--c",
    title: "Custom Short Slugs",
    body: "Auto-generated slugs are clean and readable. Edit them to match your campaign: deeplinkos.com/your-brand. Short, memorable, and shareable anywhere.",
  },
  {
    icon: "📊",
    colorClass: "feat-icon--d",
    title: "Click Analytics (Coming v2)",
    body: "Track exactly how many users opened your link, which device they used, and which destination they landed on. iOS vs Android breakdown included.",
  },
  {
    icon: "🏷️",
    colorClass: "feat-icon--e",
    title: "Zero Configuration",
    body: "No developer account, no SDK installation, no configuration files. DeepLinkOS handles the entire deep link schema. You just paste a URL and hit generate.",
  },
  {
    icon: "🌐",
    colorClass: "feat-icon--f",
    title: "Universal Web Fallback",
    body: "When a user visits on a desktop browser or an unrecognised device, they're automatically sent to the original web URL. No broken links, ever.",
  },
];

export function FeaturesSection() {
  return (
    <section className="section" id="features" aria-labelledby="features-heading">
      <div className="container">
        <span className="section-kicker">Features</span>
        <h2 className="section-h2" id="features-heading">
          Everything Your{" "}
          <span className="grad-text">Deep Links Need</span>
        </h2>
        <p className="section-sub">
          A complete deep link generator built for creators, marketers, and developers. No complexity, no paywalls. Just smart links that work on every device.
        </p>

        <div className="features-grid" role="list" aria-label="Platform features">
          {features.map((f) => (
            <article className="feature-card" role="listitem" key={f.title}>
              <div className={`feat-icon ${f.colorClass}`} aria-hidden="true">
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

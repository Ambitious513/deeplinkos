const routes = [
  {
    icon: "🍎",
    label: "iPhone & iPad (iOS)",
    dest: "Native app deep link → App Store fallback",
    detail: "Uses Universal Links / custom URI schemes",
  },
  {
    icon: "🤖",
    label: "Android Devices",
    dest: "Native app deep link → Play Store fallback",
    detail: "Uses Android App Links / intent:// schemes",
  },
  {
    icon: "🖥️",
    label: "Desktop & Laptop",
    dest: "Original web URL destination",
    detail: "Clean redirect, no app prompt on desktop",
  },
  {
    icon: "❓",
    label: "Unknown / Other",
    dest: "Original web URL destination",
    detail: "Safe fallback for bots and unknown agents",
  },
];

export function RoutingSection() {
  return (
    <section className="section section--alt" id="routing" aria-labelledby="routing-heading">
      <div className="container">
        <div className="routing-layout">
          {/* Text side */}
          <div>
            <span className="section-kicker">Smart Routing</span>
            <h2 className="section-h2" id="routing-heading">
              One Link.{" "}
              <span className="grad-text">Any Device.</span>
            </h2>
            <p className="section-sub" style={{ marginBottom: "1.5rem" }}>
              DeepLinkOS inspects the user&apos;s device at redirect time and routes them to the ideal destination: native app on mobile, web on desktop, and app store if the app isn&apos;t installed.
            </p>
            <p style={{ fontSize: ".88rem", color: "var(--text-2)", lineHeight: "1.8" }}>
              This is the same smart routing logic used by enterprise deep linking platforms like Branch.io and Firebase Dynamic Links. Available here for free, with no SDK required.
            </p>
          </div>

          {/* Diagram side */}
          <div
            className="routing-diagram"
            role="list"
            aria-label="Routing destinations by device type"
          >
            {routes.map((r) => (
              <div className="routing-row" role="listitem" key={r.label}>
                <span className="routing-row__icon" aria-hidden="true">{r.icon}</span>
                <div className="routing-row__body">
                  <div className="routing-row__label">{r.label}</div>
                  <div className="routing-row__dest">{r.dest}</div>
                </div>
                <span className="routing-row__arrow" aria-hidden="true">→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

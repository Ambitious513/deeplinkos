export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Paste Your URL",
      body: "Drop in any destination: a YouTube channel, Instagram profile, WhatsApp number, Google Maps location, or any custom URL. DeepLinkOS recognises the platform instantly.",
    },
    {
      num: "02",
      title: "Auto-Detect & Configure",
      body: "We auto-detect the platform and pre-fill the deep link schema for iOS and Android. Customise the short slug, or accept the generated one. No technical knowledge needed.",
    },
    {
      num: "03",
      title: "Share Your Smart Link",
      body: "Copy your deeplinkos.com short link and share it anywhere: bio links, ads, email campaigns, or QR codes. Users land in the native app every time, on every device.",
    },
  ];

  return (
    <section className="section" id="how-it-works" aria-labelledby="hiw-heading">
      <div className="container">
        <span className="section-kicker">How It Works</span>
        <h2 className="section-h2" id="hiw-heading">
          From URL to Smart Link{" "}
          <span className="grad-text">in Three Steps</span>
        </h2>
        <p className="section-sub">
          No developer account. No SDK. No configuration files. Just paste, customise, and share. Your deep link generator handles everything automatically.
        </p>

        <div className="steps" role="list" aria-label="Steps to create a deep link">
          {steps.map((step) => (
            <article className="step-card" role="listitem" key={step.num}>
              <div className="step-num" aria-hidden="true">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

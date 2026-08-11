import { platforms } from "@/content/home";

export function PlatformGrid() {
  return (
    <section className="platforms-section">
      <div className="container">
        <p className="platforms-label">Turn social destinations into app-opening smart links</p>
        <div className="platform-grid">
          {platforms.map((platform) => (
            <article className="platform-card" key={platform.name}>
              <div className="platform-card-icon" style={{ background: platform.color }}>
                {platform.icon}
              </div>
              <div className="platform-card-name">{platform.name}</div>
              {platform.scheme && (
                <span className="platform-scheme" aria-hidden="true">
                  {platform.scheme}
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


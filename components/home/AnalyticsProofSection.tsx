import { testimonials } from "@/content/home";
import { SectionHeader } from "@/components/ui/SectionHeader";

const stats = [
  ["12.4K", "Clicks", "blue"],
  ["8.2K", "Visitors", "green"],
  ["24", "Links", "purple"],
];

const bars = [
  ["28%", "rgba(59,130,246,0.3)"],
  ["52%", "rgba(59,130,246,0.4)"],
  ["38%", "rgba(59,130,246,0.35)"],
  ["68%", "rgba(59,130,246,0.5)"],
  ["82%", "rgba(59,130,246,0.6)"],
  ["62%", "rgba(59,130,246,0.45)"],
  ["100%", "var(--grad)"],
];

const rows = [
  ["YouTube Channel", "dlnk.os/r/yt-channel", "4.2K", "YT", "red"],
  ["Instagram Profile", "dlnk.os/r/ig-bio", "3.1K", "IG", "pink"],
  ["WhatsApp Support", "dlnk.os/r/wa-support", "2.8K", "WA", "green"],
];

const avatarColors: Record<string, string> = {
  "Maya R.": "pink",
  "Jordan K.": "blue",
  "Priya M.": "green",
};

export function AnalyticsProofSection() {
  return (
    <section className="section section--tight">
      <div className="container">
        <div className="analytics-proof">
          <div>
            <SectionHeader kicker="Live Analytics" title="See Where Clicks Actually Land">
              Track real behavior: app opens, web fallbacks, bot-filtered clicks, and campaign sources.
            </SectionHeader>
            <div className="analytics-card" aria-label="Analytics preview">
              <div className="dash-topbar">
                <div className="dash-window-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="dash-url">DeepLinkOS - Analytics Dashboard</div>
              </div>

              <div className="dash-body">
                <div className="dash-stats">
                  {stats.map(([value, label, tone]) => (
                    <div className="dash-stat" key={label}>
                      <strong className={`dash-stat-value dash-stat-value--${tone}`}>{value}</strong>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="dash-chart" aria-hidden="true">
                  <div className="chart-hdr">
                    <span>Clicks - Last 7 days</span>
                    <span className="chart-pill">18% vs last week</span>
                  </div>
                  <div className="bars">
                    {bars.map(([height, background], index) => (
                      <span className="bar" style={{ height, background }} key={`${height}-${index}`} />
                    ))}
                  </div>
                </div>

                <div className="dash-links">
                  {rows.map(([campaign, status, value, icon, tone]) => (
                    <div className="dash-row" key={campaign}>
                      <div className="dash-row-main">
                        <span className={`dash-row-icon dash-row-icon--${tone}`}>{icon}</span>
                        <div className="dash-row-copy">
                          <strong>{campaign}</strong>
                          <span>{status}</span>
                        </div>
                      </div>
                      <b>{value}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader kicker="Social Proof" title="Built For Everyone">
              For people who need smarter link behavior, not another enterprise dashboard.
            </SectionHeader>
            <div className="testimonial-list">
              {testimonials.map((testimonial) => (
                <article className="testimonial" key={testimonial.author}>
                  <div className="stars" aria-label="5 stars">★★★★★</div>
                  <p>"{testimonial.quote}"</p>
                  <div className="testimonial-author">
                    <span className={`testimonial-avatar testimonial-avatar--${avatarColors[testimonial.author] ?? "blue"}`}>
                      {testimonial.author.split(" ").map((w: string) => w[0]).join("")}
                    </span>
                    <div>
                      <strong>{testimonial.author}</strong>
                      {testimonial.handle && (
                        <span className="testimonial-handle">{testimonial.handle}</span>
                      )}
                      <small>{testimonial.role}</small>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

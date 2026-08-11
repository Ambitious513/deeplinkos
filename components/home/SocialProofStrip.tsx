// Overlapping avatar strip + trust copy shown directly below the hero generator
const avatars = [
  { initials: "MR", bg: "#6366f1" },
  { initials: "JK", bg: "#ef7a22" },
  { initials: "PM", bg: "#10b981" },
  { initials: "AS", bg: "#f59e0b" },
  { initials: "TL", bg: "#3b82f6" },
];

export function SocialProofStrip() {
  return (
    <div className="social-proof-strip" aria-label="Trusted by creators and brands">
      <div className="social-proof-avatars" aria-hidden="true">
        {avatars.map((a) => (
          <span
            key={a.initials}
            className="social-proof-avatar"
            style={{ background: a.bg }}
          >
            {a.initials}
          </span>
        ))}
      </div>
      <p className="social-proof-text">
        Trusted by <strong>4,200+</strong> creators and brands
      </p>
    </div>
  );
}

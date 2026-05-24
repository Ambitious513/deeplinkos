export function StatsBar() {
  const stats = [
    { val: "3–5×",  label: "More App Opens vs Regular Links" },
    { val: "9+",    label: "Supported Platforms" },
    { val: "<1s",   label: "From Paste to Live Link" },
    { val: "100%",  label: "Free — No Account Required" },
  ];

  return (
    <section className="stats-bar" aria-label="Key statistics">
      <div className="container">
        <div className="stats-bar__inner" role="list">
          {stats.map((s) => (
            <div className="stat-item" role="listitem" key={s.label}>
              <span className="stat-val" aria-label={s.val}>{s.val}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

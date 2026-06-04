export default function AnalyticsLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stat pills */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ flex: "1 1 160px", height: 88, borderRadius: 12 }} />
        ))}
      </div>
      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="skeleton panel" style={{ height: 280 }} />
        <div className="skeleton panel" style={{ height: 280 }} />
      </div>
      <div className="skeleton panel" style={{ height: 200 }} />
    </div>
  );
}

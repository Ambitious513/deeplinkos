export default function LinksLoading() {
  return (
    <div className="panel" style={{ padding: "24px 20px" }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 120, height: 22, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: 180, height: 36, borderRadius: 8 }} />
      </div>
      {/* Table rows */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 52, borderRadius: 8, marginBottom: 8 }}
        />
      ))}
    </div>
  );
}

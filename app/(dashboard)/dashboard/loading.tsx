export default function DashboardLoading() {
  return (
    <>
      <div className="stats-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="stat-card skeleton" style={{ height: 102 }} />
        ))}
      </div>
      <div className="content-grid">
        <div className="panel skeleton" style={{ height: 360 }} />
        <div className="panel skeleton" style={{ height: 360 }} />
      </div>
    </>
  );
}

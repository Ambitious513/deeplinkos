import { DashboardHeader } from "@/components/dashboard/header";

export default function AnalyticsPage() {
  return (
    <>
      <DashboardHeader title="Global Analytics" />

      <div className="panel" style={{ marginBottom: '24px', padding: '16px 24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, marginRight: 'auto' }}>Global Filters:</div>
          <select className="input-field" style={{ width: 'auto', padding: '8px 16px' }}>
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Year</option>
          </select>
          <button className="btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>Export</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
          <div className="stat-card">
              <div className="stat-title">Aggregate Clicks</div>
              <div className="stat-value">854,200</div>
              <div className="stat-change positive">↑ 18% vs prev. period</div>
          </div>
      </div>

      <div className="panel" style={{ marginBottom: '24px' }}>
          <div className="panel-header" style={{ marginBottom: '12px' }}>
              <div className="panel-title">Global Traffic Trend</div>
          </div>
          <div className="chart-container" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>Chart.js Integration Pending...</p>
          </div>
      </div>
    </>
  );
}

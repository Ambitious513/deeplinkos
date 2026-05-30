import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";

export default function DashboardOverview() {
  return (
    <>
      <DashboardHeader title="Overview" />
      
      <div className="stats-grid">
          <div className="stat-card">
              <div className="stat-title">Total Clicks (30d)</div>
              <div className="stat-value">124,592</div>
              <div className="stat-change positive">↑ 12.5% vs last month</div>
          </div>
          <div className="stat-card">
              <div className="stat-title">Unique Visitors</div>
              <div className="stat-value">89,430</div>
              <div className="stat-change positive">↑ 8.2% vs last month</div>
          </div>
          <div className="stat-card">
              <div className="stat-title">Avg. Click-Through Rate</div>
              <div className="stat-value">24.8%</div>
              <div className="stat-change negative">↓ 1.2% vs last month</div>
          </div>
          <div className="stat-card">
              <div className="stat-title">Active Smart Links</div>
              <div className="stat-value">142</div>
              <div className="stat-change positive">+ 12 this week</div>
          </div>
      </div>

      <div className="content-grid">
          <div className="panel">
              <div className="panel-header" style={{ marginBottom: '12px' }}>
                  <div className="panel-title">Click Analytics</div>
                  <select className="input-field" style={{ width: 'auto', padding: '6px 12px' }}>
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                  </select>
              </div>
              <div className="chart-container" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>Chart.js Integration Pending...</p>
              </div>
          </div>

          <div className="panel">
              <div className="panel-header">
                  <div className="panel-title">Quick Links</div>
                  <Link href="/dashboard/links" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>View All</Link>
              </div>
              <div className="table-responsive">
                  <table className="table">
                      <tbody>
                          <tr>
                              <td>
                                  <div style={{ fontWeight: 500 }}>Summer Campaign &apos;26</div>
                                  <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>dplnk.io/summer26</div>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>45k</td>
                          </tr>
                          <tr>
                              <td>
                                  <div style={{ fontWeight: 500 }}>App Install Fallback</div>
                                  <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>dplnk.io/get-app</div>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>28k</td>
                          </tr>
                          <tr>
                              <td>
                                  <div style={{ fontWeight: 500 }}>Instagram Bio Link</div>
                                  <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>dplnk.io/ig-bio</div>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>12k</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </>
  );
}

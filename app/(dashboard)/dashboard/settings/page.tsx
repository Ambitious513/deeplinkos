import { DashboardHeader } from "@/components/dashboard/header";

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader title="Settings" />

      <div className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="panel">
              <div className="panel-header">
                  <div className="panel-title">Custom Domains</div>
                  <button className="btn-primary">+ Add Domain</button>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '24px', maxWidth: '600px' }}>
                  Use your own brand name for shortened links (e.g., link.yourbrand.com). Custom domains increase click-through rates and build brand trust.
              </p>
              
              <div className="table-responsive">
                  <table className="table">
                      <thead>
                          <tr>
                              <th>Domain</th>
                              <th>Status</th>
                              <th>Added On</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td style={{ fontWeight: 500 }}>link.mybrand.com</td>
                              <td><span className="badge-active">Active</span></td>
                              <td>May 10, 2026</td>
                              <td><button className="btn-secondary" style={{ padding: '4px 10px' }}>Manage</button></td>
                          </tr>
                          <tr>
                              <td style={{ fontWeight: 500 }}>go.mybrand.com</td>
                              <td><span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, display: 'inline-block', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }}>Pending DNS</span></td>
                              <td>May 28, 2026</td>
                              <td><button className="btn-secondary" style={{ padding: '4px 10px' }}>Verify</button></td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>

          <div className="panel">
              <div className="panel-header">
                  <div className="panel-title">API Keys</div>
                  <button className="btn-secondary">Generate New Key</button>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: '14px', marginBottom: '20px' }}>
                  Use these keys to authenticate your API requests and integrate DeepLink OS into your own applications.
              </p>
              <div className="input-group" style={{ display: 'flex', gap: '8px' }}>
                  <input type="password" className="input-field" defaultValue="dl_live_8f7d6s5a4f3d2s1a" readOnly />
                  <button className="btn-secondary">Copy</button>
                  <button className="btn-secondary">Revoke</button>
              </div>
          </div>
      </div>
    </>
  );
}

import { DashboardHeader } from "@/components/dashboard/header";

export default function LinksPage() {
  return (
    <>
      <DashboardHeader title="Links Manager" />

      {/* Populated State */}
      <div className="panel" id="links-populated">
          <div className="panel-header">
              <div className="panel-title">All Smart Links</div>
              <div className="input-group">
                  <input type="text" className="input-field" placeholder="Search links..." />
                  <button className="btn-secondary">Filter</button>
              </div>
          </div>
          <div className="table-responsive">
              <table className="table">
                  <thead>
                      <tr>
                          <th>Link Name</th>
                          <th>Short URL</th>
                          <th>Destination</th>
                          <th>Total Clicks</th>
                          <th>Status</th>
                          <th>Action</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td style={{ fontWeight: 500 }}>Summer Campaign &apos;26</td>
                          <td><span className="link-short">dplnk.io/summer26</span></td>
                          <td><span style={{ color: 'var(--text-2)', maxWidth: '150px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>https://mybrand.com/summer-sale-2026</span></td>
                          <td>45,210</td>
                          <td><span className="badge-active">Active</span></td>
                          <td><button className="btn-secondary" style={{ padding: '4px 10px' }}>Stats</button></td>
                      </tr>
                      <tr>
                          <td style={{ fontWeight: 500 }}>App Install Fallback</td>
                          <td><span className="link-short">dplnk.io/get-app</span></td>
                          <td><span style={{ color: 'var(--text-2)', maxWidth: '150px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>https://play.google.com/store/apps/...</span></td>
                          <td>28,401</td>
                          <td><span className="badge-active">Active</span></td>
                          <td><button className="btn-secondary" style={{ padding: '4px 10px' }}>Stats</button></td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
    </>
  );
}

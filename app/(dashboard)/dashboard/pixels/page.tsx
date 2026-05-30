import { DashboardHeader } from "@/components/dashboard/header";

export default function PixelsPage() {
  return (
    <>
      <DashboardHeader title="Tracking Pixels" />

      <div className="panel">
          <div className="panel-header">
              <div className="panel-title">Tracking & Retargeting Integrations</div>
          </div>
          
          <div className="pixel-group" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-1)' }}>
              <div className="pixel-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div className="pixel-icon icon-google" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', background: '#ea4335', color: 'white' }}>G</div>
                  <div>
                      <span style={{ fontWeight: 600, display: 'block' }}>Google Analytics (GA4)</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>Fires on every link redirect to track user journeys.</span>
                  </div>
              </div>
              <div className="input-group" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <input type="text" className="input-field" placeholder="G-XXXXXXXXXX" defaultValue="G-A1B2C3D4E5" />
                  <button className="btn-primary" style={{ padding: '10px 16px', fontSize: '14px' }}>Update Pixel</button>
              </div>
          </div>
      </div>
    </>
  );
}

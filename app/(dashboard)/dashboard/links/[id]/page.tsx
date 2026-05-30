import { DashboardHeader } from "@/components/dashboard/header";
import Link from "next/link";

export default async function SingleLinkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <>
      <DashboardHeader title="Link Details" />

      <Link href="/dashboard/links" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-2)', fontSize: '14px', fontWeight: 500, marginBottom: '24px', textDecoration: 'none' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
          Back to Links
      </Link>

      <div className="panel" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
              <h2 style={{ marginBottom: '4px', fontSize: '24px', fontWeight: 600 }}>Summer Campaign &apos;26</h2>
              <a href="#" className="link-short" style={{ fontSize: '18px', textDecoration: 'none', color: 'var(--blue)' }}>dplnk.io/{id}</a>
          </div>
      </div>

      <div className="panel" style={{ marginBottom: '24px' }}>
          <div className="panel-header" style={{ marginBottom: '12px' }}>
              <div className="panel-title">Traffic Trend</div>
          </div>
          <div className="chart-container" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>Chart.js Integration Pending...</p>
          </div>
      </div>
    </>
  );
}

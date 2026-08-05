import { PageFrame } from "@/components/dashboard/page-frame";

export default function SettingsPage() {
  return (
    <PageFrame
      eyebrow="Dashboard"
      title="Settings"
      description="General workspace and account settings will split into profile, billing, domains, and pixels as the rebuild continues."
    >
      <div className="dashboard-grid">
        <div className="panel">
          <div className="eyebrow">Profile</div>
          <div className="card" style={{ marginTop: 12 }}>Profile and identity controls will be wired in phase 4.</div>
        </div>
        <div className="panel">
          <div className="eyebrow">Billing</div>
          <div className="card" style={{ marginTop: 12 }}>Plan and payment controls will be wired in phase 6.</div>
        </div>
      </div>
    </PageFrame>
  );
}


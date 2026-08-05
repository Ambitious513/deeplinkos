import { PageFrame } from "@/components/dashboard/page-frame";
import { listLinksForUser } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";

/* Mock billing data — replace with real subscription API when wired */
const MOCK_PLAN = {
  name: "Free",
  period: "Monthly",
  renewalDate: "N/A — free plan",
  linksLimit: 10,
  clicksLimit: 1000,
  clicksUsed: 0,
};

const MOCK_INVOICES = [
  { date: "No invoices yet", amount: "—", status: "—", id: "none" },
];

function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const tone = pct > 80 ? "var(--red)" : pct > 60 ? "#b87503" : "var(--accent)";
  return (
    <div className="usage-progress">
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-soft)", marginBottom: 6 }}>
        <span>{used.toLocaleString()} used</span>
        <span>{limit.toLocaleString()} limit</span>
      </div>
      <div className="usage-bar-track">
        <div
          className="usage-bar-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${tone}, ${tone})` }}
          role="progressbar"
          aria-valuenow={used}
          aria-valuemax={limit}
          aria-label={`${pct}% of limit used`}
        />
      </div>
      <div style={{ fontSize: "0.78rem", color: "var(--text-soft)", marginTop: 5 }}>
        {pct}% of limit · {Math.max(0, limit - used).toLocaleString()} remaining
      </div>
    </div>
  );
}

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const links = user ? await listLinksForUser(user.id) : [];

  const linksUsed = links.length;

  return (
    <PageFrame
      eyebrow="Settings"
      title="Billing"
      description="Plan status, usage limits, payment method, and invoice history."
    >
      <div className="billing-layout">
        {/* Current plan */}
        <div className="billing-plan-card">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Current Plan</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", letterSpacing: "-0.05em", fontWeight: 800 }}>
                {MOCK_PLAN.name}
              </div>
              <p style={{ margin: "6px 0 0", color: "var(--text-soft)", fontSize: "0.88rem" }}>
                {MOCK_PLAN.period} · Renewal: {MOCK_PLAN.renewalDate}
              </p>
            </div>
            <button className="btn btn-primary" type="button" aria-label="Upgrade plan">
              Upgrade plan
            </button>
          </div>
        </div>

        {/* Usage */}
        <div className="panel">
          <div style={{ marginBottom: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Usage</div>
          </div>

          <div style={{ display: "grid", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <strong style={{ fontSize: "0.92rem" }}>Smart links created</strong>
                <span className={`badge${linksUsed >= MOCK_PLAN.linksLimit ? " badge--error" : " badge--active"}`}>
                  {linksUsed} / {MOCK_PLAN.linksLimit}
                </span>
              </div>
              <UsageBar used={linksUsed} limit={MOCK_PLAN.linksLimit} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <strong style={{ fontSize: "0.92rem" }}>Clicks this month</strong>
                <span className="badge badge--active">
                  {MOCK_PLAN.clicksUsed} / {MOCK_PLAN.clicksLimit}
                </span>
              </div>
              <UsageBar used={MOCK_PLAN.clicksUsed} limit={MOCK_PLAN.clicksLimit} />
              <p style={{ fontSize: "0.78rem", color: "var(--text-soft)", marginTop: 8 }}>
                Click counting requires analytics to be connected.
              </p>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="panel">
          <div className="settings-section-title" style={{ padding: "0 0 12px", background: "none", borderBottom: "1px solid var(--border)" }}>
            Payment Method
          </div>
          <div className="settings-row">
            <div className="settings-row__label">
              <strong>Card on file</strong>
              <span>No payment method on free plan</span>
            </div>
            <div className="settings-row__action">
              <button className="btn btn-ghost" type="button" style={{ fontSize: "0.84rem" }}>
                Add card
              </button>
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="panel">
          <div className="settings-section-title" style={{ padding: "0 0 12px", background: "none", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
            Invoice History
          </div>
          <div className="table-card" style={{ borderRadius: 0, boxShadow: "none", border: "none" }}>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.date}</td>
                    <td>{inv.amount}</td>
                    <td>
                      <span className="badge">{inv.status}</span>
                    </td>
                    <td>
                      <span style={{ color: "var(--text-soft)", fontSize: "0.82rem" }}>—</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

import { PageFrame } from "@/components/dashboard/page-frame";
import { SignOutButton } from "@/components/auth/signout-button";
import { displayName, requireOnboarded } from "@/lib/auth/session";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default async function ProfilePage() {
  const state = await requireOnboarded("/dashboard/profile");
  const name = displayName(state.profile, state.user?.email);
  const email = state.user?.email || "Not connected";
  const workspace = state.profile?.workspace_name || "DeepLinkOS workspace";
  const onboarded = !!state.profile?.onboarding_completed_at;
  const initials = getInitials(name);

  return (
    <PageFrame
      eyebrow="Settings"
      title="Profile"
      description="Identity, workspace, and session controls for your DeepLinkOS account."
    >
      <div className="settings-layout">
        {/* Identity */}
        <div className="settings-section panel">
          <div className="settings-section-title">Identity</div>

          <div className="settings-row" style={{ alignItems: "center", gap: 18 }}>
            <div className="settings-avatar" aria-label={`Avatar for ${name}`}>
              {initials}
            </div>
            <div className="settings-row__label">
              <strong>{name}</strong>
              <span>{email}</span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row__label">
              <strong>Display name</strong>
              <span>Your name shown in the workspace</span>
            </div>
            <div className="settings-row__action">
              <span style={{ fontWeight: 700, fontSize: "0.92rem" }}>{name}</span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row__label">
              <strong>Email</strong>
              <span>Used for login and notifications</span>
            </div>
            <div className="settings-row__action">
              <span style={{ fontSize: "0.88rem", color: "var(--text-soft)" }}>{email}</span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row__label">
              <strong>Workspace</strong>
              <span>Your DeepLinkOS workspace name</span>
            </div>
            <div className="settings-row__action">
              <span style={{ fontSize: "0.88rem" }}>{workspace}</span>
            </div>
          </div>
        </div>

        {/* Onboarding & status */}
        <div className="settings-section panel">
          <div className="settings-section-title">Account Status</div>

          <div className="settings-row">
            <div className="settings-row__label">
              <strong>Onboarding</strong>
              <span>Initial setup completion status</span>
            </div>
            <div className="settings-row__action">
              <span className={`badge${onboarded ? " badge--active" : " badge--pending"}`}>
                <span className="badge-dot" />
                {onboarded ? "Complete" : "In progress"}
              </span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row__label">
              <strong>Account type</strong>
              <span>Your current plan</span>
            </div>
            <div className="settings-row__action">
              <span className="badge">Free</span>
            </div>
          </div>
        </div>

        {/* Notifications placeholder */}
        <div className="settings-section panel">
          <div className="settings-section-title">Notifications</div>

          <div className="settings-row">
            <div className="settings-row__label">
              <strong>Weekly digest</strong>
              <span>Summary of link performance every Monday</span>
            </div>
            <div className="settings-row__action">
              <span className="badge badge--pending">Coming soon</span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row__label">
              <strong>Link health alerts</strong>
              <span>Notify when a link fails or is flagged</span>
            </div>
            <div className="settings-row__action">
              <span className="badge badge--pending">Coming soon</span>
            </div>
          </div>
        </div>

        {/* API access placeholder */}
        <div className="settings-section panel">
          <div className="settings-section-title">API Access</div>

          <div className="settings-row">
            <div className="settings-row__label">
              <strong>API key</strong>
              <span>Use to access the DeepLinkOS REST API</span>
            </div>
            <div className="settings-row__action">
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.82rem",
                  color: "var(--text-soft)",
                  background: "color-mix(in srgb, var(--surface-strong) 80%, transparent)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "4px 10px",
                }}
              >
                dlos_••••••••••••••••
              </span>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-row__label">
              <strong>API management</strong>
              <span>Generate, rotate, and revoke keys</span>
            </div>
            <div className="settings-row__action">
              <span className="badge badge--pending">Coming soon</span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="settings-section panel">
          <div className="settings-section-title">Security &amp; Session</div>

          <div className="settings-row">
            <div className="settings-row__label">
              <strong>Sign out</strong>
              <span>End your current session on this device</span>
            </div>
            <div className="settings-row__action">
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

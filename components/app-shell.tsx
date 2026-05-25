import Link from "next/link";
import type { PropsWithChildren } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="dashboard">
      <aside className="dashboard__sidebar">
        <Link href="/" className="brand-mark">
          <span className="brand-mark__pulse" />
          <span>DeepLinkOS</span>
        </Link>

        <div className="dashboard__group">
          <span className="dashboard__label">Workspace</span>
          <Link href="/dashboard" className="dashboard__link">
            Generator
          </Link>
          <Link href="/dashboard/links" className="dashboard__link">
            Recent links
          </Link>
        </div>

        <div className="dashboard__group">
          <span className="dashboard__label">Coming in v2</span>
          <span className="dashboard__pill">Analytics</span>
          <span className="dashboard__pill">Saved views</span>
          <span className="dashboard__pill">Teams</span>
        </div>
      </aside>

      <main className="dashboard__content">{children}</main>
    </div>
  );
}

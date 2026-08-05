import type { ReactNode } from "react";

export function PageFrame({
  eyebrow,
  title,
  description,
  action,
  badge,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="dashboard-page">
      <div className="dashboard-page__head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">{eyebrow}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 className="dashboard-page__title">{title}</h2>
            {badge && <span>{badge}</span>}
          </div>
          <p className="dashboard-page__summary">{description}</p>
        </div>
        {action && (
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
            {action}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

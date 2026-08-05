"use client";

import Link from "next/link";
import { Check, Infinity, Zap, Rocket, Crown, Star } from "lucide-react";
import { comparisonGroups, pricingFaqs, pricingPlans } from "@/content/pricing";

// ─── Icons ────────────────────────────────────────────────────────────────────
const PLAN_ICONS: Record<string, React.ReactNode> = {
  creator_trial: <Zap className="size-4" />,
  creator:       <Zap className="size-4" />,
  scale:         <Rocket className="size-4" />,
  enterprise:    <Crown className="size-4" />,
  lifetime:      <Infinity className="size-4" />,
};

// Trimmed feature lists for cards (full detail in comparison table)
const CARD_FEATURES: Record<string, string[]> = {
  creator_trial: ["3 smart links", "50K clicks / month", "1 custom domain", "Smart IAB routing", "QR code generator"],
  creator:       ["250 smart links", "50K clicks / month", "3 custom domains", "Advanced analytics", "Password-protected links"],
  scale:         ["1,000 smart links", "500K clicks / month", "10 custom domains", "A/B split testing", "Pixel integrations"],
  enterprise:    ["Unlimited links", "Unlimited clicks", "25 custom domains", "White-label reports", "Dedicated account manager"],
};

// ─── Plan card (compact, for 4-column grid) ───────────────────────────────────
function PlanCard({ plan }: { plan: (typeof pricingPlans)[0] }) {
  const features = CARD_FEATURES[plan.id] ?? plan.features.slice(0, 5).map(f => f.label);
  const isPopular = plan.highlighted;
  const isFree = plan.id === "creator_trial";

  return (
    <article className={`pc-card ${isPopular ? "pc-card--popular" : ""} ${isFree ? "pc-card--free" : ""}`}>
      {isPopular && <span className="pc-popular-badge">Most Popular</span>}

      {/* Icon + name */}
      <div className="pc-header">
        <span className={`pc-icon ${isPopular ? "pc-icon--blue" : "pc-icon--muted"}`}>
          {PLAN_ICONS[plan.id]}
        </span>
        <span className="pc-name">{plan.name}</span>
      </div>

      {/* Price */}
      <div className="pc-price">
        <span className="pc-amount">{plan.price}</span>
        {plan.suffix && <span className="pc-suffix">{plan.suffix}</span>}
      </div>
      {!isFree && <p className="pc-trial-note">30-day free trial</p>}
      {isFree && <p className="pc-trial-note">No credit card needed</p>}

      {/* Features */}
      <ul className="pc-features">
        {features.map((f) => (
          <li key={f} className="pc-feature">
            <Check className="pc-check" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link href={plan.href} className={`pc-cta ${isPopular ? "pc-cta--primary" : "pc-cta--outline"}`}>
        {plan.cta}
      </Link>
    </article>
  );
}

// ─── Comparison table ─────────────────────────────────────────────────────────
function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true)  return <td className="td-center check-icon">✓</td>;
  if (value === false) return <td className="td-center dash-icon">—</td>;
  return <td className="td-center text-value">{value}</td>;
}

function TableGroup({ group }: { group: (typeof comparisonGroups)[number] }) {
  return (
    <>
      <tr className="section-row"><td colSpan={5}>{group.title}</td></tr>
      {group.rows.map((row) => (
        <tr key={row.feature}>
          <td>{row.feature}</td>
          <FeatureValue value={row.trial} />
          <FeatureValue value={row.creator} />
          <FeatureValue value={row.scale} />
          <FeatureValue value={row.enterprise} />
        </tr>
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function PricingPageContent() {
  const mainPlans = pricingPlans.filter((p) => p.id !== "lifetime");
  const lifetime  = pricingPlans.find((p) => p.id === "lifetime")!;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="pricing-page-header">
        <div className="container pricing-container">
          <div className="section-tag pricing-kicker">Pricing</div>
          <h1 className="pricing-page-title">
            Predictable pricing.
            <br />
            <span className="grad-text">No &apos;viral&apos; penalties.</span>
          </h1>
          <p className="pricing-page-sub">
            Unlike per-click competitors, we never punish you for going viral.
            Flat-rate plans for unlimited app opens — 30-day free trial on every paid plan.
          </p>
        </div>
      </section>

      {/* ── 4-card grid ──────────────────────────────────────────────── */}
      <section className="pricing-cards-section">
        <div className="container pricing-container">

          {/* Main 4 plans */}
          <div className="pc-grid">
            {mainPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>

          {/* ── Lifetime founder card ─────────────────────────────────── */}
          <article className="lt-card">
            <div className="lt-left">
              <div className="lt-badge-row">
                <span className="lt-badge"><Star className="size-3" /> Lifetime Deal</span>
                <span className="lt-seats-badge">500 seats only</span>
              </div>
              <p className="lt-name">Lifetime Access</p>
              <div className="lt-price">
                $799
                <span className="lt-once">one-time</span>
              </div>
              <p className="lt-tagline">Pay once. Yours forever. All future updates included — no subscription, no renewals.</p>
              <Link href={lifetime.href} className="lt-cta">
                <Infinity className="size-4" />
                Claim Lifetime Access
              </Link>
            </div>

            <div className="lt-right">
              <p className="lt-features-label">Everything in Scale, plus:</p>
              <ul className="lt-features">
                {lifetime.features.map((f) => (
                  <li key={f.label} className="lt-feature">
                    <Check className="lt-check" />
                    <span className={f.highlighted ? "lt-feature--bold" : ""}>{f.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

        </div>
      </section>

      {/* ── Comparison table ──────────────────────────────────────────── */}
      <section className="compare-section">
        <div className="container pricing-container">
          <h2 className="compare-title">Compare all features</h2>
          <p className="compare-sub">Everything side-by-side so there are no surprises.</p>
          <span className="compare-hint">Swipe to see all plans →</span>
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-feature-col">Feature</th>
                  <th className="td-center">Free Trial</th>
                  <th className="td-center">
                    Creator<br />
                    <span className="compare-th-price">$29/mo</span>
                  </th>
                  <th className="td-center compare-pro">
                    Scale<br />
                    <span className="compare-th-price">$79/mo</span>
                  </th>
                  <th className="td-center">
                    Enterprise<br />
                    <span className="compare-th-price">$199/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonGroups.map((group) => (
                  <TableGroup group={group} key={group.title} />
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  <td className="td-center"><Link href="/signup" className="compare-cta">Get started</Link></td>
                  <td className="td-center"><Link href="/signup?plan=creator" className="compare-cta">Try free</Link></td>
                  <td className="td-center"><Link href="/signup?plan=scale" className="compare-cta compare-cta--pro">Try free</Link></td>
                  <td className="td-center"><Link href="/signup?plan=enterprise" className="compare-cta">Try free</Link></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="compare-lifetime-note">
            Looking for a one-time deal?{" "}
            <Link href="/signup?plan=lifetime" className="compare-lifetime-link">
              Claim a Lifetime seat for $799 →
            </Link>
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="faq-section">
        <h2 className="faq-title">Pricing FAQ</h2>
        <p className="faq-sub">No surprises. No fine print. Just honest answers.</p>
        <div className="faq-grid">
          {pricingFaqs.map((faq) => (
            <details key={faq.question}>
              <summary>
                {faq.question}
                <span className="summary-icon">+</span>
              </summary>
              <div className="faq-content">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────── */}
      <section className="pricing-cta-section">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-icon">✦</div>
            <h2>Start free — no credit card needed</h2>
            <p>
              3 smart links, 50,000 clicks/month, and full IAB routing — completely free.
              Upgrade when you&apos;re ready to scale.
            </p>
            <div className="cta-actions">
              <Link className="btn btn-primary" href="/signup">Create Free Account</Link>
              <Link className="btn btn-secondary" href="/pricing">View all plans</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

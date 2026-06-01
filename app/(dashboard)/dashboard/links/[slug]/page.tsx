import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LineChart } from "@/components/dashboard/charts/line-chart";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://deeplinkos.com").split(",")[0].trim().replace(/\/+$/, "");

export default async function SingleLinkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  // Fetch the link
  const { data: link } = await supabase
    .from("deep_links")
    .select("id, title, slug, user_id")
    .eq("slug", slug)
    .single();

  if (!link || link.user_id !== user.id) {
    return notFound();
  }

  // Fetch clicks for this link for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString();

  const { data: clickRows } = await supabase
    .from("clicks")
    .select("timestamp")
    .eq("link_id", link.id)
    .gte("timestamp", since);

  let labels30d: string[] = [];
  let data30d: number[] = [];

  if (clickRows) {
    const dayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dayMap[dateStr] = 0;
    }

    clickRows.forEach((r) => {
      const dateStr = new Date(r.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dayMap[dateStr] !== undefined) {
        dayMap[dateStr]++;
      }
    });

    labels30d = Object.keys(dayMap);
    data30d = Object.values(dayMap);
  }

  return (
    <>
      <Link href="/dashboard/links" className="btn-back" style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "var(--text-2)", cursor: "pointer", fontSize: 14, fontWeight: 500, marginBottom: 24, textDecoration: "none" }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
        Back to Links
      </Link>
      
      <div className="panel" style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>{link.title || "Untitled"}</h2>
          <a href={`${siteUrl}/r/${link.slug}`} target="_blank" rel="noopener noreferrer" className="link-short" style={{ fontSize: 18 }}>
            {siteUrl.replace(/^https?:\/\//, '')}/r/{link.slug}
          </a>
        </div>
      </div>
      
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-header" style={{ marginBottom: 12 }}>
          <div className="panel-title">Traffic Trend</div>
        </div>
        <div style={{ height: 300 }}>
          {labels30d.length > 0 ? (
            <LineChart labels={labels30d} data={data30d} />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border)", borderRadius: 8 }}>
              <p style={{ color: "var(--text-2)", fontSize: 14 }}>No click data for the last 30 days.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

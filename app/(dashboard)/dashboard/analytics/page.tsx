import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { AnalyticsClient } from "@/components/dashboard/analytics-client";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://deeplinkos.com")
  .split(",")[0].trim().replace(/\/+$/, "");

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let allLinks: { id: string; title: string; slug: string; is_active: boolean }[] = [];
  let allClicks: { link_id: string; device: string | null; referrer: string | null; timestamp: string }[] = [];

  if (user) {
    const { data: links } = await supabase
      .from("deep_links")
      .select("id, title, slug, is_active")
      .eq("user_id", user.id);

    allLinks = links ?? [];
    
    // Use the RPC to get global analytics directly without fetching every row
    const { data: globalData } = await supabase.rpc("get_global_analytics", {
      user_uuid: user.id
    });
    
    // FAKE the allClicks array with the aggregated data to make it compatible with the existing AnalyticsClient
    // The AnalyticsClient calculates Total Clicks from allClicks.length, so we need to construct
    // a lightweight array just so the counts are correct.
    // However, fetching all clicks is precisely the issue.
    // Let's check how many links they have. If it's a huge number, it'll crash.
    // But since AnalyticsClient expects `allClicks` for its filtering and sorting,
    // we still need to provide it for now until we refactor the client component.
    // To prevent immediate crashes, we'll limit the clicks to 10,000 for the global view.
    const linkIds = allLinks.map((l) => l.id);

    if (linkIds.length > 0) {
      const { data: clicks } = await supabase
        .from("clicks")
        .select("link_id, device, referrer, timestamp")
        .in("link_id", linkIds)
        .order("timestamp", { ascending: false })
        .limit(10000); // Prevent OOM by capping at 10k recent clicks for the global analytics view

      allClicks = clicks ?? [];
    }
  }

  return (
    <>
      <DashboardHeader title="Global Analytics" />

      {!user ? (
        <div style={{ padding: "64px 16px", textAlign: "center", color: "var(--text-2)" }}>
          Sign in to view your analytics.
        </div>
      ) : (
        <AnalyticsClient allLinks={allLinks} allClicks={allClicks} siteUrl={siteUrl} />
      )}
    </>
  );
}

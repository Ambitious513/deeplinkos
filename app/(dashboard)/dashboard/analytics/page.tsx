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
    const linkIds = allLinks.map((l) => l.id);

    if (linkIds.length > 0) {
      const { data: clicks } = await supabase
        .from("clicks")
        .select("link_id, device, referrer, timestamp")
        .in("link_id", linkIds);

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

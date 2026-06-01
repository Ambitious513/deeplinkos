import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { LinksTable } from "@/components/dashboard/links-table";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://deeplinkos.com")
  .split(",")[0].trim().replace(/\/+$/, "");

export default async function LinksPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let links: {
    id: string;
    title: string;
    slug: string;
    desktop_url: string | null;
    is_active: boolean;
    clickCount: number;
  }[] = [];

  if (user) {
    const { data: userLinks } = await supabase
      .from("deep_links")
      .select("id, title, slug, desktop_url, is_active, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const allLinks = userLinks ?? [];

    if (allLinks.length > 0) {
      const linkIds = allLinks.map((l) => l.id);

      const { data: clickRows } = await supabase
        .from("clicks")
        .select("link_id")
        .in("link_id", linkIds);

      const clickMap: Record<string, number> = {};
      if (clickRows) {
        for (const row of clickRows) {
          clickMap[row.link_id] = (clickMap[row.link_id] ?? 0) + 1;
        }
      }

      links = allLinks.map((l) => ({
        id: l.id,
        title: l.title || "Untitled",
        slug: l.slug,
        desktop_url: l.desktop_url,
        is_active: l.is_active,
        clickCount: clickMap[l.id] ?? 0,
      }));
    }
  }

  return (
    <>
      <DashboardHeader title="Links Manager" />
      <div className="panel" id="links-populated">
        <Suspense
          fallback={
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-2)" }}>
              Loading links…
            </div>
          }
        >
          <LinksTable links={links} siteUrl={siteUrl} />
        </Suspense>
      </div>
    </>
  );
}

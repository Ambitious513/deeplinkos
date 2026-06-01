import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard/header";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://deeplinkos.com").split(",")[0].trim().replace(/\/+$/, "");

export default async function LinksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
        <div className="panel-header">
          <div className="panel-title">All Smart Links</div>
          <div className="input-group">
            <input
              type="text"
              className="input-field"
              placeholder="Search links..."
            />
            <button className="btn-secondary">Filter</button>
          </div>
        </div>
        <div className="table-responsive">
          {links.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Link Name</th>
                  <th>Short URL</th>
                  <th>Destination</th>
                  <th>Total Clicks</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id}>
                    <td style={{ fontWeight: 500 }}>{link.title}</td>
                    <td>
                      <span className="link-short">
                        {siteUrl}/r/{link.slug}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color: "var(--text-2)",
                          maxWidth: "150px",
                          display: "inline-block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {link.desktop_url ?? "—"}
                      </span>
                    </td>
                    <td>{link.clickCount.toLocaleString()}</td>
                    <td>
                      <span className="badge-active">
                        {link.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        style={{ padding: "4px 10px" }}
                      >
                        Stats
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div
              style={{
                padding: "48px 16px",
                textAlign: "center",
                color: "var(--text-2)",
                fontSize: "14px",
              }}
            >
              {user
                ? "No links yet. Create your first smart link!"
                : "Sign in to manage your links."}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

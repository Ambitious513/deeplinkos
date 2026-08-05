import { PageFrame } from "@/components/dashboard/page-frame";
import { LinksManager } from "@/components/dashboard/links-manager";
import { listLinksForUser } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export default async function LinksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const links = user ? await listLinksForUser(user.id) : [];

  return (
    <PageFrame
      eyebrow="Dashboard"
      title="Links"
      description="Create, copy, pause, and inspect your smart links from one connected manager."
    >
      <LinksManager initialLinks={links} siteUrl={siteUrl()} />
    </PageFrame>
  );
}

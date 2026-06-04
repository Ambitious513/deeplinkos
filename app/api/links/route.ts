import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLinkFromPayload } from "@/lib/links";

export async function POST(request: Request) {
  // ── Auth guard ────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const link = await createLinkFromPayload(body);

    const forwardedHostHeader = request.headers.get("x-forwarded-host");
    const forwardedHost = forwardedHostHeader
      ? forwardedHostHeader.split(",")[0].trim()
      : null;
    const forwardedProto = (
      request.headers.get("x-forwarded-proto") || "https"
    )
      .split(",")[0]
      .trim();

    const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const cleanSiteUrl = rawSiteUrl.split(",")[0].trim().replace(/\/+$/, "");

    const origin =
      cleanSiteUrl ||
      (forwardedHost
        ? `${forwardedProto}://${forwardedHost}`
        : new URL(request.url).origin);

    return NextResponse.json(
      { link, shortUrl: `${origin}/r/${link.slug}` },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create link." },
      { status: 400 }
    );
  }
}

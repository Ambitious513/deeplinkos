import { NextResponse } from "next/server";

import { createLinkFromPayload } from "@/lib/links";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const link = await createLinkFromPayload(body);
    const forwardedHostHeader = request.headers.get("x-forwarded-host");
    // x-forwarded-host can be a comma-separated list (proxy chains) — always take the first
    const forwardedHost = forwardedHostHeader ? forwardedHostHeader.split(",")[0].trim() : null;
    const forwardedProto = (request.headers.get("x-forwarded-proto") || "https").split(",")[0].trim();

    // NEXT_PUBLIC_SITE_URL may accidentally contain commas if misconfigured in Coolify env.
    // Sanitize it: strip trailing slashes and take only the first value if comma-separated.
    const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const cleanSiteUrl = rawSiteUrl.split(",")[0].trim().replace(/\/+$/, "");

    const origin = cleanSiteUrl
      || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : new URL(request.url).origin);

    return NextResponse.json(
      {
        link,
        shortUrl: `${origin}/r/${link.slug}`
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create link."
      },
      { status: 400 }
    );
  }
}

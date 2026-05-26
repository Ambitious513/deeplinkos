import { NextResponse } from "next/server";

import { createLinkFromPayload } from "@/lib/links";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const link = await createLinkFromPayload(body);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    const origin = process.env.NEXT_PUBLIC_SITE_URL || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : new URL(request.url).origin);

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

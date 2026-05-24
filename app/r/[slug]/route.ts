import { NextResponse } from "next/server";

import { getLink } from "@/lib/links";
import { resolveDestination } from "@/lib/routing";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const record = await getLink(slug);

  if (!record) {
    return NextResponse.redirect(new URL("/missing", request.url));
  }

  const destination = resolveDestination(record, request.headers.get("user-agent"));

  if (!destination) {
    return NextResponse.redirect(new URL("/missing", request.url));
  }

  return NextResponse.redirect(destination.destination, 307);
}

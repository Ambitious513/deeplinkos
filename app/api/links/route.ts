import { NextResponse } from "next/server";

import { createLinkForUser, listLinksForUser, getClickCountsForLinks } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";
import { isTrialLinkLimitReached } from "@/lib/polar";
import { detectSmartRouting } from "@/lib/routing";


function shortUrlFor(request: Request, slug: string) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.split(",")[0]?.trim().replace(/\/+$/, "");
  const origin = configuredUrl || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : new URL(request.url).origin);

  return `${origin}/r/${slug}`;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const links = await listLinksForUser(user.id);
    const clickCounts = await getClickCountsForLinks(links.map((l) => l.id));
    return NextResponse.json({ links, clickCounts });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to list links." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Trial gate: check if user has hit the 3-link free limit ─────────────────
  // We check this BEFORE parsing the body to fail fast.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const planId = (profile?.plan ?? "creator_trial") as string;

  if (planId === "creator_trial") {
    // Count existing links for this user
    const { count, error: countError } = await supabase
      .from("deep_links")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!countError && isTrialLinkLimitReached("creator_trial", count ?? 0)) {
      // 402 Payment Required — the client should show the upgrade modal
      return NextResponse.json(
        {
          error: "trial_limit_reached",
          message: "You've used all 3 of your free trial links. Start your free Creator trial to create more.",
          action: "upgrade",
          limitReached: true,
          trialLimit: 3,
        },
        { status: 402 },
      );
    }
  }

  // ── Create the link ──────────────────────────────────────────────────────────
  try {
    const body = await request.json();
    const link = await createLinkForUser(body, user.id);
    const { detected, appName } = detectSmartRouting(link.destinationUrl);

    return NextResponse.json(
      {
        link,
        shortUrl: shortUrlFor(request, link.slug),
        smart_routing_detected: detected,
        detected_app: appName,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create link." }, { status: 400 });
  }
}

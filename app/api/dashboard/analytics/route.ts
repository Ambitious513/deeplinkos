import { NextResponse } from "next/server";

import { getAuthState } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function daysFor(value: string | null) {
  if (value === "30d") return 30;
  if (value === "all") return 3650;
  return 7;
}

/** Convert ISO-3166-1 alpha-2 country code to flag emoji (e.g. "US" → 🇺🇸) */
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  return Array.from(code.toUpperCase())
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 0x1f1a5))
    .join("");
}

export async function GET(request: Request) {
  const state = await getAuthState();
  if (!state.user) {
    return NextResponse.json({ demo: true });
  }

  const range = new URL(request.url).searchParams.get("range");
  const days = daysFor(range);
  const supabase = await createClient();

  // Run all five queries in parallel
  const [summary, clicksByDay, global, countryRows, campaignRows] = await Promise.all([
    supabase.rpc("get_dashboard_analytics", { user_uuid: state.user.id, days_ago: days }),
    supabase.rpc("get_clicks_by_day", { user_uuid: state.user.id, days_ago: days }),
    supabase.rpc("get_global_analytics", { user_uuid: state.user.id }),
    // Countries — RLS filters to the user's own links automatically
    supabase
      .from("clicks")
      .select("country")
      .eq("is_bot", false)
      .eq("is_prefetch", false)
      .not("country", "is", null)
      .gte("clicked_at", new Date(Date.now() - days * 864e5).toISOString())
      .limit(5000),
    // UTM campaigns — only rows where a campaign tag exists
    supabase
      .from("clicks")
      .select("utm_campaign, utm_medium")
      .eq("is_bot", false)
      .eq("is_prefetch", false)
      .not("utm_campaign", "is", null)
      .gte("clicked_at", new Date(Date.now() - days * 864e5).toISOString())
      .limit(5000),
  ]);

  const error = summary.error || clicksByDay.error || global.error;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Remap DB function output (by_device/count) to what the analytics page expects (devices/clicks)
  const rawGlobal = (global.data ?? {}) as Record<string, Array<Record<string, unknown>>>;
  const remappedGlobal = {
    devices: (rawGlobal.by_device ?? []).map((r) => ({
      device: r.device ?? "Unknown",
      clicks: Number(r.count ?? 0),
    })),
    browsers: (rawGlobal.by_browser ?? []).map((r) => ({
      browser: r.browser ?? "Unknown",
      clicks: Number(r.count ?? 0),
    })),
    referrers: (rawGlobal.by_referrer ?? []).map((r) => ({
      referrer: r.referrer ?? "Direct",
      clicks: Number(r.count ?? 0),
    })),
  };

  // Aggregate country rows in JS (PostgREST JS client doesn't support GROUP BY)
  const countryMap: Record<string, number> = {};
  for (const row of countryRows.data ?? []) {
    const c = (row.country as string | null)?.trim().toUpperCase();
    if (c) countryMap[c] = (countryMap[c] ?? 0) + 1;
  }
  const totalCountryClicks = Object.values(countryMap).reduce((a, b) => a + b, 0);
  const countries = Object.entries(countryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([code, clicks]) => ({
      code,
      country: code,
      flag: countryFlag(code),
      clicks,
      share: totalCountryClicks
        ? Math.round((clicks / totalCountryClicks) * 1000) / 10
        : 0,
    }));

  // Aggregate campaign rows in JS
  const campaignMap: Record<string, { clicks: number; channel: string }> = {};
  for (const row of campaignRows.data ?? []) {
    const name    = (row.utm_campaign as string | null)?.trim();
    const channel = (row.utm_medium  as string | null)?.trim() || "direct";
    if (!name) continue;
    if (!campaignMap[name]) campaignMap[name] = { clicks: 0, channel };
    campaignMap[name].clicks += 1;
  }
  const campaigns = Object.entries(campaignMap)
    .sort(([, a], [, b]) => b.clicks - a.clicks)
    .slice(0, 10)
    .map(([name, { clicks, channel }]) => ({
      name,
      channel,
      clicks,
      conversions: 0,
      convRate:    0,
    }));

  return NextResponse.json({
    demo: false,
    summary: summary.data?.[0] ?? null,
    clicksByDay: clicksByDay.data ?? [],
    global: remappedGlobal,
    countries,
    campaigns,
  });
}

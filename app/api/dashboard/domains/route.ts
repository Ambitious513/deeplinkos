import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

import { getAuthState } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
const CNAME_TARGET = "cname.deeplinkos.com";
const MAX_DOMAINS_PER_USER = 10;

export async function GET() {
  const state = await getAuthState();
  if (!state.user) {
    return NextResponse.json({ demo: true, domains: [] });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("user_id", state.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ demo: false, domains: data });
}

export async function POST(request: Request) {
  const state = await getAuthState();
  if (!state.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { domainName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const domainName = (body.domainName ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  if (!domainName || !DOMAIN_REGEX.test(domainName)) {
    return NextResponse.json({ error: "Invalid domain name. Use format: go.example.com" }, { status: 400 });
  }

  const supabase = await createClient();

  // Enforce per-user limit
  const { count } = await supabase
    .from("domains")
    .select("id", { count: "exact", head: true })
    .eq("user_id", state.user.id);

  if ((count ?? 0) >= MAX_DOMAINS_PER_USER) {
    return NextResponse.json({ error: `You can have at most ${MAX_DOMAINS_PER_USER} domains.` }, { status: 400 });
  }

  // Check for duplicates across all users (domains are globally unique)
  const { data: existing } = await supabase
    .from("domains")
    .select("id")
    .eq("domain_name", domainName)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "This domain is already registered." }, { status: 409 });
  }

  const verificationToken = `dlos-verify=${randomBytes(12).toString("hex")}`;

  const { data, error } = await supabase
    .from("domains")
    .insert({
      user_id: state.user.id,
      domain_name: domainName,
      status: "pending",
      verification_token: verificationToken,
      cname_target: CNAME_TARGET,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ domain: data }, { status: 201 });
}

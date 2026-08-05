import { NextResponse } from "next/server";

import { getAuthState } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** DELETE /api/dashboard/domains/[id] — remove a domain the user owns */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const state = await getAuthState();
  if (!state.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  // Verify ownership before deleting
  const { data: domain } = await supabase
    .from("domains")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!domain) {
    return NextResponse.json({ error: "Domain not found." }, { status: 404 });
  }

  if (domain.user_id !== state.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { error } = await supabase.from("domains").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id });
}

/** PATCH /api/dashboard/domains/[id] — trigger DNS re-verification (updates last_checked_at) */
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const state = await getAuthState();
  if (!state.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();

  // Verify ownership
  const { data: domain } = await supabase
    .from("domains")
    .select("id, user_id, domain_name, status")
    .eq("id", id)
    .maybeSingle();

  if (!domain) {
    return NextResponse.json({ error: "Domain not found." }, { status: 404 });
  }

  if (domain.user_id !== state.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Update last_checked_at to signal a re-check was requested
  const { data: updated, error } = await supabase
    .from("domains")
    .update({ last_checked_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ domain: updated });
}

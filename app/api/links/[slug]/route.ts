import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ── DELETE /api/links/[slug] ─────────────────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: link } = await supabase
    .from("deep_links")
    .select("id, user_id")
    .eq("slug", slug)
    .single();

  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  if (link.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase.from("deep_links").delete().eq("id", link.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, slug });
}

// ── PATCH /api/links/[slug] — toggle active/inactive ────────────
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { is_active?: boolean };

  const { data: link } = await supabase
    .from("deep_links")
    .select("id, user_id")
    .eq("slug", slug)
    .single();

  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  if (link.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase
    .from("deep_links")
    .update({ is_active: body.is_active })
    .eq("id", link.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, is_active: body.is_active });
}

// ── PUT /api/links/[slug] — edit link fields ──────────────────────
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { data: link } = await supabase
    .from("deep_links")
    .select("id, user_id")
    .eq("slug", slug)
    .single();

  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  if (link.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await supabase
    .from("deep_links")
    .update({
      title:           body.title          ?? undefined,
      desktop_url:     body.desktopUrl     ?? undefined,
      ios_deep_link:   body.iosDeepLink    ?? undefined,
      ios_store_url:   body.iosStoreUrl    ?? undefined,
      android_deep_link: body.androidDeepLink ?? undefined,
      android_store_url: body.androidStoreUrl ?? undefined,
    })
    .eq("id", link.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // Verify ownership
  const { data: link } = await supabase
    .from("deep_links")
    .select("id, user_id")
    .eq("slug", slug)
    .single();

  if (!link) return NextResponse.json({ error: "Link not found" }, { status: 404 });
  if (link.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Delete — clicks cascade automatically via FK
  const { error } = await supabase.from("deep_links").delete().eq("id", link.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, slug });
}

import { NextResponse } from "next/server";

import { deleteLinkForUser, toggleLinkForUser, updateLinkForUser } from "@/lib/links";
import { createClient } from "@/lib/supabase/server";
import { toggleLinkSchema, updateLinkSchema } from "@/lib/validation";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const parsed = toggleLinkSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid status payload." }, { status: 400 });
  }

  try {
    const link = await toggleLinkForUser(slug, parsed.data.is_active, user.id);
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({ link });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update link." }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  // Validate the request body before touching the database
  const parsed = updateLinkSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid request body." },
      { status: 400 }
    );
  }

  try {
    const link = await updateLinkForUser(slug, parsed.data, user.id);
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({ link });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update link." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  try {
    const deleted = await deleteLinkForUser(slug, user.id);
    if (!deleted) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete link." }, { status: 500 });
  }
}

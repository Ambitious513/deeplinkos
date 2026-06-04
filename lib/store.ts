import { createSlug, normalizeSlug } from "@/lib/slug";
import type { CreateLinkInput, LinkRecord } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function listLinks(): Promise<LinkRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('deep_links')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error listing links:", error);
    return [];
  }

  // Map snake_case from DB to camelCase LinkRecord
  return data.map(mapToLinkRecord);
}

export async function findLinkBySlug(slug: string): Promise<LinkRecord | null> {
  const normalized = normalizeSlug(slug);
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('deep_links')
    .select('*')
    .eq('slug', normalized)
    .single();

  if (error || !data) {
    return null;
  }

  return mapToLinkRecord(data);
}

export async function createLink(input: CreateLinkInput): Promise<LinkRecord> {
  const supabase = await createClient();
  const desiredSlug = normalizeSlug(input.slug) || createSlug();

  if (!desiredSlug) {
    throw new Error("Unable to generate a slug.");
  }

  // Check if slug exists
  const existing = await findLinkBySlug(desiredSlug);
  if (existing) {
    throw new Error("That slug is already taken.");
  }

  // Get current user if logged in
  const { data: { user } } = await supabase.auth.getUser();

  const insertData = {
    user_id: user?.id || null,
    slug: desiredSlug,
    title: input.title?.trim() || "Custom smart link",
    preset: input.preset || "custom",
    status: "active",
    ios_deep_link: input.iosDeepLink || null,
    ios_store_url: input.iosStoreUrl || null,
    android_deep_link: input.androidDeepLink || null,
    android_store_url: input.androidStoreUrl || null,
    desktop_url: input.desktopUrl || null,
    routing_config: input.campaign ? { campaign: input.campaign } : null,
    is_active: true
  };

  const { data, error } = await supabase
    .from('deep_links')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create link: ${error.message}`);
  }

  return mapToLinkRecord(data);
}

function mapToLinkRecord(row: any): LinkRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    preset: row.preset,
    status: row.is_active ? "active" : "inactive",
    isActive: row.is_active ?? true,
    expiresAt: row.expires_at ?? null,
    password: row.password ?? null,
    iosDeepLink: row.ios_deep_link,
    iosStoreUrl: row.ios_store_url,
    androidDeepLink: row.android_deep_link,
    androidStoreUrl: row.android_store_url,
    desktopUrl: row.desktop_url,
    campaign: row.routing_config?.campaign || "",
    workspaceId: null,
    createdByUserId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata: row.metadata
  };
}

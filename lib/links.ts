import { mergeInferredInput } from "@/lib/inference";
import { createSlug, normalizeSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/crypto";
import type { CreateLinkInput, LinkRecord, PresetKey, UpdateLinkInput } from "@/lib/types";
import { createLinkSchema, updateLinkSchema } from "@/lib/validation";
import type { Database } from "@/lib/database.types";

type LinkRow = Database["public"]["Tables"]["deep_links"]["Row"];
type LinkInsert = Database["public"]["Tables"]["deep_links"]["Insert"];
type LinkUpdate = Database["public"]["Tables"]["deep_links"]["Update"];

export function mapToLinkRecord(row: LinkRow): LinkRecord {
  return {
    id: row.id,
    userId: row.user_id,
    domainId: row.domain_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    preset: row.preset as PresetKey,
    status: row.status,
    isActive: row.is_active,
    destinationUrl: row.destination_url,
    iosDeepLink: row.ios_deep_link,
    iosStoreUrl: row.ios_store_url,
    androidDeepLink: row.android_deep_link,
    androidStoreUrl: row.android_store_url,
    desktopUrl: row.desktop_url,
    fallbackUrl: row.fallback_url,
    passwordHash: row.password_hash,
    expiresAt: row.expires_at,
    abTestUrl: row.ab_test_url,
    abTestWeight: row.ab_test_weight,
    campaign: row.campaign,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    utmTerm: row.utm_term,
    utmContent: row.utm_content,
    routingConfig: row.routing_config,
    metadata: row.metadata,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensureAvailableSlug(baseSlug: string, userId: string) {
  const supabase = await createClient();
  let candidate = normalizeSlug(baseSlug) || createSlug();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data } = await supabase
      .from("deep_links")
      .select("id")
      .eq("slug", candidate)
      .is("domain_id", null)
      .maybeSingle();

    if (!data) {
      return candidate;
    }

    candidate = `${normalizeSlug(baseSlug) || "link"}-${createSlug(4)}`;
  }

  throw new Error("Unable to generate an available slug.");
}

function cleanDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Use a valid expiration date.");
  }
  return date.toISOString();
}

async function toInsert(input: CreateLinkInput, userId: string): Promise<LinkInsert> {
  const merged = mergeInferredInput(input);
  const slug = await ensureAvailableSlug(merged.slug || "", userId);

  return {
    user_id: userId,
    domain_id: merged.domainId ?? null,
    slug,
    title: merged.title?.trim() || "Custom smart link",
    description: merged.description ?? null,
    preset: merged.preset || "custom",
    status: "active",
    is_active: true,
    destination_url: merged.destinationUrl ?? null,
    ios_deep_link: merged.iosDeepLink ?? null,
    ios_store_url: merged.iosStoreUrl ?? null,
    android_deep_link: merged.androidDeepLink ?? null,
    android_store_url: merged.androidStoreUrl ?? null,
    desktop_url: merged.desktopUrl ?? null,
    fallback_url: merged.fallbackUrl ?? null,
    password_hash: merged.password ? await hashPassword(merged.password) : null,
    expires_at: cleanDate(merged.expiresAt),
    ab_test_url: merged.abTestUrl ?? null,
    ab_test_weight: merged.abTestWeight ?? 50,
    campaign: merged.campaign ?? null,
    utm_source: merged.utmSource ?? null,
    utm_medium: merged.utmMedium ?? null,
    utm_campaign: merged.utmCampaign ?? null,
    utm_term: merged.utmTerm ?? null,
    utm_content: merged.utmContent ?? null,
    tags: merged.tags ?? [],
  };
}

function removeUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

async function toUpdate(input: UpdateLinkInput, userId: string, currentSlug: string): Promise<LinkUpdate> {
  const inferred = input.destinationUrl ? mergeInferredInput(input) : input;
  const merged: UpdateLinkInput = {
    ...inferred,
    status: input.status,
    isActive: input.isActive,
    password: input.password,
  };
  const normalizedNextSlug = normalizeSlug(merged.slug);
  const nextSlug = normalizedNextSlug && normalizedNextSlug !== currentSlug ? await ensureAvailableSlug(normalizedNextSlug, userId) : undefined;

  if (nextSlug && nextSlug === currentSlug) {
    return removeUndefined({
      title: merged.title,
      description: merged.description,
      preset: merged.preset,
      status: merged.status,
      is_active: merged.isActive,
      destination_url: merged.destinationUrl,
      ios_deep_link: merged.iosDeepLink,
      ios_store_url: merged.iosStoreUrl,
      android_deep_link: merged.androidDeepLink,
      android_store_url: merged.androidStoreUrl,
      desktop_url: merged.desktopUrl,
      fallback_url: merged.fallbackUrl,
      expires_at: cleanDate(merged.expiresAt),
      ab_test_url: merged.abTestUrl,
      ab_test_weight: merged.abTestWeight,
      campaign: merged.campaign,
      utm_source: merged.utmSource,
      utm_medium: merged.utmMedium,
      utm_campaign: merged.utmCampaign,
      utm_term: merged.utmTerm,
      utm_content: merged.utmContent,
      tags: merged.tags,
    });
  }

  return removeUndefined({
    slug: nextSlug,
    title: merged.title,
    description: merged.description,
    preset: merged.preset,
    status: merged.status,
    is_active: merged.isActive,
    destination_url: merged.destinationUrl,
    ios_deep_link: merged.iosDeepLink,
    ios_store_url: merged.iosStoreUrl,
    android_deep_link: merged.androidDeepLink,
    android_store_url: merged.androidStoreUrl,
    desktop_url: merged.desktopUrl,
    fallback_url: merged.fallbackUrl,
    password_hash: merged.password ? await hashPassword(merged.password) : undefined,
    expires_at: cleanDate(merged.expiresAt),
    ab_test_url: merged.abTestUrl,
    ab_test_weight: merged.abTestWeight,
    campaign: merged.campaign,
    utm_source: merged.utmSource,
    utm_medium: merged.utmMedium,
    utm_campaign: merged.utmCampaign,
    utm_term: merged.utmTerm,
    utm_content: merged.utmContent,
    tags: merged.tags,
  });
}

export async function listLinksForUser(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deep_links")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapToLinkRecord);
}

/**
 * Returns a map of { linkId → clickCount } for the given link IDs.
 * Filters out bot and prefetch traffic. Single DB round-trip.
 */
export async function getClickCountsForLinks(
  linkIds: string[]
): Promise<Record<string, number>> {
  if (linkIds.length === 0) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("clicks")
    .select("link_id")
    .in("link_id", linkIds)
    .eq("is_bot", false)
    .eq("is_prefetch", false);

  if (!data) return {};

  return data.reduce<Record<string, number>>((acc, row) => {
    const id = row.link_id as string;
    acc[id] = (acc[id] ?? 0) + 1;
    return acc;
  }, {});
}

export async function findOwnedLinkBySlug(slug: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deep_links")
    .select("*")
    .eq("user_id", userId)
    .eq("slug", normalizeSlug(slug))
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapToLinkRecord(data) : null;
}

function isDefaultAppHost(hostname: string) {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "deeplinkos.com";
  return (
    !hostname ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === appDomain ||
    hostname === `www.${appDomain}` ||
    hostname.endsWith(`.${appDomain}`)
  );
}


export async function findActiveLinkForRedirect(slug: string, hostname = "") {
  const supabase = await createClient();

  let domainId: string | null = null;
  if (!isDefaultAppHost(hostname)) {
    const { data: domain, error: domainError } = await supabase
      .from("domains")
      .select("id")
      .eq("domain_name", hostname)
      .eq("status", "active")
      .maybeSingle();

    if (domainError || !domain) {
      return null;
    }

    domainId = domain.id;
  }

  let query = supabase
    .from("deep_links")
    .select("*")
    .eq("slug", normalizeSlug(slug))
    .eq("is_active", true)
    .eq("status", "active");

  query = domainId ? query.eq("domain_id", domainId) : query.is("domain_id", null);

  const { data, error } = await query.maybeSingle();

  if (error) {
    return null;
  }

  return data ? mapToLinkRecord(data) : null;
}

export async function createLinkForUser(payload: unknown, userId: string) {
  const parsed = createLinkSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid link configuration.");
  }

  const supabase = await createClient();
  const insert = await toInsert(parsed.data, userId);
  const { data, error } = await supabase.from("deep_links").insert(insert).select("*").single();

  if (error) {
    throw new Error(error.code === "23505" ? "That slug is already taken." : error.message);
  }

  return mapToLinkRecord(data);
}

export async function updateLinkForUser(slug: string, payload: unknown, userId: string) {
  const parsed = updateLinkSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid link configuration.");
  }

  const current = await findOwnedLinkBySlug(slug, userId);
  if (!current) {
    return null;
  }

  const supabase = await createClient();
  const update = await toUpdate(parsed.data, userId, current.slug);
  const { data, error } = await supabase.from("deep_links").update(update).eq("id", current.id).select("*").single();

  if (error) {
    throw new Error(error.code === "23505" ? "That slug is already taken." : error.message);
  }

  return mapToLinkRecord(data);
}

export async function toggleLinkForUser(slug: string, isActive: boolean, userId: string) {
  const current = await findOwnedLinkBySlug(slug, userId);
  if (!current) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deep_links")
    .update({ is_active: isActive, status: isActive ? "active" : "paused" })
    .eq("id", current.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapToLinkRecord(data);
}

export async function deleteLinkForUser(slug: string, userId: string) {
  const current = await findOwnedLinkBySlug(slug, userId);
  if (!current) {
    return false;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("deep_links").delete().eq("id", current.id);
  if (error) throw new Error(error.message);

  return true;
}

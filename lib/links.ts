import { createLinkSchema } from "@/lib/validation";
import { mergeInferredInput } from "@/lib/inference";
import { createLink, findLinkBySlug, listLinks } from "@/lib/store";
import { normalizeSlug } from "@/lib/slug";

export async function createLinkFromPayload(payload: unknown) {
  const parsed = createLinkSchema.safeParse(payload);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new Error(firstIssue?.message || "Invalid link configuration.");
  }

  return createLink({
    ...mergeInferredInput(parsed.data),
    slug: normalizeSlug(parsed.data.slug)
  });
}

export async function getLink(slug: string) {
  return findLinkBySlug(slug);
}

export async function getRecentLinks() {
  return listLinks();
}

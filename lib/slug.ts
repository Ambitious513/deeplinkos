// DB constraint: slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$'  → min 3 chars, max 64, lowercase alphanumeric + hyphens, no leading/trailing hyphen
const SLUG_MIN_LENGTH = 3;
const SLUG_MAX_LENGTH = 64;

export function normalizeSlug(input?: string | null) {
  if (!input) return "";

  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, SLUG_MAX_LENGTH);

  // Return empty string if too short — caller will generate a random slug instead
  return normalized.length >= SLUG_MIN_LENGTH ? normalized : "";
}

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function createSlug(length = 7) {
  let slug = "";
  for (let index = 0; index < length; index += 1) {
    slug += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return slug;
}

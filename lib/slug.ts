const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function normalizeSlug(input?: string) {
  if (!input) {
    return "";
  }

  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export function createSlug(length = 7) {
  let slug = "";

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    slug += ALPHABET[randomIndex];
  }

  return slug;
}

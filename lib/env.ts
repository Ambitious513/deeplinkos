/**
 * lib/env.ts
 *
 * Centralised environment variable validation.
 * - getPublicSupabaseEnv / getServiceSupabaseEnv: used by Supabase client helpers
 * - validateServerEnv: called in app/layout.tsx to catch missing VPS config
 *   on every cold start before requests hit broken routes.
 */
import { z } from "zod";

// ── Supabase client schemas (existing helpers preserved) ─────────────────────

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serviceEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getPublicSupabaseEnv() {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

export function getServiceSupabaseEnv() {
  return serviceEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

// ── Full server-side env validation ─────────────────────────────────────────
// Called in app/layout.tsx — throws on cold start if anything is misconfigured.

const serverEnvSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, "NEXT_PUBLIC_SUPABASE_ANON_KEY looks invalid"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10, "SUPABASE_SERVICE_ROLE_KEY looks invalid"),
  // App
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL (e.g. https://deeplinkos.com)"),
  // Security
  IP_HASH_SALT: z.string().min(32, "IP_HASH_SALT must be at least 32 chars — run: openssl rand -hex 32"),
  // Polar billing
  POLAR_WEBHOOK_SECRET: z.string().min(10, "POLAR_WEBHOOK_SECRET looks invalid"),
  POLAR_CHECKOUT_URL_CREATOR: z.string().url("POLAR_CHECKOUT_URL_CREATOR must be a valid URL"),
  POLAR_CHECKOUT_URL_SCALE: z.string().url("POLAR_CHECKOUT_URL_SCALE must be a valid URL"),
  POLAR_CHECKOUT_URL_ENTERPRISE: z.string().url("POLAR_CHECKOUT_URL_ENTERPRISE must be a valid URL"),
  POLAR_CHECKOUT_URL_LIFETIME: z.string().url("POLAR_CHECKOUT_URL_LIFETIME must be a valid URL"),
});

let _validated = false;

/**
 * Call once in app/layout.tsx (server component) so this runs on every
 * cold start. Skips browser context where server vars are unavailable.
 */
export function validateServerEnv(): void {
  // Only run server-side, and only once per process
  if (typeof window !== "undefined" || _validated) return;

  const result = serverEnvSchema.safeParse(process.env);

  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");

    // In production, crash loudly so PM2/Docker restarts the process
    // and the error appears in VPS logs immediately.
    throw new Error(
      `\n\n❌ Missing or invalid environment variables:\n${missing}\n\n` +
        `Fix these in your .env.local (dev) or VPS environment (prod).\n`
    );
  }

  _validated = true;
}

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
// Helper: treat empty / placeholder / short strings as "not provided"
const optionalStr = (minLen = 1) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim().length >= minLen ? v.trim() : undefined),
    z.string().optional()
  );

const serverEnvSchema = z.object({
  // Supabase — always required
  NEXT_PUBLIC_SUPABASE_URL:      z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, "NEXT_PUBLIC_SUPABASE_ANON_KEY looks invalid"),
  SUPABASE_SERVICE_ROLE_KEY:     z.string().min(10, "SUPABASE_SERVICE_ROLE_KEY looks invalid"),
  // App — always required
  NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL (e.g. https://deeplinkos.com)"),
  // Security — always required
  IP_HASH_SALT: z.string().min(32, "IP_HASH_SALT must be at least 32 chars — run: openssl rand -hex 32"),
  // Polar billing — optional until account is approved
  // TODO: change to z.string().min(10) after Polar approval
  POLAR_WEBHOOK_SECRET:          optionalStr(10),
  POLAR_CHECKOUT_URL_CREATOR:    optionalStr(10),
  POLAR_CHECKOUT_URL_SCALE:      optionalStr(10),
  POLAR_CHECKOUT_URL_ENTERPRISE: optionalStr(10),
  POLAR_CHECKOUT_URL_LIFETIME:   optionalStr(10),
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

  // Warn (don't crash) when Polar billing vars are absent
  const polarVars = [
    "POLAR_WEBHOOK_SECRET",
    "POLAR_CHECKOUT_URL_CREATOR",
    "POLAR_CHECKOUT_URL_SCALE",
    "POLAR_CHECKOUT_URL_ENTERPRISE",
    "POLAR_CHECKOUT_URL_LIFETIME",
  ] as const;
  const missingPolar = polarVars.filter((k) => !process.env[k]);
  if (missingPolar.length) {
    console.warn(
      `[env] ⚠️  Polar billing vars not set (billing disabled until approved):\n` +
        missingPolar.map((k) => `  • ${k}`).join("\n")
    );
  }

  _validated = true;
}

/**
 * GET /api/health
 *
 * Lightweight health check endpoint for:
 *  - PM2 process monitoring
 *  - Docker HEALTHCHECK instruction
 *  - Load balancer / reverse-proxy liveness probes
 *  - Uptime monitoring services (UptimeRobot, BetterStack, etc.)
 *
 * Returns 200 OK with a JSON body. No auth required.
 * Add to your VPS Docker config:
 *   HEALTHCHECK CMD curl -f http://localhost:3000/api/health || exit 1
 */
export async function GET() {
  return Response.json({
    status: "ok",
    ts: Date.now(),
    version: process.env.npm_package_version ?? "unknown",
  });
}

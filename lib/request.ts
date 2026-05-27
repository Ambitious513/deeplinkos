export function getRequestOrigin(request: Request) {
  const forwardedHostHeader = request.headers.get("x-forwarded-host");
  const forwardedHost = forwardedHostHeader ? forwardedHostHeader.split(",")[0].trim() : null;
  const forwardedProto = (request.headers.get("x-forwarded-proto") || "https").split(",")[0].trim();

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "")
    .split(",")[0]
    .trim()
    .replace(/\/+$/, "");

  if (siteUrl) {
    return siteUrl;
  }

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return new URL(request.url).origin;
}

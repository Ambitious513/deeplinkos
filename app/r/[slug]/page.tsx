import { redirect } from "next/navigation";
import { getLink } from "@/lib/links";
import { headers } from "next/headers";
import { resolveDestination } from "@/lib/routing";

export default async function DeepLinkRedirectPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const record = await getLink(slug);

  if (!record) {
    redirect("/missing");
  }

  const userAgent = (await headers()).get("user-agent");
  const destination = resolveDestination(record, userAgent);

  if (!destination) {
    redirect("/missing");
  }

  // Deep linking fallback for when the native app fails to open
  const fallback = record.desktopUrl || "/";

  return (
    <div className="container" style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <h1 className="hero__h1" style={{ fontSize: "2rem", marginBottom: "1rem" }}>Redirecting...</h1>
      <p style={{ color: "var(--text-2)", marginBottom: "2rem" }}>Opening your link in the app.</p>
      
      {/* 
        A generic HTTP 307 redirect doesn't reliably open native apps inside an in-app webview
        like Facebook, Instagram, or TikTok. Instead, we render a minimal HTML page that forces
        the device to invoke the URI scheme via JavaScript.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.onload = function() {
              window.location.replace("${destination.destination}");
              setTimeout(function() {
                // If the OS cannot open the native app, fallback to the web/store URL after 2.5 seconds
                window.location.replace("${fallback}");
              }, 2500);
            }
          `
        }}
      />
    </div>
  );
}

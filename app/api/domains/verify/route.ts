import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import dns from "dns/promises";

const EXPECTED_CNAME = "deeplinkos.com";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let domainId: string;
  try {
    const body = await req.json();
    domainId = body.domainId;
    if (!domainId) throw new Error("Missing domainId");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Fetch domain and verify ownership
  const { data: domain } = await supabase
    .from("domains")
    .select("id, domain_name, status, user_id")
    .eq("id", domainId)
    .single();

  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  if (domain.user_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (domain.status === "active") {
    return NextResponse.json({ verified: true, message: "Domain is already verified." });
  }

  // Perform CNAME check
  try {
    const records = await dns.resolveCname(domain.domain_name);
    const matched = records.some(
      (r) => r.toLowerCase().replace(/\.$/, "") === EXPECTED_CNAME
    );

    if (matched) {
      await supabase
        .from("domains")
        .update({ status: "active" })
        .eq("id", domainId);

      return NextResponse.json({
        verified: true,
        message: `✓ DNS verified! ${domain.domain_name} is now active.`,
      });
    } else {
      return NextResponse.json({
        verified: false,
        message: `CNAME found but points to "${records[0]}" instead of "${EXPECTED_CNAME}". Please check your DNS settings.`,
        records,
      });
    }
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return NextResponse.json({
        verified: false,
        message: `No CNAME record found for "${domain.domain_name}". DNS changes can take up to 48 hours to propagate.`,
      });
    }
    return NextResponse.json({
      verified: false,
      message: "DNS lookup failed. Please try again in a few minutes.",
    });
  }
}

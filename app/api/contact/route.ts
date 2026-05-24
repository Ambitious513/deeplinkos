import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/* ─────────────────────────────────────────────────────────────────────────────
   DeepLinkOS — Contact Form API
   Phase 2: Sends email via Resend.
   Phase 3 TODO: Insert row into Supabase `contact_submissions` table first,
                 then let n8n webhook (triggered by Supabase insert) handle
                 the email notification instead of calling Resend here directly.
   ───────────────────────────────────────────────────────────────────────────── */

/* Lazy-initialize so the server doesn't crash when RESEND_API_KEY is not yet set */
let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const CONTACT_EMAIL  = process.env.CONTACT_EMAIL  ?? "contact@deeplinkos.com";
const FROM_ADDRESS   = process.env.RESEND_FROM    ?? "DeepLinkOS <noreply@deeplinkos.com>";

/* Simple rate-limit map: IP → { count, windowStart }
   Limits each IP to 3 submissions per 10 minutes in-memory.
   Phase 3: swap for Redis / Supabase rate-limit table. */
const rateLimit = new Map<string, { count: number; windowStart: number }>();
const LIMIT     = 3;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function isRateLimited(ip: string): boolean {
  const now  = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimit.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= LIMIT) return true;
  entry.count++;
  return false;
}

function sanitize(str: string, maxLen: number): string {
  return str.trim().replace(/<[^>]*>/g, "").slice(0, maxLen);
}

export async function POST(req: NextRequest) {
  /* ── Rate limiting ──────────────────────────────────────────────── */
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  /* ── Parse body ─────────────────────────────────────────────────── */
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name    = sanitize(body.name    ?? "", 120);
  const email   = sanitize(body.email   ?? "", 254);
  const subject = sanitize(body.subject ?? "", 200);
  const message = sanitize(body.message ?? "", 5000);

  /* ── Server-side validation ─────────────────────────────────────── */
  const errors: Record<string, string> = {};
  if (!name)                                errors.name    = "Full name is required.";
  if (!email)                               errors.email   = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email address.";
  if (!subject)                             errors.subject = "Subject is required.";
  if (!message)                             errors.message = "Message cannot be empty.";
  else if (message.length < 10)             errors.message = "Message must be at least 10 characters.";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  /* ── Phase 3 TODO: Supabase insert ─────────────────────────────────
     const { error: dbError } = await supabase
       .from("contact_submissions")
       .insert({ name, email, subject, message, created_at: new Date().toISOString() });
     if (dbError) console.error("Supabase insert failed:", dbError);
     (n8n webhook fires automatically on INSERT and handles email notification)
  ─────────────────────────────────────────────────────────────────── */

  /* ── Check Resend is configured ─────────────────────────────────── */
  const resend = getResend();
  if (!resend) {
    console.error("[contact] RESEND_API_KEY is not set. Email not sent.");
    return NextResponse.json(
      { error: "Email service is not configured. Please try again later." },
      { status: 503 }
    );
  }

  /* ── Send email via Resend ──────────────────────────────────────── */
  try {
    const { error } = await resend.emails.send({
      from:    FROM_ADDRESS,
      to:      CONTACT_EMAIL,
      replyTo: email,
      subject: `[DeepLinkOS Contact] ${subject}`,
      text: [
        `New contact form submission from DeepLinkOS`,
        ``,
        `Name:    ${name}`,
        `Email:   ${email}`,
        `Subject: ${subject}`,
        ``,
        `Message:`,
        message,
        ``,
        `---`,
        `Reply directly to this email to respond to ${name}.`,
      ].join("\n"),
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#0d1117;color:#e6edf3;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#161b22;border:1px solid #30363d;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#3b82f6,#06b6d4);padding:28px 32px;">
            <p style="margin:0;font-size:13px;font-weight:700;color:rgba(255,255,255,.75);letter-spacing:.08em;text-transform:uppercase;">
              DeepLinkOS
            </p>
            <h1 style="margin:6px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-.03em;">
              New Contact Message
            </h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:20px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#8b949e;text-transform:uppercase;letter-spacing:.08em;">From</p>
                  <p style="margin:0;font-size:15px;font-weight:700;color:#e6edf3;">${name}</p>
                  <p style="margin:2px 0 0;font-size:13px;color:#58a6ff;">${email}</p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:20px;border-top:1px solid #30363d;padding-top:20px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#8b949e;text-transform:uppercase;letter-spacing:.08em;">Subject</p>
                  <p style="margin:0;font-size:15px;font-weight:600;color:#e6edf3;">${subject}</p>
                </td>
              </tr>
              <tr>
                <td style="border-top:1px solid #30363d;padding-top:20px;">
                  <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#8b949e;text-transform:uppercase;letter-spacing:.08em;">Message</p>
                  <div style="background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:16px 18px;">
                    <p style="margin:0;font-size:14px;line-height:1.75;color:#c9d1d9;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #30363d;">
            <p style="margin:0;font-size:12px;color:#8b949e;line-height:1.6;">
              Reply directly to this email to respond to ${name}.<br />
              Sent from the DeepLinkOS contact form at deeplinkos.com/contact
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    if (error) {
      console.error("[contact] Resend API error:", error);
      return NextResponse.json(
        { error: "Failed to send your message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

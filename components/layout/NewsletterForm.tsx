"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to your email provider (Resend, ConvertKit, etc.)
    setStatus("done");
    setEmail("");
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit} aria-label="Newsletter signup">
      {status === "done" ? (
        <p className="newsletter-success">
          ✓ You&apos;re in — first playbook lands in your inbox shortly.
        </p>
      ) : (
        <>
          <input
            type="email"
            className="newsletter-input"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address"
          />
          <button type="submit" className="newsletter-btn">
            Subscribe
          </button>
        </>
      )}
    </form>
  );
}

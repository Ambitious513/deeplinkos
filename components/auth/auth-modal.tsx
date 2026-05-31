"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  if (!isOpen) return null;

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Relative path — stays on deeplinkos.com no matter what
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setLoading(false);
    if (error) {
      setMessage("Error sending link. Please try again.");
    } else {
      setMessage("✓ Check your email for the magic link!");
    }
  }

  return (
    <div
      className="modal-overlay open"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content" style={{ maxWidth: '420px', width: '100%', padding: '40px 32px', textAlign: 'center', position: 'relative', borderRadius: '16px' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-2)' }}
        >
          &times;
        </button>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>✉️</div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '10px', letterSpacing: '-0.02em', background: 'var(--grad-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Sign In
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: '14px', lineHeight: '1.6' }}>
            Enter your email and we&apos;ll send you a magic link to sign in instantly — no password needed.
          </p>
        </div>

        {/* Google One Tap hint */}
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--blue-dim)', border: '1px solid var(--blue-hi)', marginBottom: '24px', fontSize: '13px', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>Google sign-in? Look for the prompt that appears at the top of your browser.</span>
        </div>

        <form onSubmit={handleMagicLink} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'block', color: 'var(--text)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '14px', borderRadius: '10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--text)', fontSize: '15px', outline: 'none' }}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', color: '#fff', background: 'var(--grad)', opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Sending Magic Link..." : "Send Magic Link →"}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: '20px', padding: '14px', borderRadius: '10px', background: message.includes('Error') ? 'var(--red-dim)' : 'var(--emerald-dim)', color: message.includes('Error') ? 'var(--red)' : 'var(--emerald-hi)', fontSize: '14px', fontWeight: 500, textAlign: 'center' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  if (!isOpen) return null;

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setLoading(false);
    if (error) {
      setMessage("Error sending link. Please try again.");
    } else {
      setMessage("Check your email for the magic link!");
    }
  }

  return (
    <div className="modal-overlay open" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '420px', width: '100%', padding: '40px 32px', textAlign: 'center', position: 'relative', borderRadius: '16px' }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-2)', transition: 'color 0.2s' }}
        >
          &times;
        </button>
        
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.02em', background: 'var(--grad-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '15px', lineHeight: '1.5' }}>Sign in to access your pro analytics and manage custom domains.</p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-card)',
            background: 'var(--bg-card)', color: 'var(--text)', fontWeight: 600, fontSize: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer',
            transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)', marginBottom: '28px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path></svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0', color: 'var(--text-2)' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        <form onSubmit={handleMagicLink} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block', color: 'var(--text)' }}>Email Address</label>
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
            style={{ width: '100%', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, border: 'none', cursor: 'pointer', color: '#fff', background: 'var(--grad)' }}
            disabled={loading}
          >
            {loading ? "Sending Magic Link..." : "Continue with Email"}
          </button>
        </form>

        {message && (
          <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', background: message.includes('Error') ? 'var(--red-dim)' : 'var(--emerald-dim)', color: message.includes('Error') ? 'var(--red)' : 'var(--emerald-hi)', fontSize: '14px', fontWeight: 500 }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import isDisposableEmail from "is-disposable-email";

export function AuthModal({
  isOpen,
  onClose,
  defaultSignUp = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultSignUp?: boolean;
}) {
  const [isSignUp, setIsSignUp] = useState(defaultSignUp);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  if (!isOpen) return null;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.split(",")[0].trim().replace(/\/+$/, "") ||
    window.location.origin;

  function reset() {
    setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setMessage("");
  }

  function switchMode() { setIsSignUp((v) => !v); reset(); }

  async function handleGoogleAuth() {
    setGoogleLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${siteUrl}/auth/callback` },
    });
    setGoogleLoading(false);
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMessage("");
    if (isSignUp) {
      if (isDisposableEmail(email)) {
        setMessage("Error: Please use a genuine personal or business email address.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          data: { first_name: firstName, last_name: lastName },
        },
      });
      setMessage(error ? `Error: ${error.message}` : "Check your email to confirm your account.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(`Error: ${error.message}`);
      else window.location.href = "/dashboard";
    }
    setLoading(false);
  }

  /* ── Shared styles ── */
  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 9, boxSizing: "border-box",
    background: "var(--input-bg, rgba(0,0,0,.04))",
    border: "1.5px solid var(--input-border, rgba(0,0,0,.1))",
    color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit",
  };
  const lbl: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: ".06em",
    textTransform: "uppercase", color: "var(--text-2)",
    display: "block", marginBottom: 4,
  };

  return (
    <div
      className="modal-overlay open"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--bg-card, #fff)", borderRadius: 20,
        width: "min(440px, 94vw)", padding: "28px 28px 24px",
        position: "relative", border: "1px solid var(--border-card, rgba(0,0,0,.08))",
        boxShadow: "0 24px 80px rgba(0,0,0,.18)",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 14, background: "none", border: "none",
          fontSize: 20, cursor: "pointer", color: "var(--text-2)", lineHeight: 1,
          width: 28, height: 28, display: "flex", alignItems: "center",
          justifyContent: "center", borderRadius: 6,
        }}>×</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 26, marginBottom: 6 }}>{isSignUp ? "👋" : "🔐"}</div>
          <h2 style={{
            fontSize: 20, fontWeight: 800, margin: "0 0 5px", letterSpacing: "-0.03em",
            background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 13, margin: 0 }}>
            {isSignUp ? "Join thousands creating smart deep links." : "Sign in to access your dashboard."}
          </p>
        </div>

        {/* Google */}
        <button onClick={handleGoogleAuth} disabled={googleLoading} style={{
          width: "100%", padding: "11px 16px", borderRadius: 10, marginBottom: 16,
          border: "1.5px solid var(--border, rgba(0,0,0,.12))",
          background: "var(--bg-card, #fff)", color: "var(--text)",
          fontSize: 14, fontWeight: 600, cursor: googleLoading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
          opacity: googleLoading ? 0.7 : 1, fontFamily: "inherit",
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border, rgba(0,0,0,.1))" }} />
          <span style={{ fontSize: 11, color: "var(--text-3, #aaa)", fontWeight: 600 }}>or continue with email</span>
          <div style={{ flex: 1, height: 1, background: "var(--border, rgba(0,0,0,.1))" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {isSignUp && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label style={lbl}>First Name</label>
                <input style={inp} placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <label style={lbl}>Last Name</label>
                <input style={inp} placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
          )}
          <div>
            <label style={lbl}>Email Address</label>
            <input type="email" style={inp} placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={lbl}>Password</label>
            <input type="password" style={inp} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
            color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.75 : 1, fontFamily: "inherit", marginTop: 2,
          }}>
            {loading ? "Processing…" : isSignUp ? "Create Account →" : "Sign In →"}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: 12, padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500,
            background: message.includes("Error") ? "rgba(239,68,68,.08)" : "rgba(16,185,129,.08)",
            color: message.includes("Error") ? "#ef4444" : "#10b981",
            border: `1px solid ${message.includes("Error") ? "rgba(239,68,68,.2)" : "rgba(16,185,129,.2)"}`,
          }}>
            {message}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--text-2)" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={switchMode} style={{
            background: "none", border: "none", color: "#3b82f6",
            fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 13, fontFamily: "inherit",
          }}>
            {isSignUp ? "Sign In" : "Sign Up Free"}
          </button>
        </div>
      </div>
    </div>
  );
}

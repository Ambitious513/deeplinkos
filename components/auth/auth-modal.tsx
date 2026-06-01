"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

  function reset() {
    setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setMessage("");
  }

  function switchMode() {
    setIsSignUp((v) => !v);
    reset();
  }

  async function handleGoogleAuth() {
    setGoogleLoading(true);
    // Use env var first, fall back to window.location.origin
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.split(",")[0].trim().replace(/\/+$/, "")
      || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${siteUrl}/auth/callback` },
    });
    setGoogleLoading(false);
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { first_name: firstName, last_name: lastName },
        },
      });
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Account created! Please check your email to confirm your account.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        window.location.href = "/dashboard";
      }
    }
    setLoading(false);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 14px", borderRadius: 10,
    background: "var(--input-bg, rgba(0,0,0,.04))",
    border: "1.5px solid var(--input-border, rgba(0,0,0,.1))",
    color: "var(--text)", fontSize: 15, outline: "none", boxSizing: "border-box",
    transition: "border-color .15s", fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase",
    color: "var(--text-2)", display: "block", marginBottom: 6,
  };

  return (
    <div
      className="modal-overlay open"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--bg-card, #fff)", borderRadius: 20, width: "min(460px, 94vw)",
        padding: "36px 32px", position: "relative",
        border: "1px solid var(--border-card, rgba(0,0,0,.08))",
        boxShadow: "0 24px 80px rgba(0,0,0,.18)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, background: "none", border: "none",
          fontSize: 22, cursor: "pointer", color: "var(--text-2)", lineHeight: 1,
          width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 8,
        }}>×</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>{isSignUp ? "👋" : "🔐"}</div>
          <h2 style={{
            fontSize: 22, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.03em",
            background: "var(--grad-text, linear-gradient(135deg,#3b82f6,#06b6d4))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, margin: 0, lineHeight: 1.5 }}>
            {isSignUp
              ? "Join thousands creating smart deep links."
              : "Sign in to access your dashboard."}
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleAuth}
          disabled={googleLoading}
          style={{
            width: "100%", padding: "13px 16px", borderRadius: 12,
            border: "1.5px solid var(--border, rgba(0,0,0,.12))",
            background: "var(--bg-card, #fff)", color: "var(--text)", fontSize: 15, fontWeight: 600,
            cursor: googleLoading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginBottom: 20, transition: "all .15s", opacity: googleLoading ? 0.7 : 1,
            fontFamily: "inherit",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {googleLoading ? "Connecting…" : `Continue with Google`}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "var(--border, rgba(0,0,0,.1))" }} />
          <span style={{ fontSize: 12, color: "var(--text-3, #aaa)", fontWeight: 600, whiteSpace: "nowrap" }}>
            or continue with email
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border, rgba(0,0,0,.1))" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isSignUp && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  style={inputStyle} placeholder="John"
                  value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  style={inputStyle} placeholder="Doe"
                  value={lastName} onChange={(e) => setLastName(e.target.value)} required
                />
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email" style={inputStyle} placeholder="name@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password" style={inputStyle} placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: 12, border: "none",
              background: "var(--grad, linear-gradient(135deg,#3b82f6,#06b6d4))",
              color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1, transition: "opacity .15s",
              letterSpacing: "-0.01em", fontFamily: "inherit",
            }}
          >
            {loading ? "Processing…" : isSignUp ? "Create Account →" : "Sign In →"}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: 16, padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500,
            background: message.includes("Error") ? "rgba(239,68,68,.08)" : "rgba(16,185,129,.08)",
            color: message.includes("Error") ? "#ef4444" : "#10b981",
            border: `1px solid ${message.includes("Error") ? "rgba(239,68,68,.2)" : "rgba(16,185,129,.2)"}`,
          }}>
            {message}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-2)" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={switchMode}
            style={{
              background: "none", border: "none", color: "var(--blue, #3b82f6)",
              fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 14, fontFamily: "inherit",
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up Free"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const router  = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter both your first and last name.");
      return;
    }
    setLoading(true);
    setError("");

    const { data, error: authErr } = await supabase.auth.updateUser({
      data: { first_name: firstName.trim(), last_name: lastName.trim() },
    });

    if (authErr || !data.user) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    await supabase.from("profiles").upsert({
      id:         data.user.id,
      first_name: firstName.trim(),
      last_name:  lastName.trim(),
      updated_at: new Date().toISOString(),
    });

    router.push("/dashboard");
  }

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1.5px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    fontSize: 15,
    outline: "none",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  };

  const lbl: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.7)",
    display: "block",
    marginBottom: 6,
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2944 100%)",
      padding: "24px 16px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Background orbs */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0,
      }}>
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: "60vw", height: "60vw", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-10%",
          width: "50vw", height: "50vw", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 32px rgba(59,130,246,0.4)",
          }}>
            <span style={{ fontSize: 28 }}>🔗</span>
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, color: "#fff",
            margin: "0 0 8px", letterSpacing: "-0.03em",
          }}>
            One last step
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>
            Tell us your name to personalize your dashboard.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 24,
          padding: "32px 28px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Name row — stacks on very small screens */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
              <div>
                <label style={lbl}>First Name</label>
                <input
                  style={inp}
                  type="text"
                  placeholder="Jane"
                  value={firstName}
                  autoComplete="given-name"
                  autoFocus
                  onChange={e => setFirstName(e.target.value)}
                  onFocus={e => (e.target.style.borderColor = "rgba(59,130,246,0.8)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
                  required
                />
              </div>
              <div>
                <label style={lbl}>Last Name</label>
                <input
                  style={inp}
                  type="text"
                  placeholder="Smith"
                  value={lastName}
                  autoComplete="family-name"
                  onChange={e => setLastName(e.target.value)}
                  onFocus={e => (e.target.style.borderColor = "rgba(59,130,246,0.8)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
                  required
                />
              </div>
            </div>

            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, fontSize: 13,
                background: "rgba(239,68,68,0.15)", color: "#fca5a5",
                border: "1px solid rgba(239,68,68,0.3)",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "15px",
                borderRadius: 12, border: "none",
                background: loading
                  ? "rgba(59,130,246,0.5)"
                  : "linear-gradient(135deg, #3b82f6, #06b6d4)",
                color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", marginTop: 4,
                boxShadow: loading ? "none" : "0 4px 20px rgba(59,130,246,0.4)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Setting up your account…" : "Continue to Dashboard →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          You can always change this later in your profile settings.
        </p>
      </div>
    </div>
  );
}

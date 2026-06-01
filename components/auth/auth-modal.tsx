"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();
  const router = useRouter();

  if (!isOpen) return null;

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Account created! You can now sign in (check email for confirmation if required by your Supabase settings).");
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Success! Redirecting to dashboard...");
        // Direct local redirect bypasses any Supabase email/oauth config
        window.location.href = '/dashboard';
      }
    }
    setLoading(false);
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
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔐</div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '10px', letterSpacing: '-0.02em', background: 'var(--grad-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: '14px', lineHeight: '1.6' }}>
            {isSignUp ? "Sign up to start creating powerful deep links." : "Welcome back! Enter your details to continue."}
          </p>
        </div>

        <form onSubmit={handleAuth} style={{ textAlign: 'left' }}>
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
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'block', color: 'var(--text)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-2)' }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setMessage(""); }}
            style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

        {message && (
          <div style={{ marginTop: '20px', padding: '14px', borderRadius: '10px', background: message.includes('Error') ? 'var(--red-dim)' : 'var(--emerald-dim)', color: message.includes('Error') ? 'var(--red)' : 'var(--emerald-hi)', fontSize: '14px', fontWeight: 500, textAlign: 'center' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

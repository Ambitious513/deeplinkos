"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Update auth user metadata
    const { data, error } = await supabase.auth.updateUser({
      data: { first_name: firstName, last_name: lastName }
    });

    if (!error && data.user) {
      // Also update the public.profiles table
      await supabase.from('profiles').update({
        first_name: firstName,
        last_name: lastName
      }).eq('id', data.user.id);
      
      router.push('/dashboard');
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="panel" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px', textAlign: 'center' }}>Complete Your Profile</h2>
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px' }}>Just one last step before you access the dashboard.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group-vertical">
            <label>First Name</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </div>
          <div className="input-group-vertical">
            <label>Last Name</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? "Saving..." : "Continue to Dashboard →"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CreateLinkModal } from "@/components/dashboard/create-link-modal";

export function DashboardHeader({ title = "Overview" }: { title?: string }) {
  const [theme, setTheme] = useState("light");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('dlos-theme') || 'light';
    setTheme(t);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('dlos-theme', newTheme);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <>
      <header className="dashboard-header">
          <div className="dashboard-title">{title}</div>
          <div className="dashboard-header-actions">
              <button className="theme-toggle" onClick={toggleTheme} title="Toggle Light/Dark Mode" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              </button>
              <button
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: '14px' }}
                onClick={() => setIsModalOpen(true)}
              >
                + Create Link
              </button>
              <div style={{ position: "relative" }}>
                <div 
                  className="profile-pic" 
                  onClick={() => {
                    const dd = document.getElementById("profile-dropdown");
                    if (dd) dd.style.display = dd.style.display === "none" ? "block" : "none";
                  }} 
                  title="Profile" 
                ></div>
                <div 
                  id="profile-dropdown"
                  style={{ 
                    display: "none", 
                    position: "absolute", 
                    top: "120%", 
                    right: 0, 
                    background: "var(--bg-card)", 
                    border: "1px solid var(--border)", 
                    borderRadius: "12px", 
                    padding: "8px",
                    minWidth: "160px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    zIndex: 100 
                  }}
                >
                  <button 
                    onClick={handleLogout}
                    style={{ 
                      width: "100%", 
                      textAlign: "left", 
                      padding: "10px 16px", 
                      background: "none", 
                      border: "none", 
                      color: "var(--red)", 
                      cursor: "pointer", 
                      fontSize: "14px",
                      fontWeight: 500,
                      borderRadius: "8px"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "var(--red-dim)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "none"}
                  >
                    Logout
                  </button>
                </div>
              </div>
          </div>
      </header>
      <CreateLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

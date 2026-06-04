"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CreateLinkModal } from "@/components/dashboard/create-link-modal";
import Link from "next/link";

type Profile = {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
};

function getInitials(profile: Profile): string {
  const first = (profile.first_name || "").trim();
  const last = (profile.last_name || "").trim();
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (profile.email) return profile.email.slice(0, 2).toUpperCase();
  return "?";
}

export function DashboardHeader({ title = "Overview" }: { title?: string }) {
  const [theme, setTheme] = useState("light");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    first_name: null, last_name: null, avatar_url: null, email: null,
  });
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("dlos-theme") || "light";
    setTheme(t);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user.id)
        .single();
      const meta = user.user_metadata ?? {};
      const avatarUrl =
        data?.avatar_url ||
        (meta.avatar_url as string | null) ||
        (meta.picture as string | null) ||
        null;
      const firstName =
        data?.first_name ||
        (meta.first_name as string | null) ||
        (meta.given_name as string | null) ||
        null;
      const lastName =
        data?.last_name ||
        (meta.last_name as string | null) ||
        (meta.family_name as string | null) ||
        null;
      setProfile({
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        email: user.email ?? null,
      });
    }
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const dd = document.getElementById("profile-dropdown");
      const trigger = document.getElementById("profile-trigger");
      if (dd && !dd.contains(e.target as Node) && !trigger?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("dlos-theme", newTheme);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    router.push("/");
  };

  const initials = getInitials(profile);
  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email || "Account";

  return (
    <>
      <header className="dashboard-header">
        {/* Mobile logo */}
        <Link href="/dashboard" className="mobile-logo" style={{ alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30, background: "var(--grad)", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 14, fontWeight: 800, flexShrink: 0,
          }}>D</div>
          <span style={{ fontWeight: 800, fontSize: 16, background: "var(--grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.03em" }}>DeepLinkOS</span>
        </Link>

        {/* Desktop title */}
        <div className="dashboard-title">{title}</div>

        <div className="dashboard-header-actions">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle theme"
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-2)", width: 38, height: 38, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
            }}
          >
            {theme === "dark" ? (
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            )}
          </button>

          {/* Create Link — desktop */}
          <button
            className="btn-primary header-create-btn-text"
            style={{ padding: "9px 20px", fontSize: 14, flexShrink: 0 }}
            onClick={() => setIsModalOpen(true)}
          >
            + Create Link
          </button>

          {/* Avatar + dropdown */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              id="profile-trigger"
              onClick={() => setDropdownOpen(v => !v)}
              className="avatar-circle"
              title="Profile"
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={initials} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} referrerPolicy="no-referrer" />
              ) : (
                <span>{initials}</span>
              )}
            </button>

            {dropdownOpen && (
              <div
                id="profile-dropdown"
                style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 14, padding: "6px", minWidth: 200,
                  boxShadow: "0 16px 48px rgba(0,0,0,0.18)", zIndex: 300,
                  animation: "fadeIn .15s ease",
                }}
              >
                {/* User info */}
                <div style={{ padding: "10px 14px 12px", borderBottom: "1px solid var(--border)", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{displayName}</div>
                  {profile.email && (
                    <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 2 }}>{profile.email}</div>
                  )}
                </div>
                <button
                  style={{ width: "100%", textAlign: "left", padding: "9px 14px", background: "none", border: "none", color: "var(--text)", cursor: "pointer", fontSize: 14, borderRadius: 9, display: "flex", alignItems: "center", gap: 10, fontWeight: 500 }}
                  onMouseOver={e => (e.currentTarget.style.background = "var(--blue-dim)")}
                  onMouseOut={e => (e.currentTarget.style.background = "none")}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  style={{ width: "100%", textAlign: "left", padding: "9px 14px", background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 14, borderRadius: 9, display: "flex", alignItems: "center", gap: 10, fontWeight: 600, marginTop: 2 }}
                  onMouseOver={e => (e.currentTarget.style.background = "var(--red-dim)")}
                  onMouseOut={e => (e.currentTarget.style.background = "none")}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <CreateLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

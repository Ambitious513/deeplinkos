"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    email: string | null;
  };
  onSaved: (updated: { first_name: string; last_name: string; avatar_url: string | null }) => void;
}

const XIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

export function ProfileModal({ isOpen, onClose, initialProfile, onSaved }: Props) {
  const [firstName, setFirstName] = useState(initialProfile.first_name || "");
  const [lastName, setLastName]   = useState(initialProfile.last_name  || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const { show: toast } = useToast();
  const supabase = createClient();

  if (!isOpen) return null;

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB.");
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext  = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Bust cache with timestamp
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update auth metadata
      await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name:  lastName.trim(),
          avatar_url: avatarUrl || null,
        },
      });

      // Upsert profiles table
      const { error: dbErr } = await supabase.from("profiles").upsert({
        id:         user.id,
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      });

      if (dbErr) throw dbErr;

      toast("Profile updated!", "success");
      onSaved({
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        avatar_url: avatarUrl || null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  const initials =
    (firstName[0] || "") + (lastName[0] || "") ||
    (initialProfile.email?.[0] || "?");

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, letterSpacing: ".05em",
    textTransform: "uppercase", color: "var(--text-2)",
    display: "block", marginBottom: 6,
  };

  return (
    <div
      className="modal-overlay open"
      onClick={onClose}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, width: "100%" }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Edit Profile</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-2)", display: "flex" }}
          >
            <XIcon />
          </button>
        </div>

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 24, fontWeight: 700, overflow: "hidden", flexShrink: 0,
          }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initials.toUpperCase()
            )}
          </div>
          <div>
            <label
              htmlFor="avatar-upload"
              style={{
                display: "inline-block", padding: "8px 16px", borderRadius: 8,
                background: "var(--blue-dim)", color: "var(--blue)",
                fontSize: 13, fontWeight: 600, cursor: uploading ? "wait" : "pointer",
                border: "1px solid transparent",
              }}
            >
              {uploading ? "Uploading…" : "Change Photo"}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarUpload}
              disabled={uploading}
              style={{ display: "none" }}
            />
            <p style={{ fontSize: 12, color: "var(--text-3)", margin: "6px 0 0" }}>
              JPG, PNG or WebP · Max 2 MB
            </p>
          </div>
        </div>

        {/* Name fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input
              className="input-field"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input
              className="input-field"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Email</label>
          <input
            className="input-field"
            value={initialProfile.email || ""}
            readOnly
            style={{ width: "100%", opacity: 0.6, cursor: "default" }}
          />
          <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
            Email cannot be changed here. Contact support if needed.
          </p>
        </div>

        {error && (
          <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 14 }}>{error}</p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary" style={{ flex: 2 }} disabled={saving || uploading}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

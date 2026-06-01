"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface LinkItem {
  id: string;
  title: string;
  slug: string;
  desktop_url: string | null;
  is_active: boolean;
  clickCount: number;
}

const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);

const CopyIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const ChartIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

export function LinksTable({ links: initialLinks, siteUrl }: { links: LinkItem[]; siteUrl: string }) {
  const [links, setLinks] = useState(initialLinks);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const filterActive = searchParams.get("filter") === "active";

  useEffect(() => { setLinks(initialLinks); }, [initialLinks]);

  // Click outside to cancel confirm
  useEffect(() => {
    if (!confirmId) return;
    const timer = setTimeout(() => setConfirmId(null), 4000);
    return () => clearTimeout(timer);
  }, [confirmId]);

  const filtered = links
    .filter((l) => !filterActive || l.is_active)
    .filter((l) =>
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.slug.toLowerCase().includes(search.toLowerCase()) ||
      (l.desktop_url && l.desktop_url.toLowerCase().includes(search.toLowerCase()))
    );

  async function handleDelete(link: LinkItem) {
    if (confirmId !== link.id) {
      setConfirmId(link.id);
      return;
    }
    setDeletingId(link.id);
    setConfirmId(null);
    try {
      const res = await fetch(`/api/links/${link.slug}`, { method: "DELETE" });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== link.id));
      }
    } catch {
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  async function copyShortUrl(e: React.MouseEvent, slug: string) {
    e.stopPropagation();
    await navigator.clipboard.writeText(`${siteUrl}/r/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  const shortBase = siteUrl.replace(/^https?:\/\//, "");

  return (
    <>
      <div className="panel-header">
        <div>
          <div className="panel-title">All Smart Links</div>
          {filterActive && (
            <div style={{ fontSize: 12, color: "var(--blue)", fontWeight: 600, marginTop: 2 }}>
              Showing: Active Links only{" "}
              <button
                onClick={() => router.push("/dashboard/links")}
                style={{
                  background: "none", border: "none", color: "var(--text-3)", fontSize: 12,
                  cursor: "pointer", textDecoration: "underline", fontFamily: "inherit",
                }}
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
        <div>
          <input
            type="text"
            className="input-field"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 200 }}
          />
        </div>
      </div>

      <div className="table-responsive">
        {filtered.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Link Name</th>
                <th>Short URL</th>
                <th>Destination</th>
                <th>Clicks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((link) => (
                <tr
                  key={link.id}
                  onClick={() => router.push(`/dashboard/links/${link.slug}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={{ fontWeight: 600 }}>{link.title}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="link-short" style={{ fontSize: 12 }}>
                        {shortBase}/r/{link.slug}
                      </span>
                      <button
                        title={copiedSlug === link.slug ? "Copied!" : "Copy short URL"}
                        onClick={(e) => copyShortUrl(e, link.slug)}
                        style={{
                          background: copiedSlug === link.slug ? "var(--blue-dim)" : "none",
                          border: "none", cursor: "pointer",
                          color: copiedSlug === link.slug ? "var(--blue)" : "var(--text-3)",
                          padding: "3px 4px", borderRadius: 4,
                          display: "flex", alignItems: "center", flexShrink: 0,
                          fontSize: 11,
                        }}
                      >
                        {copiedSlug === link.slug ? "✓" : <CopyIcon />}
                      </button>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      color: "var(--text-2)", maxWidth: 160, display: "inline-block",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {link.desktop_url ?? "—"}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{link.clickCount.toLocaleString()}</td>
                  <td>
                    <span
                      className={link.is_active ? "badge-active" : undefined}
                      style={!link.is_active ? {
                        padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                        background: "rgba(100,100,100,.1)", color: "var(--text-2)",
                      } : undefined}
                    >
                      {link.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <button
                        title="View Stats"
                        className="btn-secondary"
                        style={{ padding: "5px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}
                        onClick={() => router.push(`/dashboard/links/${link.slug}`)}
                      >
                        <ChartIcon /> Stats
                      </button>
                      <button
                        title={confirmId === link.id ? "Click again to confirm delete" : "Delete link"}
                        className="btn-secondary"
                        disabled={deletingId === link.id}
                        onClick={() => handleDelete(link)}
                        style={{
                          padding: "5px 10px", fontSize: 12,
                          display: "flex", alignItems: "center", gap: 5,
                          color: confirmId === link.id ? "#fff" : "#ef4444",
                          background: confirmId === link.id ? "#ef4444" : undefined,
                          borderColor: "rgba(239,68,68,.3)",
                          transition: "all .15s",
                          minWidth: confirmId === link.id ? 72 : undefined,
                          justifyContent: "center",
                        }}
                      >
                        {deletingId === link.id ? "…" : confirmId === link.id ? "Confirm?" : <TrashIcon />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "56px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔗</div>
            <p style={{ color: "var(--text-2)", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
              {links.length === 0 ? "No smart links yet" : "No links match your search"}
            </p>
            <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>
              {links.length === 0
                ? 'Click "+ Create Link" to get started'
                : "Try adjusting your search term"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

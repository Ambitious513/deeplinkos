"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LinkRecord } from "@/lib/types";
import {
  SearchIcon,
  CopyIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  LinksIcon,
} from "@/components/dashboard/icons";

type LinksManagerProps = {
  initialLinks: LinkRecord[];
  siteUrl: string;
};

type CreateState = {
  destinationUrl: string;
  title: string;
  campaign: string;
};

function shortUrl(siteUrl: string, slug: string) {
  return `${siteUrl.replace(/\/+$/, "")}/r/${slug}`;
}

function platformLabel(value: string) {
  if (!value) return "Smart";
  return value.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export function LinksManager({ initialLinks, siteUrl }: LinksManagerProps) {
  const router = useRouter();
  const [links, setLinks] = useState(initialLinks);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<CreateState>({ destinationUrl: "", title: "", campaign: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLinks = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return links;
    return links.filter((link) =>
      [link.title, link.slug, link.destinationUrl, link.preset, link.campaign]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [links, query]);

  async function createLink() {
    setError(null);
    setNotice(null);
    setIsCreating(true);

    const response = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destinationUrl: form.destinationUrl,
        title: form.title || undefined,
        campaign: form.campaign || undefined,
      }),
    });

    const payload = await response.json().catch(() => null);
    setIsCreating(false);

    if (!response.ok) {
      setError(payload?.error || "Unable to create link.");
      return;
    }

    setLinks((current) => [payload.link, ...current]);
    setForm({ destinationUrl: "", title: "", campaign: "" });
    setNotice(`Created ${payload.shortUrl || shortUrl(siteUrl, payload.link.slug)}`);
    router.refresh();
  }

  async function toggleLink(link: LinkRecord) {
    setError(null);
    setNotice(null);

    const response = await fetch(`/api/links/${link.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !link.isActive }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setError(payload?.error || "Unable to update link.");
      return;
    }

    setLinks((current) =>
      current.map((item) => (item.id === payload.link.id ? payload.link : item)),
    );
    router.refresh();
  }

  async function deleteLink(link: LinkRecord) {
    if (!window.confirm(`Delete "${link.title || link.slug}"? This cannot be undone.`)) return;
    setError(null);
    setNotice(null);

    const response = await fetch(`/api/links/${link.slug}`, { method: "DELETE" });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error || "Unable to delete link.");
      return;
    }

    setLinks((current) => current.filter((item) => item.id !== link.id));
    setNotice(`Deleted "${link.title || link.slug}"`);
    router.refresh();
  }

  async function copyLink(link: LinkRecord) {
    const value = shortUrl(siteUrl, link.slug);
    await navigator.clipboard.writeText(value);
    setCopiedId(link.id);
    setNotice(`Copied ${value}`);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="links-manager">
      {/* ── Create composer ─────────────────────────────────────── */}
      <div className="links-composer panel">
        <div>
          <div className="eyebrow">Create</div>
          <h3 style={{ margin: "6px 0 4px", fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}>
            Create a smart link
          </h3>
          <p style={{ color: "var(--text-soft)", fontSize: "0.9rem", margin: "0 0 16px", lineHeight: 1.6 }}>
            Paste any social, marketplace, affiliate, or app URL. DeepLinkOS will infer the platform and app routes.
          </p>
        </div>

        <div className="links-composer__grid">
          <div className="form-field">
            <label className="form-label" htmlFor="composer-dest-url">
              Destination URL <span style={{ color: "var(--red)" }}>*</span>
            </label>
            <input
              id="composer-dest-url"
              className="form-input"
              value={form.destinationUrl}
              onChange={(e) => setForm((f) => ({ ...f, destinationUrl: e.target.value }))}
              placeholder="https://amazon.com/dp/example"
              type="url"
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="composer-title">Title</label>
            <input
              id="composer-title"
              className="form-input"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Summer campaign"
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="composer-campaign">Campaign</label>
            <input
              id="composer-campaign"
              className="form-input"
              value={form.campaign}
              onChange={(e) => setForm((f) => ({ ...f, campaign: e.target.value }))}
              placeholder="launch-q3"
            />
          </div>
          <button
            className="btn btn-primary links-composer__submit"
            type="button"
            onClick={createLink}
            disabled={isCreating || !form.destinationUrl.trim()}
          >
            {isCreating ? "Creating…" : "Create link"}
          </button>
        </div>

        {error && <p className="links-manager__alert links-manager__alert--error">{error}</p>}
        {notice && <p className="links-manager__alert">{notice}</p>}
      </div>

      {/* ── Search toolbar ──────────────────────────────────────── */}
      <div className="links-toolbar">
        <label className="links-search" htmlFor="links-search-input">
          <SearchIcon aria-hidden />
          <input
            id="links-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, slug, campaign, platform…"
            aria-label="Search links"
          />
        </label>
        <div className="links-toolbar__meta">
          {filteredLinks.length} {filteredLinks.length === 1 ? "link" : "links"}
          {query && links.length !== filteredLinks.length && ` of ${links.length}`}
        </div>
      </div>

      {/* ── Links table ─────────────────────────────────────────── */}
      <div className="table-card links-table-card">
        <table className="table links-table">
          <thead>
            <tr>
              <th>Smart link</th>
              <th>Platform</th>
              <th>Status</th>
              <th>Destination</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLinks.map((link) => (
              <tr key={link.id}>
                <td>
                  <strong style={{ display: "block", fontSize: "0.9rem" }}>
                    {link.title || link.slug}
                  </strong>
                  <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--text-soft)" }}>
                    {shortUrl(siteUrl, link.slug)}
                  </span>
                </td>
                <td>
                  <span className="platform-badge">{platformLabel(link.preset)}</span>
                </td>
                <td>
                  <span className={`badge${link.isActive ? " badge--active" : " badge--paused"}`}>
                    <span className="badge-dot" />
                    {link.isActive ? "Active" : "Paused"}
                  </span>
                </td>
                <td>
                  <a
                    href={link.destinationUrl || link.desktopUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--text-soft)", fontSize: "0.82rem", display: "block", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    title={link.destinationUrl || link.desktopUrl || "No destination"}
                  >
                    {link.destinationUrl || link.desktopUrl || "No destination"}
                  </a>
                </td>
                <td>
                  <div className="links-actions" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn-table-action btn-table-action--primary"
                      onClick={() => void copyLink(link)}
                      aria-label={`Copy short URL for ${link.title || link.slug}`}
                      title="Copy short URL"
                    >
                      <CopyIcon />
                      {copiedId === link.id ? "Copied!" : "Copy"}
                    </button>
                    <button
                      type="button"
                      className="btn-table-action"
                      onClick={() => void toggleLink(link)}
                      aria-label={link.isActive ? `Pause ${link.title || link.slug}` : `Resume ${link.title || link.slug}`}
                      title={link.isActive ? "Pause link" : "Resume link"}
                    >
                      {link.isActive ? <PauseIcon /> : <PlayIcon />}
                      {link.isActive ? "Pause" : "Resume"}
                    </button>
                    <button
                      type="button"
                      className="btn-table-action btn-table-action--danger"
                      onClick={() => void deleteLink(link)}
                      aria-label={`Delete ${link.title || link.slug}`}
                      title="Delete link"
                    >
                      <TrashIcon />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredLinks.length && (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state__icon">
                      <LinksIcon />
                    </div>
                    <p className="empty-state__title">
                      {query ? "No links match your search" : "No links yet"}
                    </p>
                    <p className="empty-state__desc">
                      {query
                        ? `Try a different search term. Searching by title, slug, campaign, or platform.`
                        : "Create your first smart link using the form above."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

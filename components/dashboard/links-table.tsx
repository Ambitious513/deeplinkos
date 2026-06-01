"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LinkItem {
  id: string;
  title: string;
  slug: string;
  desktop_url: string | null;
  is_active: boolean;
  clickCount: number;
}

export function LinksTable({ links, siteUrl }: { links: LinkItem[]; siteUrl: string }) {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filteredLinks = links.filter(
    (link) =>
      link.title.toLowerCase().includes(search.toLowerCase()) ||
      link.slug.toLowerCase().includes(search.toLowerCase()) ||
      (link.desktop_url && link.desktop_url.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="panel-header">
        <div className="panel-title">All Smart Links</div>
        <div className="input-group">
          <input
            type="text"
            className="input-field"
            placeholder="Search links..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive">
        {filteredLinks.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Link Name</th>
                <th>Short URL</th>
                <th>Destination</th>
                <th>Total Clicks</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map((link) => (
                <tr 
                  key={link.id} 
                  onClick={() => router.push(`/dashboard/links/${link.slug}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={{ fontWeight: 500 }}>{link.title}</td>
                  <td>
                    <span className="link-short">
                      {siteUrl}/r/{link.slug}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        color: "var(--text-2)",
                        maxWidth: "150px",
                        display: "inline-block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {link.desktop_url ?? "—"}
                    </span>
                  </td>
                  <td>{link.clickCount.toLocaleString()}</td>
                  <td>
                    <span className="badge-active">
                      {link.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ padding: "4px 10px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/links/${link.slug}`);
                      }}
                    >
                      Stats
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            style={{
              padding: "48px 16px",
              textAlign: "center",
              color: "var(--text-2)",
              fontSize: "14px",
            }}
          >
            {links.length === 0
              ? "No links yet. Create your first smart link!"
              : "No links match your search."}
          </div>
        )}
      </div>
    </>
  );
}

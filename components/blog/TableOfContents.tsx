"use client";

import { useEffect, useRef, useState } from "react";
import type { TocHeading } from "@/lib/blog-mdx";

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Open by default on desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    if (!headings.length) return;
    observerRef.current?.disconnect();

    const targets = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    targets.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav
      aria-label="Table of contents"
      style={{
        borderRadius: 16,
        border: "1px solid var(--border, #e5e7eb)",
        background: "var(--surface, #fff)",
        overflow: "hidden",
        marginBottom: "2rem",
      }}
    >
      {/* Header / toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          fontWeight: 700,
          fontSize: "0.875rem",
          color: "var(--text, #111)",
          gap: 8,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Table of Contents
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.5,
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Collapsible list */}
      <div
        style={{
          maxHeight: isOpen ? 600 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <ol
          style={{
            listStyle: "none",
            margin: 0,
            padding: "4px 18px 16px",
            display: "grid",
            gap: 2,
          }}
        >
          {headings.map((h) => (
            <li
              key={h.id}
              style={{ paddingLeft: h.level === 3 ? "1.25rem" : 0 }}
            >
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(h.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    history.replaceState(null, "", `#${h.id}`);
                  }
                }}
                style={{
                  display: "block",
                  padding: "5px 8px",
                  borderRadius: 8,
                  fontSize: h.level === 3 ? "0.8rem" : "0.85rem",
                  fontWeight: activeId === h.id ? 700 : 500,
                  color: activeId === h.id
                    ? "var(--accent, #ef7a22)"
                    : "var(--text-muted, #6b7280)",
                  textDecoration: "none",
                  background: activeId === h.id
                    ? "var(--accent-soft, rgba(239,122,34,0.08))"
                    : "transparent",
                  transition: "all 0.15s ease",
                  borderLeft: h.level === 3
                    ? "2px solid var(--border, #e5e7eb)"
                    : "none",
                }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

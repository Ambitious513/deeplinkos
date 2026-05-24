"use client";

import { useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTocProps {
  items: TocItem[];
}

export function BlogToc({ items }: BlogTocProps) {
  const [open, setOpen] = useState(true);

  if (!items.length) return null;

  return (
    <nav
      className="blog-toc"
      aria-label="Table of contents"
      id="blog-toc"
    >
      <button
        className={`blog-toc__toggle${open ? " is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="blog-toc-list"
        id="blog-toc-toggle"
      >
        <span className="blog-toc__title">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M2 4h11M2 7.5h8M2 11h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Table of Contents
        </span>
        <span className="blog-toc__chevron" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <ol className="blog-toc__list" id="blog-toc-list" role="list">
          {items.map((item) => (
            <li
              key={item.id}
              className={`blog-toc__item blog-toc__item--h${item.level}`}
              role="listitem"
            >
              <a
                href={`#${item.id}`}
                className="blog-toc__link"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}

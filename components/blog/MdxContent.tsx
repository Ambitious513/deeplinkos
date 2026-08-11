"use client";

import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Reads the language label from a code element's className (e.g. "language-json" -> "json")
function getLanguageFromChildren(children: React.ReactNode): string | null {
  let lang: string | null = null;
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const cn = (child.props as { className?: string }).className ?? "";
      const match = cn.match(/language-(\w+)/);
      if (match) lang = match[1];
    }
  });
  return lang;
}

// Human-readable language labels
const LANG_LABELS: Record<string, string> = {
  json:       "JSON",
  javascript: "JavaScript",
  js:         "JavaScript",
  typescript: "TypeScript",
  ts:         "TypeScript",
  kotlin:     "Kotlin",
  swift:      "Swift",
  xml:        "XML",
  html:       "HTML",
  bash:       "Bash",
  shell:      "Shell",
  sh:         "Shell",
  css:        "CSS",
  python:     "Python",
  py:         "Python",
};

// ── Heading with anchor ───────────────────────────────────────────────────────

function AnchorHeading({ level, children }: { level: 2 | 3 | 4; children: React.ReactNode }) {
  const id = slugify(String(children));
  const Tag = `h${level}` as "h2" | "h3" | "h4";
  return (
    <Tag id={id} style={{ scrollMarginTop: "6rem" }}>
      <a href={`#${id}`} style={{ color: "inherit", textDecoration: "none" }} aria-label={`Link to section: ${String(children)}`}>
        {children}
      </a>
    </Tag>
  );
}

// ── Code block (pre) ─────────────────────────────────────────────────────────
// Three visual treatments:
//   1. Named language (json, kotlin, swift…) → dark editor card with language badge
//   2. Plain text (no language tag, e.g. a URL or checklist) → light info card
//   3. Inline <code> (outside of pre) → orange pill

function CodeBlock({ children, ...rest }: React.HTMLAttributes<HTMLPreElement>) {
  const lang = getLanguageFromChildren(children);
  const label = lang ? (LANG_LABELS[lang] ?? lang.toUpperCase()) : null;

  // ── Named language block → dark editor card ──────────────────────────────
  if (label) {
    return (
      <div
        style={{
          margin: "1.75rem 0",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Language badge bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "#141926",
            padding: "0.45rem 1.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              background: "rgba(239,122,34,0.15)",
              color: "#ef7a22",
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "2px 8px",
              borderRadius: 4,
              fontFamily: "monospace",
            }}
          >
            {label}
          </span>
          <span style={{ flex: 1 }} />
          {/* Decorative traffic-light dots */}
          <span style={{ display: "flex", gap: 5 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
          </span>
        </div>
        {/* Code content */}
        <pre
          style={{
            background: "#1a2035",
            color: "#cdd6f4",
            padding: "1.25rem 1.5rem",
            overflowX: "auto",
            fontSize: "0.84rem",
            lineHeight: 1.8,
            margin: 0,
            fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
          }}
          {...rest}
        >
          {children}
        </pre>
      </div>
    );
  }

  // ── Plain text snippet (URL path, checklist, shell with no tag) → light card ──
  return (
    <div
      style={{
        margin: "1.25rem 0",
        borderRadius: 10,
        overflow: "hidden",
        border: "1.5px solid #dde5f0",
        background: "#f4f7fb",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#e8edf5",
          padding: "0.35rem 1rem",
          borderBottom: "1px solid #dde5f0",
        }}
      >
        {/* Small dots for visual rhythm */}
        {["#d1d5db", "#d1d5db", "#d1d5db"].map((c, i) => (
          <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <pre
        style={{
          margin: 0,
          padding: "0.9rem 1.25rem",
          overflowX: "auto",
          fontSize: "0.83rem",
          lineHeight: 1.7,
          color: "#334155",
          fontFamily: '"Fira Code", Consolas, monospace',
          background: "transparent",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        {...rest}
      >
        {children}
      </pre>
    </div>
  );
}

// ── Components map ────────────────────────────────────────────────────────────

const components = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <AnchorHeading level={2}>{props.children}</AnchorHeading>
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <AnchorHeading level={3}>{props.children}</AnchorHeading>
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <AnchorHeading level={4}>{props.children}</AnchorHeading>
  ),

  // Blockquote / callout
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      style={{
        borderLeft: "4px solid var(--accent, #ef7a22)",
        margin: "1.5rem 0",
        padding: "0.75rem 1.25rem",
        background: "rgba(239,122,34,0.06)",
        borderRadius: "0 12px 12px 0",
        color: "var(--text-muted, #6b7280)",
        fontStyle: "italic",
      }}
      {...props}
    />
  ),

  // Inline code — orange pill (only fires for standalone <code>, not inside <pre>)
  code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
    // Inside a pre block — return plain code element so CodeBlock handles styling
    if (className?.startsWith("language-")) {
      return <code className={className} style={{ fontFamily: "inherit", color: "inherit" }} {...props}>{children}</code>;
    }
    // Genuine inline code
    return (
      <code
        style={{
          background: "rgba(239,122,34,0.1)",
          borderRadius: 4,
          padding: "2px 6px",
          fontSize: "0.85em",
          fontFamily: '"Fira Code", Consolas, monospace',
          color: "var(--accent, #ef7a22)",
        }}
        {...props}
      >
        {children}
      </code>
    );
  },

  // Code block — smart detection of language vs plain text
  pre: CodeBlock,

  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong style={{ color: "var(--text, #111)", fontWeight: 700 }} {...props} />
  ),

  // Table
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div style={{ overflowX: "auto", margin: "1.5rem 0", borderRadius: 10, border: "1px solid var(--border, #e5e7eb)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }} {...props} />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      style={{
        background: "#f8f9fc",
        padding: "11px 16px",
        textAlign: "left",
        fontWeight: 700,
        borderBottom: "2px solid var(--border, #e5e7eb)",
        fontSize: "0.78rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#6b7280",
        whiteSpace: "nowrap",
      }}
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      style={{
        padding: "11px 16px",
        borderBottom: "1px solid var(--border, #e5e7eb)",
        verticalAlign: "top",
        lineHeight: 1.5,
      }}
      {...props}
    />
  ),

  hr: () => (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid var(--border, #e5e7eb)",
        margin: "2.5rem 0",
      }}
    />
  ),
};

// ── Export ────────────────────────────────────────────────────────────────────

export function MdxContent({ source }: { source: string }) {
  return (
    <div className="blog-mdx-body">
      <MDXRemote
        source={source}
        components={components as Parameters<typeof MDXRemote>[0]["components"]}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
      />
    </div>
  );
}

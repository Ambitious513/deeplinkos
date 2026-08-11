import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

// Custom heading components that inject anchor IDs matching the ToC
function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function AnchorHeading({
  level,
  children,
}: {
  level: 2 | 3 | 4;
  children: React.ReactNode;
}) {
  const id = slugify(String(children));
  const Tag = `h${level}` as "h2" | "h3" | "h4";
  return (
    <Tag id={id} style={{ scrollMarginTop: "6rem" }}>
      <a
        href={`#${id}`}
        style={{
          color: "inherit",
          textDecoration: "none",
        }}
        aria-label={`Link to section: ${String(children)}`}
      >
        {children}
      </a>
    </Tag>
  );
}

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
  // Styled blockquote
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
  // Inline code
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      style={{
        background: "var(--muted, #f3f4f6)",
        borderRadius: 6,
        padding: "2px 6px",
        fontSize: "0.85em",
        fontFamily: "monospace",
        color: "var(--accent, #ef7a22)",
      }}
      {...props}
    />
  ),
  // Code block
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <div
      style={{
        margin: "1.5rem 0",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}
    >
      <pre
        style={{
          background: "#1e2535",
          color: "#cdd6f4",
          padding: "1.25rem 1.5rem",
          overflowX: "auto",
          fontSize: "0.84rem",
          lineHeight: 1.75,
          margin: 0,
          fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
        }}
        {...props}
      />
    </div>
  ),
  // Callout-style strong
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong style={{ color: "var(--text, #111)", fontWeight: 700 }} {...props} />
  ),
  // Table
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div style={{ overflowX: "auto", margin: "1.5rem 0" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.875rem",
        }}
        {...props}
      />
    </div>
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      style={{
        background: "var(--muted, #f3f4f6)",
        padding: "10px 14px",
        textAlign: "left",
        fontWeight: 700,
        borderBottom: "2px solid var(--border, #e5e7eb)",
        fontSize: "0.8rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "var(--text-muted, #6b7280)",
      }}
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      style={{
        padding: "10px 14px",
        borderBottom: "1px solid var(--border, #e5e7eb)",
        verticalAlign: "top",
      }}
      {...props}
    />
  ),
  // Horizontal rule
  hr: () => (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid var(--border, #e5e7eb)",
        margin: "2rem 0",
      }}
    />
  ),
};

export function MdxContent({ source }: { source: string }) {
  return (
    <div className="blog-mdx-body">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        }}
      />
    </div>
  );
}

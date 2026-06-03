import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getPost, getAllSlugs } from "@/lib/blog";
import { BlogHeader } from "@/components/blog-header";
import { SiteFooter } from "@/components/site-footer";
import { BlogToc } from "@/components/blog-toc";
import { BlogFaq } from "@/components/blog-faq";
import { GoogleOneTap } from "@/components/google-one-tap";
import Link from "next/link";
import Image from "next/image";

/* ── Heading ID utilities ──────────────────────────────────────────── */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/* Heading components with anchor IDs */
const H2 = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 id={slugify(String(children))} {...props}>{children}</h2>
);
const H3 = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 id={slugify(String(children))} {...props}>{children}</h3>
);

/* Scrollable table wrapper (fixes mobile overflow) */
const Table = ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="table-scroll">
    <table {...props}>{children}</table>
  </div>
);

/* MDX component overrides */
const mdxComponents = {
  h2: H2,
  h3: H3,
  table: Table,
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="blog-callout" {...props}>{children}</blockquote>
  ),
  code: ({ children, className, ...props }: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
    /* Fenced code blocks have a className like "language-js" */
    if (className) return <code className={className} {...props}>{children}</code>;
    return <code className="blog-inline-code" {...props}>{children}</code>;
  },
};

/* MDX render options */
const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
};

/* ── Extract TOC ─────────────────────────────────────────────────── */
function extractToc(content: string) {
  const items: { id: string; text: string; level: number }[] = [];
  for (const line of content.split("\n")) {
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (m) items.push({ id: slugify(m[2]), text: m[2], level: m[1].length });
  }
  return items;
}

/* ── SSG params ─────────────────────────────────────────────────── */
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

/* ── Dynamic metadata ───────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title:       post.title,
    description: post.description,
    keywords:    post.keywords,
    alternates:  { canonical: `https://deeplinkos.com/blog/${slug}` },
    openGraph: {
      title:         post.title,
      description:   post.description,
      type:          "article",
      url:           `https://deeplinkos.com/blog/${slug}`,
      publishedTime: post.date,
      images:        [{ url: post.featuredImage, alt: post.featuredImageAlt }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       post.title,
      description: post.description,
      images:      [post.featuredImage],
    },
  };
}

/* ── Page ───────────────────────────────────────────────────────── */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const tocItems = extractToc(post.content);

  const articleSchema = {
    "@context":       "https://schema.org",
    "@type":          "BlogPosting",
    headline:         post.title,
    description:      post.description,
    datePublished:    post.date,
    dateModified:     post.date,
    author:           { "@type": "Organization", name: "DeepLinkOS", url: "https://deeplinkos.com" },
    publisher: {
      "@type": "Organization", name: "DeepLinkOS",
      logo: { "@type": "ImageObject", url: "https://deeplinkos.com/favicon.ico" },
    },
    image:            post.featuredImage,
    url:              `https://deeplinkos.com/blog/${slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://deeplinkos.com/blog/${slug}` },
    keywords:         post.keywords.join(", "),
  };

  const faqSchema = post.faq.length ? {
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: post.faq.map((f) => ({
      "@type":        "Question",
      name:           f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  return (
    <>
      <BlogHeader />
      <GoogleOneTap />

      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {faqSchema && (
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <main id="main-content" itemScope itemType="https://schema.org/BlogPosting">
        {/* Featured image hero */}
        <div className="post-hero">
          <Image
            src={post.featuredImage}
            alt={post.featuredImageAlt}
            className="post-hero__img"
            fill
            style={{ objectFit: 'cover' }}
            priority
            itemProp="image"
          />
          <div className="post-hero__overlay" aria-hidden="true" />
          <div className="post-hero__content">
            <div className="container container--sm">
              <span className="blog-tag" itemProp="articleSection">{post.category}</span>
              <h1 className="post-hero__h1" itemProp="headline">{post.title}</h1>
              <div className="post-hero__meta">
                <time dateTime={post.date} itemProp="datePublished">{post.formattedDate}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readTime} read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article layout */}
        <div className="post-layout container">
          <aside className="post-sidebar" aria-label="Article sidebar">
            <div className="post-sidebar__sticky">
              <BlogToc items={tocItems} />
              <Link href="/blog" className="post-back-btn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.7"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                All Articles
              </Link>
            </div>
          </aside>

          <article className="post-body" itemProp="articleBody">
            <p className="post-intro" itemProp="description">{post.description}</p>

            <div className="blog-prose">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={mdxOptions}
              />
            </div>

            {post.faq.length > 0 && <BlogFaq items={post.faq} />}

            <div className="post-footer-cta">
              <div className="post-footer-cta__inner">
                <p className="post-footer-cta__label">
                  Ready to create your first smart deep link?
                </p>
                <Link href="/#composer" className="btn-primary" id="post-try-free-btn">
                  Try DeepLinkOS Free, No Account Needed
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

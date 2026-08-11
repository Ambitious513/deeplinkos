import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { blogPosts } from "@/content/blog";
import { getMdxPostBySlug, getAllMdxPosts, extractHeadings } from "@/lib/blog-mdx";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { MdxContent } from "@/components/blog/MdxContent";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { RelatedPosts } from "@/components/blog/RelatedPosts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const staticSlugs = blogPosts.map((p) => ({ slug: p.slug }));
  const mdxSlugs    = getAllMdxPosts().map((p) => ({ slug: p.slug }));
  // Deduplicate
  const seen = new Set(staticSlugs.map((s) => s.slug));
  return [...staticSlugs, ...mdxSlugs.filter((s) => !seen.has(s.slug))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // MDX post takes priority
  const mdx = getMdxPostBySlug(slug);
  if (mdx) {
    return {
      title:       { absolute: mdx.seoTitle || mdx.title },
      description: mdx.seoDescription || mdx.description,
      alternates:  { canonical: `/blog/${slug}` },
      openGraph: {
        title:       mdx.seoTitle || mdx.title,
        description: mdx.seoDescription || mdx.description,
        url:         `https://deeplinkos.com/blog/${slug}`,
        type:        "article",
        publishedTime: mdx.publishedAt,
        authors:     [mdx.author],
        images:      mdx.image ? [{ url: cloudinaryUrl(mdx.image, { width: 1200 }), width: 1200, height: 630 }] : [],
      },
      twitter: {
        card:        "summary_large_image",
        title:       mdx.seoTitle || mdx.title,
        description: mdx.seoDescription || mdx.description,
        images:      mdx.image ? [cloudinaryUrl(mdx.image, { width: 1200 })] : [],
      },
    };
  }

  // Fallback to static data
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: { absolute: "Article Not Found | DeepLinkOS" } };

  return {
    title:       { absolute: post.seoTitle },
    description: post.seoDescription,
    alternates:  { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.seoTitle, description: post.seoDescription,
      url: `https://deeplinkos.com/blog/${slug}`, type: "article",
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const mdx = getMdxPostBySlug(slug);

  // ── Full MDX article ────────────────────────────────────────────────────────
  if (mdx) {
    const headings    = extractHeadings(mdx.content);
    const featuredImg = mdx.image ? cloudinaryUrl(mdx.image, { width: 1200, quality: 85 }) : null;
    const pubDate     = new Date(mdx.publishedAt).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@type":    "BlogPosting",
      headline:   mdx.title,
      description: mdx.description,
      image:      featuredImg ?? undefined,
      author:     { "@type": "Person", name: mdx.author },
      publisher:  { "@type": "Organization", name: "DeepLinkOS", url: "https://deeplinkos.com" },
      datePublished: mdx.publishedAt,
      mainEntityOfPage: `https://deeplinkos.com/blog/${slug}`,
    };

    return (
      <>
        <ReadingProgress />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

        <article className="blog-article-mdx">
          {/* Back link */}
          <div className="blog-article-mdx__back">
            <Link href="/blog" className="blog-back-link">
              ← Back to Growth Library
            </Link>
          </div>

          {/* Header */}
          <header className="blog-article-mdx__header">
            <div className="blog-article-mdx__meta-top">
              <span className="blog-eyebrow">{mdx.categoryLabel}</span>
              <span className="blog-article-mdx__dot" aria-hidden="true">·</span>
              <span className="blog-article-mdx__readtime">{mdx.readTime}</span>
            </div>
            <h1 className="blog-article-mdx__title">{mdx.title}</h1>
            <p className="blog-article-mdx__description">{mdx.description}</p>
            <div className="blog-article-mdx__byline">
              <span>{mdx.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={mdx.publishedAt}>{pubDate}</time>
            </div>
          </header>

          {/* Featured image */}
          {featuredImg && (
            <div className="blog-article-mdx__hero">
              <Image
                src={featuredImg}
                alt={mdx.title}
                width={1200}
                height={630}
                priority
                className="blog-article-mdx__hero-img"
              />
            </div>
          )}

          {/* Body: ToC + content */}
          <div className="blog-article-mdx__body">
            <TableOfContents headings={headings} />
            <div className="blog-article-mdx__prose">
              <MdxContent source={mdx.content} />
            </div>

            {/* Tags */}
            {mdx.tags.length > 0 && (
              <div className="blog-article-mdx__tags">
                {mdx.tags.map((tag) => (
                  <span key={tag} className="blog-article-mdx__tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Related posts */}
        <RelatedPosts
          currentSlug={slug}
          currentTags={mdx.tags}
          currentCategory={mdx.category}
        />
      </>
    );
  }

  // ── Static placeholder fallback ─────────────────────────────────────────────
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <article className="blog-article-placeholder">
      <div className="blog-article-placeholder-inner">
        <Link className="blog-back-link" href="/blog">Back to Growth Library</Link>
        <span className="blog-eyebrow">{post.categoryLabel}</span>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        <div className="blog-meta">
          <span>{post.author}</span>
          <span>{post.readTime}</span>
          <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
        <div className="blog-placeholder-card">
          Full article coming soon — we publish 3–4 new playbooks per week.
        </div>
      </div>
    </article>
  );
}

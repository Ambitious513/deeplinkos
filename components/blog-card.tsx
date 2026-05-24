import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

type BlogCardProps = Omit<BlogPost, "content" | "faq" | "keywords">;

export function BlogCard({
  slug,
  title,
  description,
  formattedDate,
  featuredImage,
  featuredImageAlt,
}: BlogCardProps) {
  return (
    <article className="blog-card" itemScope itemType="https://schema.org/BlogPosting">
      <Link href={`/blog/${slug}`} className="blog-card__img-link" tabIndex={-1} aria-hidden="true">
        <div className="blog-card__img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="blog-card__img"
            src={featuredImage}
            alt={featuredImageAlt}
            loading="lazy"
            itemProp="image"
          />
        </div>
      </Link>

      <div className="blog-card__body">
        <time
          dateTime={formattedDate}
          className="blog-card__date"
          itemProp="datePublished"
        >
          {formattedDate}
        </time>

        <h2 className="blog-card__title" itemProp="headline">
          <Link href={`/blog/${slug}`} itemProp="url">{title}</Link>
        </h2>

        <p className="blog-card__desc" itemProp="description">{description}</p>

        <Link
          href={`/blog/${slug}`}
          className="blog-card__cta"
          aria-label={`Read: ${title}`}
        >
          Read Article
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <path
              d="M2.5 6.5H10.5M7 3L10.5 6.5L7 10"
              stroke="currentColor" strokeWidth="1.7"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}

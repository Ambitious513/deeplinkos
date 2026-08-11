import Link from "next/link";
import { getAllMdxPosts } from "@/lib/blog-mdx";

type Props = {
  currentSlug: string;
  currentTags: string[];
  currentCategory: string;
};

export function RelatedPosts({ currentSlug, currentTags, currentCategory }: Props) {
  const all = getAllMdxPosts();

  // Score posts by tag overlap + same category, exclude current
  const scored = all
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      const sharedTags = p.tags.filter((t) => currentTags.includes(t)).length;
      const sameCategory = p.category === currentCategory ? 1 : 0;
      return { post: p, score: sharedTags * 2 + sameCategory };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.post);

  if (scored.length === 0) return null;

  return (
    <aside className="related-posts" aria-label="Related articles">
      <h2 className="related-posts-heading">Keep reading</h2>
      <div className="related-posts-grid">
        {scored.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="related-post-card"
          >
            <span className="related-post-category">{post.categoryLabel}</span>
            <h3 className="related-post-title">{post.title}</h3>
            <p className="related-post-excerpt">{post.description}</p>
            <span className="related-post-meta">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
              {post.readTime}
            </span>
          </Link>
        ))}
      </div>
    </aside>
  );
}

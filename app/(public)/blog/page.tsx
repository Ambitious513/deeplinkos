import type { Metadata } from "next";
import { BlogPageContent } from "@/components/blog/BlogPageContent";
import { blogPosts, type BlogPost } from "@/content/blog";
import { getAllMdxPosts } from "@/lib/blog-mdx";

export const metadata: Metadata = {
  title: { absolute: "DeepLinkOS Growth Library | Creator, Ecommerce & Mobile Growth Playbooks" },
  description:
    "Read practical growth playbooks for creators, ecommerce stores, founders, and mobile teams covering smart links, social traffic, QR codes, attribution, campaigns, and conversions.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "DeepLinkOS Growth Library",
    description:
      "Growth playbooks for creators, ecommerce stores, founders, and mobile teams covering conversion, attribution, smart links, lifecycle campaigns, and deep linking.",
    url: "https://deeplinkos.com/blog",
    images: ["/og/growth-library.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeepLinkOS Growth Library",
    description:
      "Growth playbooks for creators, ecommerce stores, founders, and mobile teams covering conversion, attribution, smart links, lifecycle campaigns, and deep linking.",
    images: ["/og/growth-library.svg"],
  },
};

// Convert MDX frontmatter to the BlogPost shape used by BlogPageContent
function mdxToBlogPost(mdx: ReturnType<typeof getAllMdxPosts>[number]): BlogPost {
  return {
    id:            `mdx_${mdx.slug}`,
    slug:          mdx.slug,
    title:         mdx.title,
    excerpt:       mdx.description,
    category:      mdx.category as BlogPost["category"],
    categoryLabel: mdx.categoryLabel,
    visual:        (mdx.category as BlogPost["visual"]) ?? "tutorials",
    tags:          mdx.tags.map((t) => ({ label: t })),
    author:        mdx.author,
    readTime:      mdx.readTime,
    publishedAt:   mdx.publishedAt,
    searchTerms:   mdx.searchTerms,
    seoTitle:      mdx.seoTitle,
    seoDescription: mdx.seoDescription,
    image:         mdx.image ?? null,
  };
}

export default function BlogPage() {
  const mdxPosts = getAllMdxPosts().map(mdxToBlogPost);

  const blogStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type":  "Blog",
        "@id":    "https://deeplinkos.com/blog#blog",
        url:      "https://deeplinkos.com/blog",
        name:     "DeepLinkOS Growth Library",
        description:
          "Growth playbooks for creators, ecommerce stores, founders, and mobile teams covering conversion, attribution, smart links, lifecycle campaigns, and deep linking.",
        blogPost: [...mdxPosts, ...blogPosts].map((post) => ({
          "@id": `https://deeplinkos.com/blog/${post.slug}`,
        })),
      },
      {
        "@type": "ItemList",
        "@id":   "https://deeplinkos.com/blog#posts",
        itemListElement: [...mdxPosts, ...blogPosts].map((post, index) => ({
          "@type":    "ListItem",
          position:   index + 1,
          url:        `https://deeplinkos.com/blog/${post.slug}`,
          name:       post.title,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogStructuredData) }}
      />
      <BlogPageContent mdxPosts={mdxPosts} />
    </>
  );
}

import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog-card";
import { BlogHeader } from "@/components/blog-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsletterForm } from "@/components/newsletter-form";
import { GoogleOneTap } from "@/components/google-one-tap";

export const metadata: Metadata = {
  title:       "Blog: Deep Linking Tips, Guides & News",
  description: "Expert guides on deep linking, smart links, mobile app routing, and tools for iOS, Android, and the web. Updated regularly by the DeepLinkOS team.",
  alternates:  { canonical: "https://deeplinkos.com/blog" },
  openGraph: {
    type:        "website",
    locale:      "en_US",
    siteName:    "DeepLinkOS",
    url:         "https://deeplinkos.com/blog",
    title:       "Blog: Deep Linking Guides & News | DeepLinkOS",
    description: "Expert guides on deep linking, smart links, and mobile app routing for iOS, Android, and the web.",
    images: [{
      url:    "/og-image.png",
      width:  1200,
      height: 630,
      alt:    "DeepLinkOS Blog: Deep Linking Guides and News",
    }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Blog: Deep Linking Guides & News | DeepLinkOS",
    description: "Expert guides on deep linking, smart links, and mobile app routing.",
    images:      ["/og-image.png"],
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <BlogHeader />
      <GoogleOneTap />

      <main id="main-content">
        {/* Hero */}
        <section className="blog-hero" aria-labelledby="blog-hero-heading">
          <div className="blog-hero__orb blog-hero__orb--1" aria-hidden="true" />
          <div className="blog-hero__orb blog-hero__orb--2" aria-hidden="true" />
          <div className="container">
            <div className="blog-hero__content">
              <span className="section-kicker">DeepLinkOS Blog</span>
              <h1 className="blog-hero__h1" id="blog-hero-heading">
                Deep Linking <span className="grad-text">Guides and News</span>
              </h1>
              <p className="blog-hero__sub">
                Tutorials, comparisons, and practical strategies for mobile developers,
                marketers, and growth teams working with deep links and smart URLs.
              </p>
            </div>
          </div>
        </section>

        {/* Posts grid */}
        <section className="section" aria-label="Blog posts">
          <div className="container">
            {posts.length === 0 ? (
              <div className="blog-empty">
                <p>No posts yet. Check back soon!</p>
              </div>
            ) : (
              <div
                className="blog-grid"
                role="list"
                aria-label="Blog articles"
              >
                {posts.map((post) => (
                  <div key={post.slug} role="listitem">
                    <BlogCard {...post} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter */}
        <section className="blog-newsletter section--alt" aria-labelledby="nl-heading">
          <div className="container container--sm">
            <div className="blog-newsletter__inner">
              <span className="section-kicker" style={{ justifyContent: "center" }}>
                Stay Updated
              </span>
              <h2 id="nl-heading" className="section-h2" style={{ textAlign: "center" }}>
                Deep linking tips, <span className="grad-text">straight to your inbox</span>
              </h2>
              <p style={{ textAlign: "center", color: "var(--text-2)", marginBottom: "2rem" }}>
                Join developers and marketers getting practical deep linking strategies. No spam, ever.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

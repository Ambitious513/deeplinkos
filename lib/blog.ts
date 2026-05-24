import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  formattedDate: string;
  category: string;
  readTime: string;
  featuredImage: string;
  featuredImageAlt: string;
  keywords: string[];
  faq: Array<{ question: string; answer: string }>;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getAllPosts(): Omit<BlogPost, "content">[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        title:            data.title        ?? "Untitled",
        description:      data.description  ?? "",
        date:             data.date         ?? "",
        formattedDate:    formatDate(data.date ?? new Date().toISOString()),
        category:         data.category     ?? "Deep Linking",
        readTime:         data.readTime     ?? "5 min",
        featuredImage:    data.featuredImage ?? "/images/blog/default.jpg",
        featuredImageAlt: data.featuredImageAlt ?? data.title ?? "Blog post image",
        keywords:         data.keywords     ?? [],
        faq:              data.faq          ?? [],
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw  = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title:            data.title        ?? "Untitled",
    description:      data.description  ?? "",
    date:             data.date         ?? "",
    formattedDate:    formatDate(data.date ?? new Date().toISOString()),
    category:         data.category     ?? "Deep Linking",
    readTime:         data.readTime     ?? "5 min",
    featuredImage:    data.featuredImage ?? "/images/blog/default.jpg",
    featuredImageAlt: data.featuredImageAlt ?? data.title ?? "",
    keywords:         data.keywords     ?? [],
    faq:              data.faq          ?? [],
    content,
  };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

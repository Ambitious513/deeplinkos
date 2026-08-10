import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogCategory } from "@/content/blog";

const POSTS_DIR = path.join(process.cwd(), "content", "blog", "posts");

// ── Types ─────────────────────────────────────────────────────────────────────

export type MdxFrontmatter = {
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  category: Exclude<BlogCategory, "all">;
  categoryLabel: string;
  tags: string[];
  image: string | null;
  readTime: string;
  seoTitle: string;
  seoDescription: string;
  searchTerms: string[];
};

export type MdxPostMeta = MdxFrontmatter & { slug: string };
export type MdxPost = MdxPostMeta & { content: string };

export type TocHeading = {
  level: 2 | 3;
  text: string;
  id: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseFrontmatter(data: Record<string, unknown>, slug: string): MdxFrontmatter {
  return {
    title:         String(data.title         ?? ""),
    description:   String(data.description   ?? ""),
    publishedAt:   String(data.publishedAt   ?? ""),
    author:        String(data.author        ?? "DeepLinkOS"),
    category:      (data.category as Exclude<BlogCategory, "all">) ?? "tutorials",
    categoryLabel: String(data.categoryLabel ?? "Tutorial"),
    tags:          Array.isArray(data.tags) ? (data.tags as string[]) : [],
    image:         data.image ? String(data.image) : null,
    readTime:      String(data.readTime      ?? "5 min read"),
    seoTitle:      String(data.seoTitle      ?? data.title ?? ""),
    seoDescription:String(data.seoDescription ?? data.description ?? ""),
    searchTerms:   Array.isArray(data.searchTerms) ? (data.searchTerms as string[]) : [slug],
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns all posts sorted newest-first. Safe to call from server components. */
export function getAllMdxPosts(): MdxPostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw  = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
      const { data } = matter(raw);
      return { slug, ...parseFrontmatter(data, slug) };
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

/** Returns a single post including its raw MDX body. */
export function getMdxPostBySlug(slug: string): MdxPost | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return { slug, ...parseFrontmatter(data, slug), content };
}

/** Extracts H2 and H3 headings from raw MDX for the Table of Contents. */
export function extractHeadings(content: string): TocHeading[] {
  return content
    .split("\n")
    .filter((line) => /^#{2,3}\s/.test(line))
    .map((line) => {
      const level = line.startsWith("### ") ? 3 : 2;
      const text  = line.replace(/^#{2,3}\s+/, "").trim();
      return { level, text, id: slugifyHeading(text) };
    });
}

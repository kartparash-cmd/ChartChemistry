import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { blogPosts, getBlogPost, getAllBlogSlugs } from "@/lib/blog-posts";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: post.tags,
    authors: [{ name: "ChartChemistry" }],
    openGraph: {
      title: `${post.title} | ChartChemistry Blog`,
      description: post.description,
      url: `https://chartchemistry.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: ["ChartChemistry"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Converts a subset of markdown to HTML.
 * Handles: headings, bold, italic, links, lists, paragraphs, and horizontal rules.
 *
 * SECURITY NOTE: This function ONLY processes static content from blog-posts.ts
 * which is hardcoded in the codebase. No user input is ever passed through this
 * function, so there is no XSS risk from dangerouslySetInnerHTML usage below.
 */
function markdownToHtml(md: string): string {
  const lines = md.trim().split("\n");
  const htmlLines: string[] = [];
  let inList = false;
  let listType: "ul" | "ol" = "ul";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Close list if we're in one and line is not a list item
    if (inList && !line.match(/^[-*]\s/) && !line.match(/^\d+\.\s/) && line.trim() !== "") {
      htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
      inList = false;
    }

    // Blank line
    if (line.trim() === "") {
      if (inList) {
        htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
        inList = false;
      }
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      htmlLines.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      htmlLines.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      htmlLines.push(`<h1>${inlineFormat(line.slice(2))}</h1>`);
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      htmlLines.push("<hr />");
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s/)) {
      if (!inList) {
        inList = true;
        listType = "ul";
        htmlLines.push("<ul>");
      }
      htmlLines.push(`<li>${inlineFormat(line.replace(/^[-*]\s/, ""))}</li>`);
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      if (!inList) {
        inList = true;
        listType = "ol";
        htmlLines.push("<ol>");
      }
      htmlLines.push(`<li>${inlineFormat(line.replace(/^\d+\.\s/, ""))}</li>`);
      continue;
    }

    // Paragraph
    htmlLines.push(`<p>${inlineFormat(line)}</p>`);
  }

  if (inList) {
    htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
  }

  return htmlLines.join("\n");
}

function inlineFormat(text: string): string {
  // Links [text](url)
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-cosmic-purple-light underline underline-offset-4 hover:text-cosmic-purple transition-colors">$1</a>'
  );
  // Bold **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic *text*
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // Inline code `text`
  text = text.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-muted px-1.5 py-0.5 text-sm">$1</code>'
  );
  return text;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  // Find related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  // JSON-LD — all values sourced from static blog-posts.ts, not user input
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Organization",
      name: "ChartChemistry",
      url: "https://chartchemistry.com",
    },
    publisher: {
      "@type": "Organization",
      name: "ChartChemistry",
      url: "https://chartchemistry.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://chartchemistry.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
  };

  // Static content only — safe for dangerouslySetInnerHTML
  const contentHtml = markdownToHtml(post.content);

  return (
    <>
      {/* JSON-LD: static data from blog-posts.ts, no user input */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-foreground"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3 w-3" />
            </li>
            <li>
              <Link
                href="/blog"
                className="transition-colors hover:text-foreground"
              >
                Blog
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3 w-3" />
            </li>
            <li
              aria-current="page"
              className="truncate text-foreground font-medium max-w-[200px]"
            >
              {post.title}
            </li>
          </ol>
        </nav>

        {/* Article header */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="outline">{post.category}</Badge>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {post.readingTime} min read
            </span>
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem] leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {post.description}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>By</span>
            <span className="font-medium text-foreground">ChartChemistry</span>
          </div>
        </header>

        <Separator className="mb-10 bg-border" />

        {/* Article body — content is static from blog-posts.ts, safe for innerHTML */}
        <article
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-heading prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-5
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-cosmic-purple-light prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-cosmic-purple
            prose-ul:my-4 prose-ul:space-y-2 prose-li:text-muted-foreground
            prose-ol:my-4 prose-ol:space-y-2
            prose-hr:border-border prose-hr:my-8"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Tags */}
        <div className="mt-12 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
            >
              <Tag className="h-3 w-3" aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>

        <Separator className="my-12 bg-border" />

        {/* Back to blog */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-cosmic-purple-light transition-colors hover:text-cosmic-purple"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to all articles
        </Link>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-foreground/80">
              Related Articles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group rounded-xl border border-border bg-card/50 p-5 transition-all hover:border-cosmic-purple/30 hover:shadow-lg hover:shadow-cosmic-purple/5"
                >
                  <Badge variant="outline" className="mb-2 text-xs">
                    {related.category}
                  </Badge>
                  <h3 className="text-sm font-semibold leading-snug transition-colors group-hover:text-cosmic-purple-light">
                    {related.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {related.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

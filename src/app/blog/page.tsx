import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Tag } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { blogPosts, getAllCategories } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog — Astrology Guides & Insights",
  description:
    "Astrology guides, transit updates, and relationship insights from ChartChemistry. Learn about synastry, birth charts, retrogrades, and more.",
  alternates: { canonical: "/blog" },
  keywords: [
    "astrology blog",
    "synastry guide",
    "mercury retrograde",
    "birth chart explained",
    "zodiac compatibility",
    "astrology articles",
  ],
  openGraph: {
    title: "Blog — Astrology Guides & Insights | ChartChemistry",
    description:
      "Astrology guides, transit updates, and relationship insights from ChartChemistry.",
    url: "https://chartchemistry.com/blog",
    type: "website",
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const categories = getAllCategories();
  const sortedPosts = [...blogPosts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // JSON-LD uses only static data from blog-posts.ts (no user input)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "ChartChemistry Blog",
    description:
      "Astrology guides, transit updates, and relationship insights.",
    url: "https://chartchemistry.com/blog",
    publisher: {
      "@type": "Organization",
      name: "ChartChemistry",
      url: "https://chartchemistry.com",
    },
    blogPost: sortedPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      url: `https://chartchemistry.com/blog/${post.slug}`,
      author: {
        "@type": "Organization",
        name: "ChartChemistry",
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            ChartChemistry Blog
          </div>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl cosmic-text mb-4">
            Astrology Guides & Insights
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Explore in-depth articles on synastry, transits, birth chart
            fundamentals, and practical astrological wisdom.
          </p>
        </div>

        {/* Category filters */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="px-3 py-1 text-xs"
            >
              {category}
            </Badge>
          ))}
        </div>

        <Separator className="mb-10 bg-border" />

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
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground font-medium">
              Blog
            </li>
          </ol>
        </nav>

        {/* Posts grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {sortedPosts.map((post) => (
            <Card
              key={post.slug}
              className="group border-border bg-card/50 backdrop-blur-sm transition-all hover:border-cosmic-purple/30 hover:shadow-lg hover:shadow-cosmic-purple/5"
            >
              <CardHeader>
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {post.readingTime} min read
                  </span>
                </div>
                <CardTitle className="text-lg leading-snug">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition-colors hover:text-cosmic-purple-light"
                  >
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3 text-sm">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-medium text-cosmic-purple-light transition-colors hover:text-cosmic-purple group-hover:gap-2"
                >
                  Read more
                  <ArrowRight
                    className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Tags cloud */}
        <div className="mt-16">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/80">
            Popular Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {[...new Set(sortedPosts.flatMap((p) => p.tags))].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground"
              >
                <Tag className="h-3 w-3" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

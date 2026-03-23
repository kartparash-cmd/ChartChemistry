import type { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/lib/blog-posts";

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://chartchemistry.com";
  const now = new Date().toISOString();

  const staticPages = [
    "",
    "/compatibility",
    "/pricing",
    "/about",
    "/learn",
    "/learn/zodiac",
    "/learn/houses",
    "/learn/aspects",
    "/learn/planets",
    "/cosmic-identity",
    "/privacy",
    "/terms",
    "/support",
    "/quick-match",
    "/cosmic-identity",
    "/auth/signin",
    "/auth/signup",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority:
      path === ""
        ? 1
        : path === "/compatibility"
          ? 0.9
          : path === "/pricing"
            ? 0.8
            : 0.6,
  }));

  // Programmatic zodiac pair pages (78 combinations)
  const zodiacPairs: MetadataRoute.Sitemap = [];
  for (let i = 0; i < ZODIAC_SIGNS.length; i++) {
    for (let j = i; j < ZODIAC_SIGNS.length; j++) {
      zodiacPairs.push({
        url: `${base}/compatibility/${ZODIAC_SIGNS[i]}-${ZODIAC_SIGNS[j]}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // Blog posts
  const blogEntries: MetadataRoute.Sitemap = getAllBlogSlugs().map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Blog listing page
  const blogListing: MetadataRoute.Sitemap = [
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  return [...staticEntries, ...zodiacPairs, ...blogListing, ...blogEntries];
}

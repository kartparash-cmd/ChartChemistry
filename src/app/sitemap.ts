import type { MetadataRoute } from "next";

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
    "/privacy",
    "/terms",
    "/support",
    "/auth/signin",
    "/auth/signup",
  ];

  return staticPages.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/compatibility" ? 0.9 : path === "/pricing" ? 0.8 : 0.6,
  }));
}

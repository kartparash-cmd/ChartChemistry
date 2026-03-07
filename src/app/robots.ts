import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/", "/compatibility/"],
        disallow: ["/api/", "/dashboard/", "/admin/", "/chat/", "/report/", "/chart/", "/auth/"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/admin/", "/chat/", "/report/", "/chart/", "/auth/", "/horoscope/", "/wellness/", "/transits/", "/relationship/", "/connections/"],
      },
    ],
    sitemap: "https://chartchemistry.com/sitemap.xml",
  };
}

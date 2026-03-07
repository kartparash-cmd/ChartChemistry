import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Astrology | Chart Chemistry",
  description: "Learn about planets, houses, aspects, and how they shape your personality and relationships.",
  alternates: { canonical: "https://chartchemistry.com/learn" },
  openGraph: {
    title: "Learn Astrology | Chart Chemistry",
    description: "Understanding planets, houses, aspects, and astrological compatibility.",
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://chartchemistry.com" },
              { "@type": "ListItem", position: 2, name: "Learn Astrology", item: "https://chartchemistry.com/learn" },
            ],
          }),
        }}
      />
    </>
  );
}

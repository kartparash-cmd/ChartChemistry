import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn Astrology | Chart Chemistry",
  description: "Learn about planets, houses, aspects, and how they shape your personality and relationships.",
  openGraph: {
    title: "Learn Astrology | Chart Chemistry",
    description: "Understanding planets, houses, aspects, and astrological compatibility.",
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}

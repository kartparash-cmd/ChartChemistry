import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Chart Chemistry",
  description: "Learn about Chart Chemistry — AI-powered astrology compatibility analysis using real astronomical data and advanced AI interpretation.",
  openGraph: {
    title: "About Chart Chemistry",
    description: "AI-powered astrology compatibility analysis using real astronomical data.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

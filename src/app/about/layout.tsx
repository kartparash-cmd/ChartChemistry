import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | ChartChemistry",
  description: "Learn about ChartChemistry — AI-powered astrology compatibility analysis using real astronomical data and advanced AI interpretation.",
  alternates: { canonical: "https://chartchemistry.com/about" },
  openGraph: {
    title: "About ChartChemistry",
    description: "AI-powered astrology compatibility analysis using real astronomical data.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

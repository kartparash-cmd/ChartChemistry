import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Relationship Insights | ChartChemistry",
  description:
    "Explore in-depth astrological compatibility insights for your relationships, including synastry and composite chart analysis.",
  alternates: {
    canonical: "https://chartchemistry.com/relationship",
  },
};

export default function RelationshipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

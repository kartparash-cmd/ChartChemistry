import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cosmic Identity | ChartChemistry",
  description:
    "Discover your unique cosmic archetype, Big Three breakdown, elemental balance, and rarity stats based on your natal chart.",
  alternates: {
    canonical: "https://chartchemistry.com/cosmic-identity",
  },
};

export default function CosmicIdentityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

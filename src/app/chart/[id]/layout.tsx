import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Natal Chart | ChartChemistry",
  description:
    "View a detailed natal chart with planetary positions, house placements, and aspect interpretations.",
};

export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

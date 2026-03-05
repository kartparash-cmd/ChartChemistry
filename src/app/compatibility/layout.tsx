import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compatibility Check",
  description: "Check your astrological compatibility using full birth chart analysis. Compare synastry charts, house overlays, and planetary aspects with AI-powered insights.",
  openGraph: {
    title: "Compatibility Check | ChartChemistry",
    description: "Check your astrological compatibility using full birth chart analysis with AI-powered synastry and composite charts.",
  },
};

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  return children;
}

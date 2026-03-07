import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with your ChartChemistry account. Submit a support ticket and track your requests.",
  alternates: {
    canonical: "https://chartchemistry.com/support",
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}

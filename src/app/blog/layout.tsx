import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Blog",
    template: "%s | ChartChemistry Blog",
  },
  description:
    "Astrology guides, transit updates, and relationship insights from ChartChemistry. Learn about synastry, birth charts, retrogrades, and more.",
  alternates: { canonical: "/blog" },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

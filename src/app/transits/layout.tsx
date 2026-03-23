import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transit Timeline | ChartChemistry",
  description:
    "View current planetary transits affecting your natal chart. Track high-impact cosmic influences.",
  alternates: { canonical: "/transits" },
};

export default function TransitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

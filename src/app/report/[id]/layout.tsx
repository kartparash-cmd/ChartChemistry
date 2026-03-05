import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compatibility Report | ChartChemistry",
  description:
    "View your detailed astrological compatibility report with scores, insights, and relationship guidance.",
};

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

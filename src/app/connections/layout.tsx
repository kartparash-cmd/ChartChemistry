import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connections | ChartChemistry",
  description:
    "Compare astrological compatibility between your saved profiles. Discover your cosmic connections.",
};

export default function ConnectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

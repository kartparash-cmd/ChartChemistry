import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wellness & Timing | ChartChemistry",
  description:
    "Personalized wellness suggestions based on today's planetary transits to your natal chart.",
};

export default function WellnessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

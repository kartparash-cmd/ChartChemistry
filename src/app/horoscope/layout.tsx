import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Horoscope | ChartChemistry",
  description:
    "Your personalized daily horoscope based on your full natal chart, not just your sun sign.",
};

export default function HoroscopeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

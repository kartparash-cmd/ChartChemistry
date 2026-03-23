import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cosmic Calendar | ChartChemistry",
  description:
    "Track retrogrades, eclipses, full moons, and zodiac seasons. Your monthly guide to cosmic events.",
  alternates: { canonical: "/calendar" },
};

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

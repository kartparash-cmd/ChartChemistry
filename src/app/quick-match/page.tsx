import type { Metadata } from "next";
import QuickMatchClient from "./QuickMatchClient";

const SITE_URL = "https://chartchemistry.com";

export const metadata: Metadata = {
  title: "Instant Compatibility Score — ChartChemistry",
  description:
    "Enter two birthdays and get an instant zodiac compatibility score. Free, shareable, no sign-up required. See how the stars align!",
  alternates: { canonical: `${SITE_URL}/quick-match` },
  openGraph: {
    title: "How Compatible Are You? Instant Zodiac Score",
    description:
      "Enter two birthdays and see your cosmic compatibility in seconds. Free, no sign-up.",
    url: `${SITE_URL}/quick-match`,
    images: [
      {
        url: `${SITE_URL}/api/og?page=quick-match`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instant Zodiac Compatibility Score",
    description:
      "Enter two birthdays → get your compatibility score in seconds. Free.",
    images: [`${SITE_URL}/api/og?page=quick-match`],
  },
};

export default function QuickMatchPage() {
  return <QuickMatchClient />;
}

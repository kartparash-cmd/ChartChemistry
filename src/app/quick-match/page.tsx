import type { Metadata } from "next";
import { Suspense } from "react";
import QuickMatchClient from "./QuickMatchClient";

const SITE_URL = "https://chartchemistry.com";

const SIGN_EMOJIS: Record<string, string> = {
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

function getSunSign(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) return "Aries";
  if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) return "Taurus";
  if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) return "Gemini";
  if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) return "Cancer";
  if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) return "Leo";
  if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) return "Virgo";
  if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) return "Libra";
  if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) return "Scorpio";
  if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) return "Sagittarius";
  if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return "Capricorn";
  if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string; na?: string; nb?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const a = params.a;
  const b = params.b;
  const na = params.na;
  const nb = params.nb;

  // Default metadata when no result params
  if (!a || !b) {
    return {
      title: "Instant Compatibility Score — ChartChemistry",
      description:
        "Enter two birthdays and get an instant zodiac compatibility score. Free, shareable, no sign-up required.",
      alternates: { canonical: `${SITE_URL}/quick-match` },
      openGraph: {
        title: "How Compatible Are You? Instant Zodiac Score",
        description: "Enter two birthdays and see your cosmic compatibility in seconds. Free, no sign-up.",
        url: `${SITE_URL}/quick-match`,
        images: [{ url: `${SITE_URL}/api/og?page=quick-match`, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: "Instant Zodiac Compatibility Score",
        description: "Enter two birthdays and get your compatibility score in seconds. Free.",
        images: [`${SITE_URL}/api/og?page=quick-match`],
      },
    };
  }

  // Dynamic metadata with result
  const signA = getSunSign(a);
  const signB = getSunSign(b);
  const emojiA = SIGN_EMOJIS[signA] || "";
  const emojiB = SIGN_EMOJIS[signB] || "";
  const ogParams = new URLSearchParams({ a, b });
  if (na) ogParams.set("na", na);
  if (nb) ogParams.set("nb", nb);
  const ogUrl = `${SITE_URL}/api/og?${ogParams.toString()}`;

  const labelA = na || signA;
  const labelB = nb || signB;
  const title = `${emojiA} ${labelA} & ${emojiB} ${labelB} Compatibility — ChartChemistry`;
  const desc = `See how ${labelA} (${signA}) and ${labelB} (${signB}) match up! Instant zodiac compatibility score powered by ChartChemistry.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/quick-match` },
    openGraph: {
      title: `${signA} & ${signB} — How Compatible Are They?`,
      description: desc,
      url: `${SITE_URL}/quick-match?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${emojiA} ${signA} & ${emojiB} ${signB} Compatibility`,
      description: desc,
      images: [ogUrl],
    },
  };
}

export default function QuickMatchPage() {
  return (
    <Suspense>
      <QuickMatchClient />
    </Suspense>
  );
}

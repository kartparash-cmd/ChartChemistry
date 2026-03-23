import type { Metadata } from "next";

const BASE_URL = "https://chartchemistry.com";

interface LayoutProps {
  children: React.ReactNode;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const params = await searchParams;
  const name = typeof params?.name === "string" ? params.name : null;
  const sun = typeof params?.sun === "string" ? params.sun : null;
  const moon = typeof params?.moon === "string" ? params.moon : null;
  const rising = typeof params?.rising === "string" ? params.rising : null;
  const element = typeof params?.element === "string" ? params.element : null;

  // If card params are present, generate a personalized OG image
  if (name && sun) {
    const cardParams = new URLSearchParams({ name, sun });
    if (moon) cardParams.set("moon", moon);
    if (rising) cardParams.set("rising", rising);
    if (element) cardParams.set("element", element);
    const ogUrl = `${BASE_URL}/api/cosmic-card?${cardParams.toString()}`;

    const title = `${name}'s Cosmic Card | ChartChemistry`;
    const description = `${name} is a ${sun} Sun${moon ? ` / ${moon} Moon` : ""}${rising ? ` / ${rising} Rising` : ""}. Check your compatibility!`;

    return {
      title,
      description,
      alternates: {
        canonical: `${BASE_URL}/cosmic-identity`,
      },
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/cosmic-identity`,
        siteName: "ChartChemistry",
        images: [
          {
            url: ogUrl,
            width: 1200,
            height: 630,
            alt: `${name}'s Cosmic Card`,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogUrl],
      },
    };
  }

  // Default metadata (no card params)
  return {
    title: "Your Cosmic Identity | ChartChemistry",
    description:
      "Discover your unique cosmic archetype, Big Three breakdown, elemental balance, and rarity stats based on your natal chart.",
    alternates: {
      canonical: `${BASE_URL}/cosmic-identity`,
    },
    openGraph: {
      title: "Your Cosmic Identity | ChartChemistry",
      description:
        "Discover your unique cosmic archetype and Big Three breakdown.",
      url: `${BASE_URL}/cosmic-identity`,
      siteName: "ChartChemistry",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Your Cosmic Identity | ChartChemistry",
      description:
        "Discover your unique cosmic archetype and Big Three breakdown.",
    },
  };
}

export default function CosmicIdentityLayout({ children }: LayoutProps) {
  return children;
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const ZODIAC_SIGNS = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
] as const;

type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

const SIGN_EMOJIS: Record<ZodiacSign, string> = {
  aries: "\u2648", taurus: "\u2649", gemini: "\u264A", cancer: "\u264B",
  leo: "\u264C", virgo: "\u264D", libra: "\u264E", scorpio: "\u264F",
  sagittarius: "\u2650", capricorn: "\u2651", aquarius: "\u2652", pisces: "\u2653",
};

const SIGN_ELEMENTS: Record<ZodiacSign, string> = {
  aries: "Fire", taurus: "Earth", gemini: "Air", cancer: "Water",
  leo: "Fire", virgo: "Earth", libra: "Air", scorpio: "Water",
  sagittarius: "Fire", capricorn: "Earth", aquarius: "Air", pisces: "Water",
};

const ELEMENT_COMPAT: Record<string, string> = {
  "Fire-Fire": "Passionate and energetic, but watch for power clashes.",
  "Fire-Air": "A naturally harmonious pairing with great communication and excitement.",
  "Fire-Earth": "Challenging but grounding — passion meets stability.",
  "Fire-Water": "Steam! Intense chemistry with emotional depth.",
  "Air-Air": "Intellectually stimulating with endless conversation.",
  "Air-Earth": "Different wavelengths that can complement each other beautifully.",
  "Air-Water": "A delicate balance of logic and emotion.",
  "Earth-Earth": "Rock-solid foundation with shared values and reliability.",
  "Earth-Water": "Nurturing and supportive — a naturally fertile combination.",
  "Water-Water": "Deeply emotional and intuitive, with profound understanding.",
};

function getElementCompat(e1: string, e2: string): string {
  return ELEMENT_COMPAT[`${e1}-${e2}`] || ELEMENT_COMPAT[`${e2}-${e1}`] || "";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function parseSigns(slug: string): [ZodiacSign, ZodiacSign] | null {
  const parts = slug.toLowerCase().split("-");
  if (parts.length !== 2) return null;
  const [a, b] = parts as [string, string];
  if (
    !ZODIAC_SIGNS.includes(a as ZodiacSign) ||
    !ZODIAC_SIGNS.includes(b as ZodiacSign)
  )
    return null;
  return [a as ZodiacSign, b as ZodiacSign];
}

export function generateStaticParams() {
  const pairs: { signs: string }[] = [];
  for (let i = 0; i < ZODIAC_SIGNS.length; i++) {
    for (let j = i; j < ZODIAC_SIGNS.length; j++) {
      pairs.push({ signs: `${ZODIAC_SIGNS[i]}-${ZODIAC_SIGNS[j]}` });
    }
  }
  return pairs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ signs: string }>;
}): Promise<Metadata> {
  const { signs } = await params;
  const parsed = parseSigns(signs);
  if (!parsed) return { title: "Compatibility" };
  const [a, b] = parsed;
  const title = `${capitalize(a)} & ${capitalize(b)} Compatibility`;
  const desc = `Explore ${capitalize(a)} and ${capitalize(b)} astrological compatibility. Discover synastry insights, element harmony, and relationship dynamics with AI-powered analysis.`;
  return {
    title,
    description: desc,
    openGraph: { title: `${title} | ChartChemistry`, description: desc },
  };
}

export default async function ZodiacPairPage({
  params,
}: {
  params: Promise<{ signs: string }>;
}) {
  const { signs } = await params;
  const parsed = parseSigns(signs);
  if (!parsed) notFound();
  const [sign1, sign2] = parsed;
  const el1 = SIGN_ELEMENTS[sign1];
  const el2 = SIGN_ELEMENTS[sign2];
  const elementNote = getElementCompat(el1, el2);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 text-5xl mb-4">
          <span>{SIGN_EMOJIS[sign1]}</span>
          <Heart className="h-8 w-8 text-cosmic-purple-light animate-pulse" />
          <span>{SIGN_EMOJIS[sign2]}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold cosmic-text mb-3">
          {capitalize(sign1)} & {capitalize(sign2)} Compatibility
        </h1>
        <p className="text-muted-foreground text-lg">
          {el1} meets {el2} — {elementNote}
        </p>
      </div>

      <div className="space-y-8">
        <section className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-heading font-semibold mb-3">
            Element Dynamics
          </h2>
          <p className="text-muted-foreground">
            {capitalize(sign1)} is a {el1} sign, while {capitalize(sign2)} is a{" "}
            {el2} sign.
            {el1 === el2
              ? ` As two ${el1} signs, you share a fundamental energy and approach to life, creating natural understanding but also potential for amplified challenges.`
              : ` The ${el1}-${el2} combination brings complementary energies that can create a dynamic and enriching relationship when both partners embrace their differences.`}
          </p>
        </section>

        <section className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-heading font-semibold mb-3">
            Beyond Sun Signs
          </h2>
          <p className="text-muted-foreground">
            Sun sign compatibility is just the surface. True astrological
            compatibility involves analyzing Moon signs (emotional needs), Venus
            signs (love language), Mars signs (passion and drive), and the
            intricate web of planetary aspects between two full birth charts.
          </p>
        </section>

        <section className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-heading font-semibold mb-3">
            Key Areas to Explore
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-cosmic-purple-light mt-1 shrink-0" />
              <span>
                <strong>Synastry aspects:</strong> How your planets interact with
                each other
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-cosmic-purple-light mt-1 shrink-0" />
              <span>
                <strong>House overlays:</strong> Which life areas you activate in
                each other
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-cosmic-purple-light mt-1 shrink-0" />
              <span>
                <strong>Composite chart:</strong> The unique energy of your
                relationship itself
              </span>
            </li>
          </ul>
        </section>

        <div className="text-center pt-4">
          <Button asChild size="lg" className="cosmic-gradient text-white">
            <Link href="/compatibility">
              Get Your Full Compatibility Report
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            AI-powered analysis using your complete birth charts
          </p>
        </div>
      </div>

      <nav className="mt-16 border-t border-border pt-8">
        <h3 className="text-lg font-heading font-semibold mb-4 text-center">
          Explore Other Pairings
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {ZODIAC_SIGNS.filter((s) => s !== sign1 && s !== sign2)
            .slice(0, 6)
            .map((s) => (
              <Link
                key={s}
                href={`/compatibility/${sign1}-${s}`}
                className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:border-cosmic-purple/50 transition-colors"
              >
                {SIGN_EMOJIS[sign1]} {capitalize(sign1)} &{" "}
                {SIGN_EMOJIS[s as ZodiacSign]} {capitalize(s)}
              </Link>
            ))}
        </div>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${capitalize(sign1)} and ${capitalize(sign2)} Compatibility`,
            description: `Astrological compatibility analysis for ${capitalize(sign1)} and ${capitalize(sign2)}.`,
            author: { "@type": "Organization", name: "ChartChemistry" },
            publisher: { "@type": "Organization", name: "ChartChemistry" },
          }),
        }}
      />
    </div>
  );
}

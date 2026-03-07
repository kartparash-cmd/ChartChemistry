export const metadata = {
  title: "Pricing",
  description: "Choose your plan for AI-powered astrology compatibility insights. Free, Premium, and Annual plans available.",
  alternates: { canonical: "https://chartchemistry.com/pricing" },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What makes ChartChemistry different from other astrology apps?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "ChartChemistry uses AI-powered analysis of full birth charts including synastry aspects, composite charts, and house overlays — not just sun sign compatibility.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to know my exact birth time?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "While an exact birth time provides the most accurate readings, ChartChemistry can still generate meaningful compatibility insights with just the birth date and location.",
                },
              },
              {
                "@type": "Question",
                name: "Can I cancel my subscription anytime?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, you can cancel your Premium or Annual subscription at any time. You'll continue to have access until the end of your billing period.",
                },
              },
            ],
          }),
        }}
      />
    </>
  );
}

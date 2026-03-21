import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { StarField } from "@/components/star-field";
import { CookieConsent } from "@/components/cookie-consent";
import { PageTransition } from "@/components/page-transition";
import { CursorGlow } from "@/components/cursor-glow";
import { ConstellationLines } from "@/components/constellation-lines";
import { BreathingBackground } from "@/components/breathing-bg";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://chartchemistry.com"),
  title: {
    default: "ChartChemistry — AI-Powered Astrological Compatibility",
    template: "%s | ChartChemistry",
  },
  description:
    "Go beyond sun signs. Analyze full birth chart compatibility with AI-powered synastry, composite charts, house overlays, and planetary aspects.",
  keywords: [
    "synastry chart calculator",
    "birth chart compatibility",
    "astrology compatibility",
    "relationship astrology",
    "composite chart",
    "AI astrology",
    "synastry report",
    "zodiac compatibility",
  ],
  authors: [{ name: "ChartChemistry" }],
  openGraph: {
    title: "ChartChemistry — AI-Powered Astrological Compatibility",
    description:
      "Go beyond sun signs. Analyze full birth chart compatibility with AI-powered synastry, composite charts, house overlays, and planetary aspects.",
    type: "website",
    siteName: "ChartChemistry",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChartChemistry — AI-Powered Astrological Compatibility",
    description:
      "Go beyond sun signs. Analyze full birth chart compatibility with AI-powered synastry and composite charts.",
    site: "@chartchemistry",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://analytics.ownerly.xyz" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "ChartChemistry",
                url: "https://chartchemistry.com",
                description: "AI-powered astrology compatibility analysis using full synastry charts, composite analysis, and house overlays.",
                logo: "https://chartchemistry.com/og-image.png",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "ChartChemistry",
                url: "https://chartchemistry.com",
                description: "AI-powered astrological compatibility analysis using full birth charts, synastry, composite charts, and house overlays.",
                publisher: {
                  "@type": "Organization",
                  name: "ChartChemistry",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "ChartChemistry",
                url: "https://chartchemistry.com",
                applicationCategory: "LifestyleApplication",
                operatingSystem: "Web",
                description: "Go beyond sun signs. Analyze full birth chart compatibility with AI-powered synastry, composite charts, house overlays, and planetary aspects.",
                offers: [
                  {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                    name: "Free",
                    description: "3 compatibility checks per day, Sun/Moon/Rising comparison, and 1 free premium report",
                  },
                  {
                    "@type": "Offer",
                    price: "9.99",
                    priceCurrency: "USD",
                    name: "Premium",
                    description: "Unlimited compatibility checks, full synastry reports, AI chat with Marie, daily horoscope, and transit alerts",
                    priceSpecification: {
                      "@type": "UnitPriceSpecification",
                      price: "9.99",
                      priceCurrency: "USD",
                      billingDuration: "P1M",
                    },
                  },
                  {
                    "@type": "Offer",
                    price: "79.99",
                    priceCurrency: "USD",
                    name: "Annual",
                    description: "All Premium features billed annually at $6.67/month",
                    priceSpecification: {
                      "@type": "UnitPriceSpecification",
                      price: "79.99",
                      priceCurrency: "USD",
                      billingDuration: "P1Y",
                    },
                  },
                ],
                featureList: "Synastry Charts, Composite Analysis, House Overlays, AI Compatibility Reports, Personal AI Astrologer, Daily Horoscopes, Transit Alerts",
              },
            ]),
          }}
        />
        {process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_SITE_ID && (
          <Script
            src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_SITE_ID}
            strategy="afterInteractive"
          />
        )}
        <Script id="sw-cleanup" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                registrations.forEach(function(registration) {
                  registration.unregister();
                });
              });
            }
          `}
        </Script>
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-cosmic-purple focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <BreathingBackground />
        <StarField starCount={60} cosmic className="fixed inset-0 z-0 opacity-40 pointer-events-none" />
        <ConstellationLines />
        <CursorGlow />
        <ThemeProvider>
          <SessionProvider>
            <TooltipProvider>
              <ImpersonationBanner />
              <Navigation />
              <main id="main-content" className="min-h-screen pb-20 md:pb-0">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
            </TooltipProvider>
          </SessionProvider>
          <Toaster position="top-right" richColors />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}

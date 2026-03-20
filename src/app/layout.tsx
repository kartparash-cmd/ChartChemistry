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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ChartChemistry",
              url: "https://chartchemistry.com",
              description: "AI-powered astrology compatibility analysis using full synastry charts, composite analysis, and house overlays.",
              logo: "https://chartchemistry.com/og-image.png",
            }),
          }}
        />
        {process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_SITE_ID && (
          <Script
            src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_SITE_ID}
            strategy="afterInteractive"
          />
        )}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js').catch(function(err) {
                console.log('ServiceWorker registration failed:', err);
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
        <StarField starCount={60} cosmic className="fixed inset-0 z-0 opacity-30 pointer-events-none" />
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

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { SessionProvider } from "@/components/providers/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
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
        {process.env.NEXT_PUBLIC_UMAMI_URL && process.env.NEXT_PUBLIC_UMAMI_SITE_ID && (
          <Script
            src={`${process.env.NEXT_PUBLIC_UMAMI_URL}/script.js`}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_SITE_ID}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <TooltipProvider>
            <Navigation />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

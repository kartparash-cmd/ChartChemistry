import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Compatibility Widget — ChartChemistry",
  robots: { index: false, follow: false },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-navy min-h-screen text-white antialiased">
        {children}
      </body>
    </html>
  );
}

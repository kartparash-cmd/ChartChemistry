import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Astrologer Chat | ChartChemistry",
  description:
    "Chat with our AI astrologer for personalized astrological insights.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

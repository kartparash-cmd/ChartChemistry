import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marie — Personal Astrologer | ChartChemistry",
  description:
    "Chat with Marie, your personal astrologer, for personalized astrological insights.",
  alternates: {
    canonical: "https://chartchemistry.com/chat",
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

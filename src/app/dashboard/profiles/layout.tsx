import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Birth Profiles | ChartChemistry",
  description:
    "Manage your saved birth profiles. Add, edit, or remove profiles used for natal charts and compatibility reports.",
  alternates: {
    canonical: "https://chartchemistry.com/dashboard/profiles",
  },
};

export default function ProfilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

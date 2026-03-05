import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | ChartChemistry",
  description:
    "Your personal astrology dashboard. View your natal chart, compatibility reports, and cosmic insights.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

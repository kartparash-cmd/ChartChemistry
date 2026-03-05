import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";

export const metadata = {
  title: "Admin Dashboard",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}

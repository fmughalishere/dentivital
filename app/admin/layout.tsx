import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  // Signed in but not an admin — send them to their own dashboard instead.
  if (session.role !== "admin") redirect("/account");

  return (
    <DashboardShell
      title="Dentivital Admin"
      subtitle="Store operations"
      variant="admin"
      user={session}
      accent="coral"
    >
      {children}
    </DashboardShell>
  );
}

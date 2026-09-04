import { redirect } from "next/navigation";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getSession } from "@/lib/auth";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  // Staff have their own dashboard — they never see the customer one.
  if (session.role === "admin") redirect("/admin");

  return (
    <DashboardShell
      title="My account"
      subtitle="Orders, profile and preferences"
      variant="account"
      user={session}
    >
      {children}
    </DashboardShell>
  );
}

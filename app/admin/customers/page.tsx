import type { Metadata } from "next";
import CustomersTable from "@/components/admin/CustomersTable";
import { getAdminSession } from "@/lib/auth";
import { getUsers } from "@/lib/data";

export const metadata: Metadata = { title: "Customers · Admin" };

export default async function AdminCustomersPage() {
  const [session, users] = await Promise.all([getAdminSession(), getUsers()]);

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">People</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">Customers</h1>
        <p className="mt-1 text-sm text-dv-ink-soft">
          {users.length} account{users.length === 1 ? "" : "s"} · grant admin access or disable
          sign-in.
        </p>
      </header>

      <CustomersTable users={users} currentUserId={session?.id ?? ""} />
    </>
  );
}

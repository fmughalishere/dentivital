"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useUI } from "@/context/UIContext";
import { formatDate, initials } from "@/lib/format";
import type { AppUser } from "@/types";

export default function CustomersTable({
  users,
  currentUserId,
}: {
  users: AppUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const { toast, confirm } = useUI();
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }, [users, query]);

  async function patch(user: AppUser, body: Record<string, unknown>, successMessage: string) {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      router.refresh();
      toast.success(successMessage, user.email);
    } catch (err) {
      toast.error("Couldn't update customer", err instanceof Error ? err.message : undefined);
    }
  }

  async function toggleRole(user: AppUser) {
    const makingAdmin = user.role !== "admin";
    const ok = await confirm({
      title: makingAdmin ? `Make ${user.name} an admin?` : `Remove admin access for ${user.name}?`,
      description: makingAdmin
        ? "They'll get full access to orders, products, discounts and customers."
        : "They'll keep their account but lose access to the admin panel.",
      confirmLabel: makingAdmin ? "Grant admin" : "Remove access",
      tone: makingAdmin ? "default" : "danger",
    });
    if (!ok) return;
    await patch(
      user,
      { role: makingAdmin ? "admin" : "user" },
      makingAdmin ? "Admin access granted" : "Admin access removed"
    );
  }

  async function toggleDisabled(user: AppUser) {
    const disabling = !user.disabled;
    const ok = await confirm({
      title: disabling ? `Disable ${user.name}'s account?` : `Re-enable ${user.name}'s account?`,
      description: disabling
        ? "They won't be able to sign in until you re-enable the account."
        : "They'll be able to sign in again straight away.",
      confirmLabel: disabling ? "Disable account" : "Re-enable",
      tone: disabling ? "danger" : "default",
    });
    if (!ok) return;
    await patch(
      user,
      { disabled: disabling },
      disabling ? "Account disabled" : "Account re-enabled"
    );
  }

  return (
    <>
      <div className="relative mb-5 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dv-ink-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email"
          aria-label="Search customers"
          className="dv-input pl-10"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title={users.length === 0 ? "No customers yet" : "No customers match your search"}
          description={
            users.length === 0
              ? "Accounts appear here as soon as someone registers."
              : "Try a different name or email."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-dv-line bg-white">
          <div className="dv-scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-dv-line bg-dv-mint-50 text-left text-xs text-dv-ink-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Sign-in</th>
                  <th className="px-5 py-3 font-medium">Access</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dv-line">
                {visible.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-dv-mint-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dv-mint-100 text-xs font-medium text-dv-teal-900">
                          {initials(user.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-dv-teal-900">
                            {user.name}
                            {user.id === currentUserId && (
                              <span className="ml-2 text-[11px] text-dv-ink-soft">(you)</span>
                            )}
                          </span>
                          <span className="block truncate text-xs text-dv-ink-soft">
                            {user.email}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-dv-ink-soft">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3.5 capitalize text-dv-ink-soft">{user.provider}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {user.role === "admin" ? (
                          <Badge tone="coral">admin</Badge>
                        ) : (
                          <Badge>customer</Badge>
                        )}
                        {user.disabled && <Badge tone="danger">disabled</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.id === currentUserId ? (
                        <p className="text-right text-xs text-dv-ink-soft">—</p>
                      ) : (
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            onClick={() => toggleRole(user)}
                            className="rounded-lg px-3 py-1.5 text-xs text-dv-teal-900 transition-colors hover:bg-dv-mint-100"
                          >
                            {user.role === "admin" ? "Remove admin" : "Make admin"}
                          </button>
                          <button
                            onClick={() => toggleDisabled(user)}
                            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                              user.disabled
                                ? "text-dv-success hover:bg-dv-success-bg"
                                : "text-dv-danger hover:bg-dv-danger-bg"
                            }`}
                          >
                            {user.disabled ? "Re-enable" : "Disable"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

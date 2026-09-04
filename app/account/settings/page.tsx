import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SettingsPanel from "@/components/account/SettingsPanel";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/settings");

  const user = (await getUserById(session.id)) ?? {
    ...session,
    provider: "password" as const,
    createdAt: new Date().toISOString(),
  };

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">Settings</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">Account settings</h1>
        <p className="mt-1 text-sm text-dv-ink-soft">
          Manage your password, email preferences and sessions.
        </p>
      </header>

      <SettingsPanel user={user} />
    </>
  );
}

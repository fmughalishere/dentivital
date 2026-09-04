import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/account/ProfileForm";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/data";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/profile");

  const user = (await getUserById(session.id)) ?? {
    ...session,
    provider: "password" as const,
    createdAt: new Date().toISOString(),
  };

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">Profile</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">Your details</h1>
        <p className="mt-1 text-sm text-dv-ink-soft">
          Keep this up to date so order updates reach you.
        </p>
      </header>

      <div className="rounded-2xl border border-dv-line bg-white p-6">
        <ProfileForm user={user} />
      </div>
    </>
  );
}

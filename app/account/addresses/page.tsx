import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AddressForm from "@/components/account/AddressForm";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/data";

export const metadata: Metadata = { title: "Address book" };

export default async function AddressesPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account/addresses");

  const user = (await getUserById(session.id)) ?? {
    ...session,
    provider: "password" as const,
    createdAt: new Date().toISOString(),
  };

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">Address book</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">Default shipping address</h1>
        <p className="mt-1 text-sm text-dv-ink-soft">
          We&apos;ll prefill this at checkout — you can always change it per order.
        </p>
      </header>

      <div className="rounded-2xl border border-dv-line bg-white p-6">
        <AddressForm user={user} />
      </div>
    </>
  );
}

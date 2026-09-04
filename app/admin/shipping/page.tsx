import type { Metadata } from "next";
import ShippingManager from "@/components/admin/ShippingManager";
import { getShippingRates } from "@/lib/data";

export const metadata: Metadata = { title: "Shipping · Admin" };

export default async function AdminShippingPage() {
  const rates = await getShippingRates({ includeInactive: true });

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">Delivery</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">Shipping methods</h1>
        <p className="mt-1 text-sm text-dv-ink-soft">
          Rates shown at checkout, with optional free-shipping thresholds.
        </p>
      </header>

      <ShippingManager rates={rates} />
    </>
  );
}

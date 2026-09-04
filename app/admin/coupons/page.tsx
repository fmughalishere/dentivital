import type { Metadata } from "next";
import CouponsManager from "@/components/admin/CouponsManager";
import { getCoupons } from "@/lib/data";

export const metadata: Metadata = { title: "Discounts · Admin" };

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">Promotions</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">Discount codes</h1>
        <p className="mt-1 text-sm text-dv-ink-soft">
          Percentage or fixed-amount codes, with minimums, limits and expiry dates.
        </p>
      </header>

      <CouponsManager coupons={coupons} />
    </>
  );
}

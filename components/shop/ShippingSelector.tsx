"use client";

import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Skeleton from "@/components/ui/Skeleton";
import { money, round2 } from "@/lib/format";
import type { ShippingRate } from "@/types";

export default function ShippingSelector() {
  const { shippingRate, setShippingRate, subtotal, discount } = useCart();
  const [rates, setRates] = useState<ShippingRate[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shipping")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setRates((data.rates ?? []) as ShippingRate[]);
      })
      .catch(() => {
        if (!cancelled) setRates([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Preselect the first (cheapest) method once the list arrives, and re-sync if
  // a previously stored rate has since been removed by an admin.
  useEffect(() => {
    if (!rates || rates.length === 0) return;
    const stillExists = shippingRate && rates.some((r) => r._id === shippingRate._id);
    if (!stillExists) setShippingRate(rates[0]);
  }, [rates, shippingRate, setShippingRate]);

  if (rates === null) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (rates.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-dv-line-strong px-4 py-3 text-xs text-dv-ink-soft">
        No shipping methods configured yet. An admin can add them under Admin → Shipping.
      </p>
    );
  }

  const afterDiscount = round2(subtotal - discount);

  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Shipping method</legend>
      {rates.map((rate) => {
        const free = rate.freeOver !== null && afterDiscount >= rate.freeOver;
        const selected = shippingRate?._id === rate._id;
        return (
          <label
            key={rate._id}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
              selected
                ? "border-dv-teal-500 bg-dv-mint-50 ring-1 ring-dv-teal-500/25"
                : "border-dv-line hover:border-dv-line-strong"
            }`}
          >
            <input
              type="radio"
              name="shipping-rate"
              checked={selected}
              onChange={() => setShippingRate(rate)}
              className="mt-1 h-4 w-4 shrink-0 accent-dv-teal-700"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-dv-teal-900">
                  <Truck className="h-3.5 w-3.5 text-dv-teal-700" />
                  {rate.label}
                </span>
                <span className="shrink-0 text-sm font-medium text-dv-teal-900">
                  {free ? "Free" : money(rate.price)}
                </span>
              </span>
              <span className="mt-1 block text-xs text-dv-ink-soft">
                {rate.description || `Arrives in ${rate.minDays}–${rate.maxDays} business days.`}
              </span>
              {!free && rate.freeOver !== null && (
                <span className="mt-1 block text-[11px] text-dv-coral-600">
                  Free when you spend {money(rate.freeOver)} or more
                </span>
              )}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

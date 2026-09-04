"use client";

import { useState } from "react";
import { Tag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import Spinner from "@/components/ui/Spinner";
import { money } from "@/lib/format";

export default function CouponBox() {
  const { coupon, applyCoupon, subtotal, discount } = useCart();
  const { toast } = useUI();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !code.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "That code isn't valid.");

      applyCoupon(data.coupon);
      setCode("");
      toast.success(`Code ${data.coupon.code} applied`, `You saved ${money(data.discount)}.`);
    } catch (err) {
      toast.error("Code not applied", err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  }

  function remove() {
    const removed = coupon?.code;
    applyCoupon(null);
    toast.info("Discount removed", removed ? `Code ${removed} is no longer applied.` : undefined);
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dv-success/30 bg-dv-success-bg px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Tag className="h-4 w-4 shrink-0 text-dv-success" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-dv-success">{coupon.code}</p>
            <p className="text-xs text-dv-success/80">
              {coupon.type === "percent" ? `${coupon.value}% off` : `${money(coupon.value)} off`} ·
              −{money(discount)}
            </p>
          </div>
        </div>
        <button
          onClick={remove}
          aria-label={`Remove discount code ${coupon.code}`}
          className="shrink-0 rounded-lg p-1.5 text-dv-success transition-colors hover:bg-white/60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={apply} className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dv-ink-soft" />
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Discount code"
          aria-label="Discount code"
          className="dv-input pl-10 uppercase"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="flex shrink-0 items-center gap-2 rounded-xl border border-dv-line-strong bg-white px-5 text-sm font-medium text-dv-teal-900 transition-colors hover:border-dv-teal-500 hover:bg-dv-mint-100 disabled:opacity-50"
      >
        {loading && <Spinner />}
        Apply
      </button>
    </form>
  );
}

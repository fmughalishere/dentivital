import { round2 } from "@/lib/format";
import type { CartItem, Coupon, ShippingRate } from "@/types";

export function cartSubtotal(items: CartItem[]): number {
  return round2(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export type CouponCheck =
  | { ok: true; discount: number; coupon: Coupon }
  | { ok: false; reason: string };

/** Pure validation so the client and the server agree on the same answer. */
export function evaluateCoupon(coupon: Coupon | null, subtotal: number): CouponCheck {
  if (!coupon) return { ok: false, reason: "That discount code doesn't exist." };
  if (!coupon.active) return { ok: false, reason: "This discount code is no longer active." };

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: "This discount code has expired." };
  }
  if (coupon.maxRedemptions !== null && coupon.timesRedeemed >= coupon.maxRedemptions) {
    return { ok: false, reason: "This discount code has been fully redeemed." };
  }
  if (subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      reason: `Spend at least $${coupon.minSubtotal.toFixed(2)} to use this code.`,
    };
  }

  const raw = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  const discount = round2(Math.min(raw, subtotal));
  return { ok: true, discount, coupon };
}

export function shippingCostFor(rate: ShippingRate | null, subtotalAfterDiscount: number): number {
  if (!rate) return 0;
  if (rate.freeOver !== null && subtotalAfterDiscount >= rate.freeOver) return 0;
  return round2(rate.price);
}

export type Totals = {
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
};

export function computeTotals(params: {
  items: CartItem[];
  coupon?: Coupon | null;
  rate?: ShippingRate | null;
}): Totals {
  const subtotal = cartSubtotal(params.items);
  const check = evaluateCoupon(params.coupon ?? null, subtotal);
  const discount = check.ok ? check.discount : 0;
  const afterDiscount = round2(subtotal - discount);
  const shippingCost = shippingCostFor(params.rate ?? null, afterDiscount);
  return {
    subtotal,
    discount,
    shippingCost,
    total: round2(afterDiscount + shippingCost),
  };
}

export const DEFAULT_SHIPPING_RATES: Omit<ShippingRate, "_id">[] = [
  {
    label: "Standard Shipping",
    description: "Tracked delivery, arrives in 4–7 business days.",
    price: 4.95,
    minDays: 4,
    maxDays: 7,
    freeOver: 50,
    active: true,
    sortOrder: 1,
  },
  {
    label: "Express Shipping",
    description: "Priority handling, arrives in 2–3 business days.",
    price: 12.95,
    minDays: 2,
    maxDays: 3,
    freeOver: null,
    active: true,
    sortOrder: 2,
  },
  {
    label: "Next Day Delivery",
    description: "Order before 2pm for delivery tomorrow.",
    price: 24.95,
    minDays: 1,
    maxDays: 1,
    freeOver: null,
    active: true,
    sortOrder: 3,
  },
];

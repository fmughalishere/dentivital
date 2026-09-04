"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { Input, Select } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import ShippingSelector from "@/components/shop/ShippingSelector";
import CouponBox from "@/components/shop/CouponBox";
import EmptyState from "@/components/ui/EmptyState";
import { money } from "@/lib/format";

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Ireland",
  "New Zealand",
  "Germany",
  "France",
  "Netherlands",
  "United Arab Emirates",
  "Pakistan",
];

const EMPTY_FORM = {
  email: "",
  customerName: "",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
  phone: "",
};

export default function CheckoutPage() {
  const { items, hydrated, subtotal, discount, shippingCost, total, coupon, shippingRate } =
    useCart();
  const { user, isAdmin } = useAuth();
  const { toast } = useUI();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Prefill from the signed-in profile once it loads.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      email: f.email || user.email,
      customerName: f.customerName || user.name,
      fullName: f.fullName || user.address?.fullName || user.name,
      line1: f.line1 || user.address?.line1 || "",
      line2: f.line2 || user.address?.line2 || "",
      city: f.city || user.address?.city || "",
      state: f.state || user.address?.state || "",
      postalCode: f.postalCode || user.address?.postalCode || "",
      country: user.address?.country || f.country,
      phone: f.phone || user.phone || user.address?.phone || "",
    }));
  }, [user]);

  function update(key: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.customerName.trim().length < 2) next.customerName = "Enter your name.";
    if (form.fullName.trim().length < 2) next.fullName = "Enter the recipient's name.";
    if (form.line1.trim().length < 3) next.line1 = "Enter a street address.";
    if (!form.city.trim()) next.city = "Enter a city.";
    if (form.postalCode.trim().length < 2) next.postalCode = "Enter a postal code.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!validate()) {
      toast.error("Check your details", "A few fields still need attention.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          email: form.email,
          customerName: form.customerName,
          couponCode: coupon?.code ?? null,
          shippingRateId: shippingRate?._id ?? null,
          shippingAddress: {
            fullName: form.fullName,
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
            phone: form.phone,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "We couldn't start the checkout.");
      }

      toast.info("Redirecting to secure payment…", `Order ${data.orderNumber}`);
      window.location.href = data.url as string;
    } catch (err) {
      toast.error("Checkout failed", err instanceof Error ? err.message : undefined);
      setLoading(false);
    }
  }

  // Staff accounts manage the store rather than buy from it.
  if (isAdmin) {
    return (
      <section className="dv-container py-16">
        <EmptyState
          icon={<ShieldCheck className="h-5 w-5" />}
          title="You're signed in as an admin"
          description="Admin accounts can't place orders, so test purchases never land in your sales figures. Sign out and use a customer account to try the checkout."
          action={
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-full bg-dv-teal-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-dv-coral-600"
            >
              Go to admin orders
            </Link>
          }
        />
      </section>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <section className="dv-container py-16">
        <EmptyState
          icon={<ShoppingBag className="h-5 w-5" />}
          title="Nothing to check out yet"
          description="Add a product to your cart and come back to complete your order."
          action={
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-dv-teal-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-dv-coral-600"
            >
              Browse products
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section className="dv-container py-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1.5 text-xs text-dv-ink-soft transition-colors hover:text-dv-coral-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to cart
      </Link>

      <header className="mt-5 mb-8">
        <p className="eyebrow text-dv-coral-600">Checkout</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900 sm:text-4xl">
          Almost there — where should we send it?
        </h1>
      </header>

      <form onSubmit={handlePay} className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start" noValidate>
        <div className="space-y-6">
          <fieldset className="rounded-2xl border border-dv-line bg-white p-6">
            <legend className="px-1 font-display text-lg text-dv-teal-900">Contact</legend>
            {!user && (
              <p className="mt-1 text-xs text-dv-ink-soft">
                Already have an account?{" "}
                <Link href="/login?next=/checkout" className="dv-link-underline text-dv-teal-900">
                  Sign in
                </Link>{" "}
                to track this order from your dashboard.
              </p>
            )}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                required
                value={form.email}
                error={errors.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                hint="Your receipt and tracking updates go here."
              />
              <Input
                label="Your name"
                required
                value={form.customerName}
                error={errors.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                placeholder="Jane Cooper"
              />
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-dv-line bg-white p-6">
            <legend className="px-1 font-display text-lg text-dv-teal-900">Shipping address</legend>
            <div className="mt-5 grid gap-4">
              <Input
                label="Recipient name"
                required
                value={form.fullName}
                error={errors.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
              <Input
                label="Address line 1"
                required
                value={form.line1}
                error={errors.line1}
                onChange={(e) => update("line1", e.target.value)}
                placeholder="123 Maple Street"
              />
              <Input
                label="Address line 2"
                value={form.line2}
                onChange={(e) => update("line2", e.target.value)}
                placeholder="Apartment, suite (optional)"
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label="City"
                  required
                  value={form.city}
                  error={errors.city}
                  onChange={(e) => update("city", e.target.value)}
                />
                <Input
                  label="State / Region"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                />
                <Input
                  label="Postal code"
                  required
                  value={form.postalCode}
                  error={errors.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Country"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="For delivery updates"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-dv-line bg-white p-6">
            <legend className="px-1 font-display text-lg text-dv-teal-900">Delivery speed</legend>
            <div className="mt-5">
              <ShippingSelector />
            </div>
          </fieldset>
        </div>

        {/* Summary */}
        <aside className="rounded-2xl border border-dv-line bg-white p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-lg text-dv-teal-900">Your order</h2>

          <ul className="mt-5 space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-dv-mint-100">
                  {item.image && (
                    <Image src={item.image} alt="" fill sizes="56px" className="object-contain p-1.5" />
                  )}
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-dv-teal-900 text-[10px] text-white">
                    {item.quantity}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-dv-teal-900">{item.name}</span>
                  <span className="block text-xs text-dv-ink-soft">{money(item.price)} each</span>
                </span>
                <span className="shrink-0 text-sm font-medium text-dv-teal-900">
                  {money(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-dv-line pt-5">
            <CouponBox />
          </div>

          <dl className="mt-5 space-y-2.5 border-t border-dv-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-dv-ink-soft">Subtotal</dt>
              <dd className="font-medium text-dv-teal-900">{money(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-dv-success">
                <dt>Discount{coupon ? ` (${coupon.code})` : ""}</dt>
                <dd>−{money(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-dv-ink-soft">
                Shipping{shippingRate ? ` · ${shippingRate.label}` : ""}
              </dt>
              <dd className="font-medium text-dv-teal-900">
                {shippingCost === 0 ? "Free" : money(shippingCost)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-dv-line pt-3">
              <dt className="font-display text-base text-dv-teal-900">Total</dt>
              <dd className="font-display text-xl text-dv-teal-900">{money(total)}</dd>
            </div>
          </dl>

          <Button type="submit" loading={loading} fullWidth size="lg" className="mt-6">
            <Lock className="h-4 w-4" />
            {loading ? "Redirecting…" : `Pay ${money(total)}`}
          </Button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-dv-ink-soft">
            <ShieldCheck className="h-3.5 w-3.5" />
            You&apos;ll complete payment on Stripe&apos;s secure page.
          </p>
        </aside>
      </form>
    </section>
  );
}

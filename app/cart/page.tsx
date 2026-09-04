"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import CouponBox from "@/components/shop/CouponBox";
import ShippingSelector from "@/components/shop/ShippingSelector";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { money } from "@/lib/format";

export default function CartPage() {
  const {
    items,
    hydrated,
    updateQty,
    removeItem,
    clearCart,
    subtotal,
    discount,
    shippingCost,
    total,
    count,
  } = useCart();
  const { confirm, toast } = useUI();

  // Stripe sends the shopper back here when they cancel the payment. Reading
  // the query string directly avoids needing a Suspense boundary.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancelled") === "1") {
      toast.info("Checkout cancelled", "Your cart is still here whenever you're ready.");
      window.history.replaceState({}, "", "/cart");
    }
    // Only react to the flag once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleRemove(productId: string, name: string) {
    const ok = await confirm({
      title: `Remove ${name}?`,
      description: "You can always add it back later.",
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    removeItem(productId);
    toast.info("Removed from cart", name);
  }

  async function handleClear() {
    const ok = await confirm({
      title: "Empty your cart?",
      description: "Every item will be removed. This can't be undone.",
      confirmLabel: "Empty cart",
      tone: "danger",
    });
    if (!ok) return;
    clearCart();
    toast.info("Cart emptied");
  }

  if (!hydrated) {
    return (
      <div className="dv-container grid gap-8 py-14 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <section className="dv-container py-12">
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">Your Cart</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900 sm:text-4xl">
          {count > 0 ? `${count} item${count === 1 ? "" : "s"} in your cart` : "Your cart"}
        </h1>
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-5 w-5" />}
          title="Your cart is empty"
          description="Browse the whitening line and add a treatment that suits your routine."
          action={
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-dv-teal-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-dv-coral-600"
            >
              Shop products <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          {/* Items */}
          <div>
            <ul className="divide-y divide-dv-line overflow-hidden rounded-2xl border border-dv-line bg-white">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 p-4 sm:p-5">
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-dv-mint-100 sm:h-28 sm:w-28"
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-contain p-2"
                      />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-display text-base text-dv-teal-900 hover:text-dv-coral-600"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-dv-ink-soft">
                          {money(item.price)} each
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.productId, item.name)}
                        aria-label={`Remove ${item.name}`}
                        className="rounded-lg p-2 text-dv-ink-soft transition-colors hover:bg-dv-danger-bg hover:text-dv-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-dv-line-strong">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="p-2 text-dv-ink-soft transition-colors hover:text-dv-teal-900 disabled:opacity-40"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-dv-teal-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                          aria-label="Increase quantity"
                          className="p-2 text-dv-ink-soft transition-colors hover:text-dv-teal-900 disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-display text-lg text-dv-teal-900">
                        {money(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/products"
                className="dv-link-underline text-sm text-dv-teal-900"
              >
                Continue shopping
              </Link>
              <button
                onClick={handleClear}
                className="text-sm text-dv-ink-soft transition-colors hover:text-dv-danger"
              >
                Empty cart
              </button>
            </div>

            <div className="mt-8">
              <h2 className="mb-3 font-display text-lg text-dv-teal-900">Shipping method</h2>
              <ShippingSelector />
            </div>
          </div>

          {/* Summary */}
          <aside className="rounded-2xl border border-dv-line bg-white p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-lg text-dv-teal-900">Order summary</h2>

            <div className="mt-5">
              <CouponBox />
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-dv-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-dv-ink-soft">Subtotal</dt>
                <dd className="font-medium text-dv-teal-900">{money(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-dv-success">
                  <dt>Discount</dt>
                  <dd>−{money(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-dv-ink-soft">Shipping</dt>
                <dd className="font-medium text-dv-teal-900">
                  {shippingCost === 0 ? "Free" : money(shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-dv-line pt-3">
                <dt className="font-display text-base text-dv-teal-900">Total</dt>
                <dd className="font-display text-xl text-dv-teal-900">{money(total)}</dd>
              </div>
            </dl>

            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-dv-teal-900 py-3.5 text-sm font-medium text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-dv-coral-600"
            >
              Proceed to checkout <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-dv-ink-soft">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure payment powered by Stripe
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}

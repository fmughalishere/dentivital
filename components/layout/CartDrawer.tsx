"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { money } from "@/lib/format";

export default function CartDrawer() {
  const {
    items,
    drawerOpen,
    closeDrawer,
    updateQty,
    removeItem,
    subtotal,
    discount,
    count,
  } = useCart();
  const { confirm, toast } = useUI();

  if (!drawerOpen) return null;

  async function handleRemove(productId: string, name: string) {
    const ok = await confirm({
      title: `Remove ${name}?`,
      description: "It will be taken out of your cart.",
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    removeItem(productId);
    toast.info("Removed from cart", name);
  }

  return (
    <div className="fixed inset-0 z-[95] flex justify-end">
      <div
        className="absolute inset-0 animate-dv-fade-in bg-dv-teal-900/40 backdrop-blur-[2px]"
        onClick={closeDrawer}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="relative flex h-full w-full max-w-md animate-dv-slide-in-right flex-col bg-white shadow-lift"
      >
        <header className="flex items-center justify-between border-b border-dv-line px-5 py-4">
          <div>
            <h2 className="font-display text-lg text-dv-teal-900">Your cart</h2>
            <p className="text-xs text-dv-ink-soft">
              {count} item{count === 1 ? "" : "s"}
            </p>
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="rounded-xl p-2 text-dv-ink-soft transition-colors hover:bg-dv-mint-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dv-mint-100 text-dv-teal-700">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <p className="mt-4 font-display text-lg text-dv-teal-900">Your cart is empty</p>
            <p className="mt-2 text-sm text-dv-ink-soft">
              Add a whitening kit and it will show up here.
            </p>
            <Link
              href="/products"
              onClick={closeDrawer}
              className="mt-6 rounded-full bg-dv-teal-900 px-6 py-3 text-sm text-white transition-colors hover:bg-dv-coral-600"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="dv-scrollbar-thin flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-3">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeDrawer}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-dv-mint-100"
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-contain p-2"
                        />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeDrawer}
                          className="line-clamp-2 text-sm font-medium text-dv-teal-900 hover:text-dv-coral-600"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => handleRemove(item.productId, item.name)}
                          aria-label={`Remove ${item.name}`}
                          className="rounded-lg p-1.5 text-dv-ink-soft transition-colors hover:bg-dv-danger-bg hover:text-dv-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-dv-line-strong">
                          <button
                            onClick={() => updateQty(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="p-1.5 text-dv-ink-soft transition-colors hover:text-dv-teal-900 disabled:opacity-40"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQty(item.productId, item.quantity + 1)}
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                            aria-label="Increase quantity"
                            className="p-1.5 text-dv-ink-soft transition-colors hover:text-dv-teal-900 disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-medium text-dv-teal-900">
                          {money(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <footer className="border-t border-dv-line bg-dv-mint-50 px-5 py-4">
              <dl className="space-y-1.5 text-sm">
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
              </dl>
              <p className="mt-1.5 text-xs text-dv-ink-soft">
                Shipping and discounts are calculated at checkout.
              </p>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="rounded-full bg-dv-teal-900 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-dv-coral-600"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="rounded-full border border-dv-line-strong bg-white py-3 text-center text-sm font-medium text-dv-teal-900 transition-colors hover:bg-dv-mint-100"
                >
                  View cart
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

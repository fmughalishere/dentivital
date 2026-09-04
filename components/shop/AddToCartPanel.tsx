"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import type { Product } from "@/types";

export default function AddToCartPanel({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const { toast } = useUI();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  const soldOut = product.stock <= 0;

  function add() {
    addItem(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images?.[0] ?? "",
        stock: product.stock,
      },
      qty
    );
  }

  function handleAdd() {
    if (soldOut) return;
    add();
    toast.success("Added to cart", `${qty} × ${product.name}`);
    openDrawer();
  }

  function handleBuyNow() {
    if (soldOut) return;
    add();
    router.push("/checkout");
  }

  return (
    <div className="mt-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center justify-between rounded-full border border-dv-line-strong bg-white px-1.5 sm:w-36">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="rounded-full p-2.5 text-dv-ink-soft transition-colors hover:text-dv-teal-900 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-8 text-center text-sm font-medium text-dv-teal-900" aria-live="polite">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
            disabled={qty >= (product.stock || 99)}
            aria-label="Increase quantity"
            className="rounded-full p-2.5 text-dv-ink-soft transition-colors hover:text-dv-teal-900 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={soldOut}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-dv-teal-900 px-6 py-3.5 text-sm font-medium text-white shadow-soft transition-all hover:-translate-y-0.5 hover:bg-dv-coral-600 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-dv-ink/25"
        >
          <ShoppingBag className="h-4 w-4" />
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
      </div>

      <button
        onClick={handleBuyNow}
        disabled={soldOut}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-dv-line-strong bg-white px-6 py-3.5 text-sm font-medium text-dv-teal-900 transition-colors hover:border-dv-teal-500 hover:bg-dv-mint-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Zap className="h-4 w-4 text-dv-coral-600" />
        Buy it now
      </button>
    </div>
  );
}

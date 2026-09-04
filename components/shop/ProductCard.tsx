"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import Rating from "@/components/shop/Rating";
import { money } from "@/lib/format";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const { toast } = useUI();
  const [added, setAdded] = useState(false);

  const soldOut = product.stock <= 0;
  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const savings = onSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  function handleAdd() {
    if (soldOut) return;
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? "",
      stock: product.stock,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
    toast.success("Added to cart", product.name);
    openDrawer();
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-dv-line bg-white transition-all duration-300 hover:-translate-y-1 hover:border-dv-teal-300 hover:shadow-lift">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-dv-mint-100"
      >
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-dv-ink-soft">
            No image yet
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {onSale && (
            <span className="rounded-full bg-dv-coral-600 px-2.5 py-1 text-[11px] font-medium text-white">
              Save {savings}%
            </span>
          )}
          {product.featured && !onSale && (
            <span className="rounded-full bg-dv-teal-900 px-2.5 py-1 text-[11px] font-medium text-white">
              Best seller
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-dv-ink px-2.5 py-1 text-[11px] font-medium text-white">
              Sold out
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link
          href={`/products/${product.slug}`}
          className="font-display text-base leading-snug text-dv-teal-900 transition-colors hover:text-dv-coral-600"
        >
          {product.name}
        </Link>

        <Rating value={product.rating} count={product.reviewCount} className="mt-1.5" />

        {product.shortDescription && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-dv-ink-soft">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-lg text-dv-teal-900">{money(product.price)}</span>
          {onSale && (
            <span className="text-sm text-dv-ink-soft line-through">
              {money(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {product.stock > 0 && product.stock <= 10 && (
          <p className="mt-1.5 text-[11px] text-dv-warning">Only {product.stock} left in stock</p>
        )}

        <div className="flex-1" aria-hidden />

        <button
          onClick={handleAdd}
          disabled={soldOut}
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-dv-teal-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dv-coral-600 disabled:cursor-not-allowed disabled:bg-dv-ink/25"
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {soldOut ? "Sold out" : added ? "Added" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

"use client";

import { useMemo, useState } from "react";
import { PackageSearch, Search, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import type { Product } from "@/types";

type Sort = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export default function ProductBrowser({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("featured");

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["all", ...[...set].sort()];
  }, [products]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = products.filter((p) => {
      const matchesCategory = category === "all" || p.category === category;
      const matchesQuery =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.shortDescription?.toLowerCase().includes(term) ||
        p.ingredients?.some((i) => i.toLowerCase().includes(term));
      return matchesCategory && matchesQuery;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case "newest":
        sorted.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
        break;
      default:
        sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return sorted;
  }, [products, query, category, sort]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-dv-line bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dv-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search strips, toothpaste, ingredients…"
            aria-label="Search products"
            className="dv-input pl-10"
          />
        </div>

        <div className="flex gap-3">
          {categories.length > 2 && (
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="dv-input w-auto cursor-pointer capitalize"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dv-ink-soft" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort products"
              className="dv-input w-auto cursor-pointer pl-10"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="mb-5 text-xs text-dv-ink-soft">
        Showing {visible.length} of {products.length} product{products.length === 1 ? "" : "s"}
      </p>

      {visible.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<PackageSearch className="h-5 w-5" />}
          title="No products match your search"
          description="Try a different keyword or clear the filters to see the full range."
        />
      )}
    </>
  );
}

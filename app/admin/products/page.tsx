import type { Metadata } from "next";
import ProductsManager from "@/components/admin/ProductsManager";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Products · Admin" };

export default async function AdminProductsPage() {
  const products = await getProducts({ includeInactive: true });

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow text-dv-coral-600">Catalogue</p>
        <h1 className="mt-2 font-display text-3xl text-dv-teal-900">Products</h1>
        <p className="mt-1 text-sm text-dv-ink-soft">
          Create, edit and retire products. Changes go live immediately.
        </p>
      </header>

      <ProductsManager products={products} />
    </>
  );
}

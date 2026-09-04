import type { Metadata } from "next";
import Image from "next/image";
import ProductBrowser from "@/components/shop/ProductBrowser";
import { getProducts } from "@/lib/data";
import { TEXTURES } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Our Products",
  description:
    "Shop Dentivital teeth whitening strips, toothpaste, mouthwash and brushes — triple action, zero sensitivity.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-dv-line bg-gradient-to-br from-dv-mint-100 to-dv-mint-50 py-14">
        <Image
          src={TEXTURES.clinic}
          alt=""
          fill
          sizes="100vw"
          aria-hidden
          className="-z-10 object-cover opacity-40"
        />
        <div className="dv-container max-w-3xl">
          <p className="eyebrow text-dv-coral-600">Our Products</p>
          <h1 className="mt-3 font-display text-4xl text-dv-teal-900 sm:text-5xl">
            Whitening that takes care of your whole mouth
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-dv-ink-soft sm:text-base">
            Every Dentivital formula is built on the same triple-action promise: visibly whiter
            teeth, restored enamel and healthier gums — with zero sensitivity.
          </p>
        </div>
      </section>

      <section className="dv-container py-12">
        <ProductBrowser products={products} />
      </section>
    </>
  );
}

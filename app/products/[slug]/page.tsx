import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Leaf, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import ProductGallery from "@/components/shop/ProductGallery";
import AddToCartPanel from "@/components/shop/AddToCartPanel";
import ProductCard from "@/components/shop/ProductCard";
import Rating from "@/components/shop/Rating";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { money } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription || product.description.slice(0, 155),
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

const PROMISES = [
  { Icon: Truck, title: "Free shipping over $50", body: "Tracked delivery in 4–7 days." },
  { Icon: ShieldCheck, title: "Zero sensitivity", body: "Safe for sensitive teeth and enamel." },
  { Icon: Leaf, title: "All natural actives", body: "Echinacea, Myrrh, Coconut, Hydroxyapatite." },
  { Icon: RotateCcw, title: "30-day guarantee", body: "Not for you? We'll make it right." },
];

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4);
  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);

  return (
    <>
      <nav aria-label="Breadcrumb" className="border-b border-dv-line bg-white">
        <ol className="dv-container flex items-center gap-1.5 py-3.5 text-xs text-dv-ink-soft">
          <li>
            <Link href="/" className="hover:text-dv-coral-600">
              Home
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <li>
            <Link href="/products" className="hover:text-dv-coral-600">
              Products
            </Link>
          </li>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <li className="truncate text-dv-teal-900" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <section className="dv-container grid gap-12 py-12 md:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images ?? []} name={product.name} />

        <div>
          <p className="eyebrow capitalize text-dv-coral-600">{product.category}</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-dv-teal-900 sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <Rating value={product.rating} count={product.reviewCount} size="md" />
            {product.stock > 0 ? (
              <span className="text-xs text-dv-success">In stock</span>
            ) : (
              <span className="text-xs text-dv-danger">Sold out</span>
            )}
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl text-dv-teal-900">{money(product.price)}</span>
            {onSale && (
              <>
                <span className="text-lg text-dv-ink-soft line-through">
                  {money(product.compareAtPrice!)}
                </span>
                <span className="rounded-full bg-dv-coral-100 px-2.5 py-1 text-[11px] font-medium text-dv-coral-600">
                  Save {money(product.compareAtPrice! - product.price)}
                </span>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="mt-5 text-sm leading-relaxed text-dv-ink-soft">
              {product.shortDescription}
            </p>
          )}

          {product.benefits?.length > 0 && (
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {product.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-dv-ink">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-dv-teal-700" />
                  {benefit}
                </li>
              ))}
            </ul>
          )}

          <AddToCartPanel product={product} />

          {product.stock > 0 && product.stock <= 10 && (
            <p className="mt-3 text-center text-xs text-dv-warning">
              Hurry — only {product.stock} left in stock.
            </p>
          )}

          <div className="mt-8 grid gap-3 rounded-2xl border border-dv-line bg-white p-5 sm:grid-cols-2">
            {PROMISES.map(({ Icon, title, body }) => (
              <div key={title} className="flex gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-dv-teal-700" />
                <div>
                  <p className="text-xs font-medium text-dv-teal-900">{title}</p>
                  <p className="text-[11px] text-dv-ink-soft">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Description + ingredients */}
      <section className="border-t border-dv-line bg-white py-14">
        <div className="dv-container grid gap-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-2xl text-dv-teal-900">About this product</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-dv-ink-soft">
              {(product.description || product.shortDescription)
                .split("\n")
                .filter(Boolean)
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>
          </div>

          {product.ingredients?.length > 0 && (
            <div>
              <h2 className="font-display text-2xl text-dv-teal-900">Key ingredients</h2>
              <ul className="mt-4 space-y-2.5">
                {product.ingredients.map((ingredient) => (
                  <li
                    key={ingredient}
                    className="flex items-center gap-2.5 rounded-xl bg-dv-mint-50 px-4 py-3 text-sm text-dv-ink"
                  >
                    <Leaf className="h-4 w-4 shrink-0 text-dv-teal-700" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="dv-container py-16">
          <h2 className="mb-8 font-display text-2xl text-dv-teal-900">You may also like</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

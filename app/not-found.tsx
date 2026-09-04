import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <section className="dv-container flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dv-mint-100 text-dv-teal-700">
        <Compass className="h-6 w-6" />
      </span>
      <p className="eyebrow mt-6 text-dv-coral-600">404</p>
      <h1 className="mt-2 font-display text-3xl text-dv-teal-900 sm:text-4xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-dv-ink-soft">
        The link may be out of date, or the product may have been retired. Let&apos;s get you back
        to something brighter.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full bg-dv-teal-900 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-dv-coral-600"
        >
          Back to home
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-dv-line-strong bg-white px-7 py-3.5 text-sm font-medium text-dv-teal-900 transition-colors hover:bg-dv-mint-100"
        >
          Browse products
        </Link>
      </div>
    </section>
  );
}

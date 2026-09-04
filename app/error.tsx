"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="dv-container flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-dv-danger-bg text-dv-danger">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h1 className="mt-6 font-display text-3xl text-dv-teal-900">Something went wrong</h1>
      <p className="mt-3 text-sm leading-relaxed text-dv-ink-soft">
        We hit an unexpected error loading this page. Trying again usually sorts it out — if it
        keeps happening, let our team know.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[11px] text-dv-ink-soft">Reference: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 rounded-full bg-dv-teal-900 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-dv-coral-600"
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/contact"
          className="rounded-full border border-dv-line-strong bg-white px-7 py-3.5 text-sm font-medium text-dv-teal-900 transition-colors hover:bg-dv-mint-100"
        >
          Contact support
        </Link>
      </div>
    </section>
  );
}

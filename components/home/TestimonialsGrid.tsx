import Image from "next/image";
import { Quote } from "lucide-react";
import Rating from "@/components/shop/Rating";
import { initials } from "@/lib/format";
import type { Testimonial } from "@/types";

export default function TestimonialsGrid({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((t) => (
        <figure
          key={t._id}
          className="relative flex flex-col rounded-2xl border border-dv-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
        >
          <Quote className="absolute right-5 top-5 h-7 w-7 text-dv-mint-200" aria-hidden />
          <Rating value={t.rating} />
          <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-dv-ink/85">
            “{t.quote}”
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3 border-t border-dv-line pt-4">
            {t.avatar ? (
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-dv-mint-200">
                <Image src={t.avatar} alt="" fill sizes="40px" className="object-cover" />
              </span>
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dv-mint-100 text-xs font-medium text-dv-teal-900">
                {initials(t.name)}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-dv-teal-900">{t.name}</span>
              <span className="block text-[11px] text-dv-ink-soft">
                {t.location || "Verified customer"}
              </span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

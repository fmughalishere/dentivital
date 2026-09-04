import Image from "next/image";
import { TRUST_BADGES } from "@/lib/assets";

export default function TrustMarquee() {
  // Duplicated so the loop can scroll seamlessly by exactly half its width.
  const loop = [...TRUST_BADGES, ...TRUST_BADGES];

  return (
    <section
      className="border-y border-dv-line bg-white py-6"
      aria-label="Why customers trust Dentivital"
    >
      <div className="relative overflow-hidden">
        {/* Soft fades on both edges so the loop reads as endless */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />

        <ul className="flex w-max animate-dv-marquee items-center gap-14">
          {loop.map((badge, i) => (
            <li
              key={`${badge.label}-${i}`}
              className="flex shrink-0 items-center gap-3"
              aria-hidden={i >= TRUST_BADGES.length}
            >
              <span className="relative h-12 w-16">
                <Image
                  src={badge.src}
                  alt={i < TRUST_BADGES.length ? badge.label : ""}
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </span>
              <span className="whitespace-nowrap text-sm text-dv-ink-soft">{badge.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, ShieldCheck, Sparkles } from "lucide-react";
import { HERO_IMAGES } from "@/lib/assets";

/**
 * Slide images come from `lib/assets.ts` (files in `public/images/`).
 * If one is missing the slide still renders — a branded gradient panel takes
 * the image's place instead of a broken image icon.
 */
type Slide = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  body: string;
  cta: { href: string; label: string };
  secondary?: { href: string; label: string };
  image: string;
  imageAlt: string;
  /** Tailwind classes for the slide background. */
  surface: string;
  /** "light" = dark text on a pale surface, "dark" = light text. */
  ink: "light" | "dark";
  /** "cover" fills the frame; "contain" shows the whole graphic. */
  fit?: "cover" | "contain";
  chips?: string[];
};

const SLIDES: Slide[] = [
  {
    id: "easy-safe",
    eyebrow: "Triple Action Formula",
    title: (
      <>
        Teeth Whitening Made
        <br />
        Easy and Safe with{" "}
        <span className="dv-brand-gradient">Dentivital!</span>
      </>
    ),
    body: "The days of complicated whitening routines are over. In just one easy application, you'll get dramatically whiter teeth, repaired enamel, and healthier gums.",
    cta: { href: "/products", label: "Shop Now" },
    secondary: { href: "/about", label: "Meet the founder" },
    image: HERO_IMAGES.easySafe,
    imageAlt: "Customers applying Dentivital whitening strips",
    surface: "bg-gradient-to-br from-dv-mint-200 via-dv-mint-100 to-dv-mint-50",
    ink: "light",
    fit: "contain",
    chips: ["Zero sensitivity", "30-minute treatment", "All natural"],
  },
  {
    id: "busy-lives",
    eyebrow: "Because We Care",
    title: (
      <>
        The Multi-Benefit Teeth
        <br />
        Whitening Solution for
        <br />
        Busy Lives
      </>
    ),
    body: "Unlock a brighter smile without the fuss. Our whitening strips are designed for busy lives — simply apply them, go about your day, and watch your teeth transform.",
    cta: { href: "/products", label: "Shop Now" },
    secondary: { href: "/blogs", label: "Read the journal" },
    image: HERO_IMAGES.busyLives,
    imageAlt: "Coffee, tea, wine and food stains that Dentivital removes",
    surface: "bg-gradient-to-br from-dv-teal-900 via-dv-teal-700 to-dv-green-600",
    ink: "dark",
    fit: "contain",
    chips: ["Coffee", "Tea", "Wine", "Soda"],
  },
  {
    id: "triple-action",
    eyebrow: "Clinically Proven",
    title: (
      <>
        Triple Action. Zero
        <br />
        Sensitivity Whitening
        <br />
        <span className="text-dv-coral-600">with Enamel Restoration</span>
      </>
    ),
    body: "One formula that whitens, rebuilds enamel and improves gum health at the same time — backed by 30 years of clinical practice and natural active ingredients.",
    cta: { href: "/products", label: "Shop Now" },
    secondary: { href: "/about", label: "How it works" },
    image: HERO_IMAGES.tripleAction,
    imageAlt: "Before and after comparison of teeth whitened with Dentivital",
    surface: "bg-gradient-to-br from-dv-mint-100 via-dv-mint-50 to-dv-plum-100",
    ink: "light",
    fit: "contain",
    chips: ["Whitening", "Gum Health", "Repair Enamel"],
  },
];

const INTERVAL_MS = 6000;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const touchStartX = useRef<number | null>(null);
  const regionRef = useRef<HTMLElement>(null);

  const go = useCallback((next: number) => {
    setIndex(((next % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Auto-advance. Pauses on hover/focus, when the tab is hidden, and when the
  // visitor prefers reduced motion.
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduced) return;

    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  // Arrow-key navigation while the hero has focus.
  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <section
      ref={regionRef}
      tabIndex={-1}
      aria-roledescription="carousel"
      aria-label="Dentivital highlights"
      className="relative isolate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 48) (delta < 0 ? next : prev)();
        touchStartX.current = null;
      }}
    >
      {/* Slides are stacked and cross-faded so the height never jumps. */}
      <div className="relative">
        {SLIDES.map((slide, i) => {
          const active = i === index;
          const dark = slide.ink === "dark";

          return (
            <article
              key={slide.id}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SLIDES.length}`}
              aria-hidden={!active}
              className={`${slide.surface} ${
                active
                  ? "relative opacity-100"
                  : "pointer-events-none absolute inset-0 opacity-0"
              } transition-opacity duration-700 ease-out`}
            >
              <div className="dv-container grid items-center gap-10 py-14 md:grid-cols-[1.05fr_1fr] md:py-20 lg:gap-16">
                <div className={active ? "animate-dv-fade-up" : ""}>
                  <p
                    className={`eyebrow ${dark ? "text-dv-coral-500" : "text-dv-coral-600"}`}
                  >
                    {slide.eyebrow}
                  </p>

                  <h1
                    className={`mt-4 font-display text-[2rem] leading-[1.1] font-semibold sm:text-4xl lg:text-[3.35rem] ${
                      dark ? "text-white" : "text-dv-teal-900"
                    }`}
                  >
                    {slide.title}
                  </h1>

                  <p
                    className={`mt-5 max-w-lg text-sm leading-relaxed sm:text-base ${
                      dark ? "text-white/80" : "text-dv-ink-soft"
                    }`}
                  >
                    {slide.body}
                  </p>

                  {slide.chips && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {slide.chips.map((chip) => (
                        <li
                          key={chip}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${
                            dark
                              ? "bg-white/15 text-white backdrop-blur"
                              : "bg-white/80 text-dv-teal-900 shadow-soft backdrop-blur"
                          }`}
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-dv-coral-500" />
                          {chip}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      href={slide.cta.href}
                      className="group inline-flex items-center gap-2 rounded-full bg-dv-coral-600 px-7 py-3.5 text-sm font-medium text-white shadow-lift transition-all hover:-translate-y-0.5 hover:bg-dv-coral-500"
                    >
                      {slide.cta.label}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    {slide.secondary && (
                      <Link
                        href={slide.secondary.href}
                        className={`dv-link-underline text-sm ${
                          dark ? "text-white/85" : "text-dv-teal-900"
                        }`}
                      >
                        {slide.secondary.label}
                      </Link>
                    )}
                  </div>

                  <div
                    className={`mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs ${
                      dark ? "text-white/60" : "text-dv-ink-soft"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-dv-coral-500" />
                      100,000+ sensitive smiles
                    </span>
                    <span>Free shipping over $50</span>
                  </div>
                </div>

                {/* Visual */}
                <div className="relative">
                  <div
                    className={`relative aspect-[4/3.4] w-full overflow-hidden rounded-[2rem] sm:aspect-[4/3] ${
                      dark ? "bg-white/10" : "bg-white/70"
                    } shadow-lift`}
                  >
                    {failed[slide.id] ? (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-dv-mint-100 to-dv-coral-100 text-center">
                        <ShieldCheck className="h-9 w-9 text-dv-teal-700" />
                        <p className="px-6 text-xs text-dv-ink-soft">
                          Save your hero image to{" "}
                          <code className="rounded bg-white/70 px-1.5 py-0.5">
                            public{slide.image}
                          </code>
                        </p>
                      </div>
                    ) : (
                      <Image
                        src={slide.image}
                        alt={slide.imageAlt}
                        fill
                        priority={i === 0}
                        sizes="(max-width: 768px) 100vw, 45vw"
                        className={
                          slide.fit === "contain"
                            ? "object-contain p-4"
                            : `object-cover ${active ? "animate-dv-ken-burns" : ""}`
                        }
                        onError={() => setFailed((f) => ({ ...f, [slide.id]: true }))}
                      />
                    )}
                  </div>

                  {/* Floating trust badge */}
                  <div className="absolute -bottom-4 left-4 hidden items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-lift sm:flex">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-dv-mint-100">
                      <ShieldCheck className="h-4.5 w-4.5 text-dv-teal-700" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-dv-teal-900">Sensitivity Safe</p>
                      <p className="text-[10px] text-dv-ink-soft">Dentist formulated</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Controls */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/85 p-2.5 text-dv-teal-900 shadow-soft backdrop-blur transition-all hover:bg-white md:block"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/85 p-2.5 text-dv-teal-900 shadow-soft backdrop-blur transition-all hover:bg-white md:block"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-soft backdrop-blur">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-7 bg-dv-coral-600" : "w-2.5 bg-dv-teal-900/25 hover:bg-dv-teal-900/45"
              }`}
            />
          ))}
          <span className="mx-0.5 h-3.5 w-px bg-dv-line-strong" aria-hidden />
          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume slideshow" : "Pause slideshow"}
            className="text-dv-teal-900/70 transition-colors hover:text-dv-teal-900"
          >
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </section>
  );
}

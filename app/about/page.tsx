import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartPulse, Leaf, Microscope, ShieldCheck } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/AnimatedSection";
import { FOUNDER } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Who We Are",
  description:
    "Dentivital was born from a vision to transform dental care — natural teeth whitening with enamel restoration and gum health improvement.",
};

const PILLARS = [
  {
    Icon: Microscope,
    title: "Research first",
    body: "Every formula starts in the lab, backed by clinical studies and 30 years of chairside practice.",
  },
  {
    Icon: Leaf,
    title: "Naturally derived",
    body: "Echinacea, Myrrh, Coconut oil and Hydroxyapatite — actives chosen for what they do beyond whitening.",
  },
  {
    Icon: ShieldCheck,
    title: "Zero sensitivity",
    body: "A gentle, enamel-safe system designed specifically for people who react to conventional strips.",
  },
  {
    Icon: HeartPulse,
    title: "Whole-mouth health",
    body: "Your mouth is the entry point to the body. We treat gum health as seriously as shade.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-dv-line bg-gradient-to-br from-dv-mint-100 via-dv-mint-50 to-dv-coral-100/40 py-16">
        <div className="dv-container max-w-3xl">
          <p className="eyebrow text-dv-coral-600">Our Brand Story</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-dv-teal-900 sm:text-5xl">
            We believe in natural teeth whitening but with enamel restoration and gum health
            improvement as well.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-dv-ink-soft sm:text-base">
            Oral health re-imagined, whitening strips re-engineered.
          </p>
        </div>
      </section>

      <section className="dv-container grid gap-12 py-16 md:grid-cols-2">
        <FadeIn>
          <h2 className="font-display text-3xl text-dv-teal-900">How Dentivital started</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-dv-ink-soft">
            <p>
              Dentivital was born from a vision to transform dental care. Our founder, Dr. Naseem
              Chaudhry, recognised that traditional whitening and dental products often failed to
              address underlying oral health issues, leading to bigger problems down the line.
            </p>
            <p>
              He saw an opportunity in the 30 minutes that whitening strips are typically applied —
              time that could deliver therapeutic benefits far beyond whitening.
            </p>
            <p>
              The team got to work developing &ldquo;triple action, zero sensitivity whitening with
              enamel restoration&rdquo; products to optimise that short window. We incorporated
              natural, gentle but effective ingredients backed by extensive research to create an
              experience that whitens teeth, strengthens enamel and improves gum health — all
              without sensitivity.
            </p>
          </div>
          <Link
            href="/products"
            className="dv-link-underline group mt-6 inline-flex items-center gap-2 text-sm text-dv-teal-900"
          >
            Discover the range
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </FadeIn>

        <FadeIn delay={0.15} className="relative mx-auto aspect-[4/5] w-full max-w-md">
          <Image
            src={FOUNDER.portrait}
            alt="Dr. Naseem Chaudhry, founder of Dentivital"
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-contain object-bottom"
          />
        </FadeIn>
      </section>

      <section className="bg-dv-teal-900 py-16 text-dv-mint-50">
        <div className="dv-container max-w-3xl text-center">
          <p className="eyebrow text-dv-coral-500">Our Founder</p>
          <blockquote className="mt-4 font-display text-2xl leading-snug sm:text-3xl">
            &ldquo;A healthy smile is more than just white teeth. It&apos;s a balanced oral
            ecosystem.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm leading-relaxed text-dv-mint-50/75">
            Our patent-pending formulations offer triple action, zero sensitivity whitening with
            enamel restoration and improved gum health — using all-natural ingredients including
            Echinacea, Coconut and Myrrh oils, and Hydroxyapatite.
          </p>
          <p className="mt-4 text-sm text-dv-mint-50/60">— Dr. Naseem Chaudhry, CEO &amp; Founder</p>
        </div>
      </section>

      <section className="dv-container py-16">
        <FadeIn className="mx-auto mb-10 max-w-2xl text-center">
          <p className="eyebrow text-dv-coral-600">What We Stand For</p>
          <h2 className="mt-2 font-display text-3xl text-dv-teal-900">
            Restoring smiles, revitalising health, reclaiming confidence
          </h2>
        </FadeIn>

        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ Icon, title, body }) => (
            <StaggerItem
              key={title}
              className="rounded-2xl border border-dv-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-dv-mint-100 text-dv-teal-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg text-dv-teal-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dv-ink-soft">{body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}

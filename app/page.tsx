import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf, PackageSearch, Sparkles } from "lucide-react";
import HeroSlider from "@/components/home/HeroSlider";
import TrustMarquee from "@/components/home/TrustMarquee";
import TestimonialsGrid from "@/components/home/TestimonialsGrid";
import FaqAccordion from "@/components/home/FaqAccordion";
import NewsletterForm from "@/components/forms/NewsletterForm";
import ProductCard from "@/components/shop/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import { FadeIn, Stagger, StaggerItem } from "@/components/AnimatedSection";
import { getFaqs, getFeaturedProducts, getTestimonials } from "@/lib/data";
import {
  BENEFIT_ICONS,
  FOUNDER,
  INGREDIENT_IMAGES,
  LEAD_MAGNET,
  SOCIAL_PROOF,
  TEXTURES,
} from "@/lib/assets";

const INGREDIENTS = [
  {
    name: "Echinacea",
    points: ["Reduces gum inflammation", "Boosts the immune system", "Prevents mouth infections"],
    img: INGREDIENT_IMAGES.echinacea,
  },
  {
    name: "Myrrh",
    points: ["Relieves gum pain", "Heals boggy gums", "Prevents periodontitis", "Tightens gum tissues"],
    img: INGREDIENT_IMAGES.myrrh,
  },
  {
    name: "Coconut Oil",
    points: ["Whitens teeth", "Fights harmful bacteria", "Helps prevent cavities", "Restores enamel"],
    img: INGREDIENT_IMAGES.coconutOil,
  },
  {
    name: "Hydroxyapatite",
    points: ["Remineralizes tooth enamel", "Reverses tooth decay", "Polishes teeth"],
    img: INGREDIENT_IMAGES.hydroxyapatite,
  },
];

export default async function Home() {
  const [featured, testimonials, faqs] = await Promise.all([
    getFeaturedProducts(4),
    getTestimonials(6),
    getFaqs(),
  ]);

  return (
    <>
      <HeroSlider />
      <TrustMarquee />

      {/* ------------------------------------------------ featured products */}
      <section className="dv-container py-20">
        <FadeIn className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-dv-coral-600">Best Sellers</p>
            <h2 className="mt-2 font-display text-3xl text-dv-teal-900 sm:text-4xl">
              Shop the whitening line
            </h2>
          </div>
          <Link
            href="/products"
            className="dv-link-underline group flex items-center gap-1.5 text-sm text-dv-teal-900"
          >
            View all products
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </FadeIn>

        {featured.length > 0 ? (
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <StaggerItem key={product._id} className="h-full">
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <EmptyState
            icon={<PackageSearch className="h-5 w-5" />}
            title="No products yet"
            description="Connect MongoDB and run `npm run seed` to load the Dentivital catalogue, or add products from the admin panel."
          />
        )}
      </section>

      {/* ------------------------------------------------- problem/solution */}
      <section className="relative isolate overflow-hidden bg-dv-teal-900 py-20 text-dv-mint-50">
        <Image
          src={TEXTURES.teal}
          alt=""
          fill
          sizes="100vw"
          aria-hidden
          className="-z-10 object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="dv-container">
          <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
            <p className="eyebrow text-dv-coral-500">Do You Know?</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">
              Whitening strips can do a lot more than just whiten
            </h2>
          </FadeIn>

          <div className="grid gap-12 md:grid-cols-2">
            <FadeIn>
              <p className="eyebrow text-dv-coral-500">The Problem</p>
              <h3 className="mt-3 font-display text-2xl">
                Whitening alone was never the whole story.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-dv-mint-50/75">
                Traditional dental care and whitening products often fail to address underlying
                issues such as weak enamel and poor gum health, leading to broader health problems.
                After all, your mouth is the entry point to the body — maintaining dental and gum
                health is as crucial as having a bright, clean smile.
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="eyebrow text-dv-coral-500">The Dentivital Solution</p>
              <h3 className="mt-3 font-display text-2xl">
                30 minutes of contact time, put to work.
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-dv-mint-50/75">
                Our R&amp;D team developed a triple-action, zero-sensitivity formula that uses the
                strip&apos;s contact time to deliver enamel restoration and gum health benefits —
                backed by natural ingredients, research and clinical studies.
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
                {[
                  "Enamel Restoration",
                  "Zero Sensitivity Whitening",
                  "Gum Health Improvement",
                  "Made with Natural Ingredients",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0 text-dv-coral-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- ingredients */}
      <section className="dv-container py-20">
        <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow text-dv-coral-600">It&apos;s In the All Natural Ingredients</p>
          <h2 className="mt-2 font-display text-3xl text-dv-teal-900 sm:text-4xl">
            Our revolutionary approach to oral health
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-dv-ink-soft">
            Four actives, each chosen for what it does beyond whitening.
          </p>
        </FadeIn>

        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INGREDIENTS.map((ingredient) => (
            <StaggerItem
              key={ingredient.name}
              className="group h-full rounded-2xl border border-dv-line bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-dv-teal-300 hover:shadow-lift"
            >
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full bg-dv-mint-50">
                <Image
                  src={ingredient.img}
                  alt={ingredient.name}
                  fill
                  sizes="96px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <h3 className="mt-4 font-display text-lg text-dv-teal-900">{ingredient.name}</h3>
              <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-dv-ink-soft">
                {ingredient.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ----------------------------------------------------------- founder */}
      <section className="relative isolate overflow-hidden py-20">
        <Image
          src={TEXTURES.marble}
          alt=""
          fill
          sizes="100vw"
          aria-hidden
          className="-z-10 object-cover"
        />
        <div className="dv-container grid items-center gap-12 md:grid-cols-2">
          <FadeIn>
            <p className="eyebrow text-dv-coral-600">Our CEO / Founder</p>
            <h2 className="mt-3 font-display text-3xl text-dv-teal-900 sm:text-4xl">
              Dr. Naseem Chaudhry
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-dv-ink-soft">
              &ldquo;Current teeth whitening products focus on the whitening aspect only, but I
              believe there&apos;s a better approach based on my 30 years of clinical practice.
              I&apos;ve created a more effective solution through innovative and thoughtful product
              development. Our formulations offer triple action, zero sensitivity whitening with
              enamel restoration and improved gum health.&rdquo;
            </p>
            <p className="mt-4 text-sm leading-relaxed text-dv-ink-soft">
              My products use all-natural ingredients including Echinacea, Coconut and Myrrh oils,
              and Hydroxyapatite — strengthening enamel, promoting gum health and safeguarding the
              oral microbiome.
            </p>

            <ul className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
              {BENEFIT_ICONS.map((benefit) => (
                <li key={benefit.label} className="flex flex-col items-center gap-2 text-center">
                  <span className="relative h-10 w-10">
                    <Image
                      src={benefit.src}
                      alt=""
                      fill
                      sizes="40px"
                      aria-hidden
                      className="object-contain"
                    />
                  </span>
                  <span className="text-[11px] leading-tight text-dv-ink-soft">
                    {benefit.label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-full bg-dv-coral-600 px-7 py-3.5 text-sm font-medium text-white shadow-lift transition-all hover:-translate-y-0.5 hover:bg-dv-coral-500"
              >
                Shop Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <span className="relative hidden h-6 w-12 shrink-0 sm:block">
                <Image src={FOUNDER.arrow} alt="" fill sizes="48px" aria-hidden className="object-contain" />
              </span>
              <p className="max-w-xs text-sm text-dv-ink-soft">
                I spent <strong className="text-dv-teal-900">30 years</strong> researching this, but
                you only need <strong className="text-dv-teal-900">30 minutes</strong> to see the
                results.
              </p>
            </div>
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
        </div>
      </section>

      {/* ------------------------------------------------------ social proof */}
      <section className="dv-container py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <FadeIn>
            <h2 className="font-display text-3xl leading-tight text-dv-teal-900 sm:text-4xl">
              Loved by{" "}
              <span className="dv-brand-gradient block text-5xl sm:text-6xl">100,000+</span>
              Sensitive Smiles
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-dv-ink-soft">
              Why trust marketing claims? Hear from real customers how our natural teeth whitening
              brightened their smile gently and effectively. Over 100,000 happy testimonials and
              counting.
            </p>

            <div className="relative mt-8 aspect-[4/3] w-full max-w-sm">
              <Image
                src={SOCIAL_PROOF.packshot}
                alt="Dentivital whitening strips pack"
                fill
                sizes="(max-width: 768px) 90vw, 380px"
                className="object-contain"
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="relative aspect-square overflow-hidden rounded-[2rem]">
            <Image
              src={SOCIAL_PROOF.collage}
              alt="Dentivital customers holding the whitening strips"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </FadeIn>
        </div>
      </section>

      {/* ------------------------------------------------------ testimonials */}
      {testimonials.length > 0 && (
        <section className="dv-container pb-20">
          <TestimonialsGrid testimonials={testimonials} />
        </section>
      )}

      {/* ------------------------------------------------------- lead magnet */}
      <section className="dv-container pb-20">
        <div className="grid items-center gap-10 overflow-hidden rounded-[2rem] bg-dv-teal-900 p-10 text-dv-mint-50 md:grid-cols-2 md:p-14">
          <FadeIn>
            <p className="eyebrow text-dv-coral-500">Free Guide</p>
            <h2 className="mt-2 font-display text-3xl">The Ultimate Oral Care Handbook</h2>
            <p className="mt-3 text-sm leading-relaxed text-dv-mint-50/75">
              Get instant access to our expert-approved oral care guide, filled with actionable tips
              for maintaining healthy teeth and gums.
            </p>
            <div className="mt-5 flex items-center gap-2 text-dv-coral-500">
              <Leaf className="h-4 w-4" />
              <span className="text-xs">Made with natural ingredients</span>
            </div>
            <div className="mt-6">
              <NewsletterForm />
            </div>
            <p className="mt-3 text-xs text-dv-mint-50/60">
              No spam — unsubscribe any time. Questions? Message our support team from the contact
              page.
            </p>
          </FadeIn>

          <FadeIn delay={0.15} className="relative aspect-[4/3] w-full">
            <Image
              src={LEAD_MAGNET.tablet}
              alt="The Complete Oral Healthcare Guide shown on a tablet"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-contain"
            />
          </FadeIn>
        </div>
      </section>

      {/* --------------------------------------------------------------- FAQ */}
      {faqs.length > 0 && (
        <section className="dv-container max-w-4xl pb-24">
          <FadeIn className="mb-8 text-center">
            <p className="eyebrow text-dv-coral-600">FAQs</p>
            <h2 className="mt-2 font-display text-3xl text-dv-teal-900 sm:text-4xl">
              Answers to your frequently asked questions
            </h2>
          </FadeIn>
          <FaqAccordion faqs={faqs} />
        </section>
      )}
    </>
  );
}
